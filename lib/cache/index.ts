/**
 * Cache System with Redis + Memory Fallback
 * 
 * Strategy:
 * - Redis for shared cache (if available)
 * - In-memory Map as fallback
 * - File system for large end-state files
 */

import Redis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';

// ============ TYPES ============

export interface CacheOptions {
  ttl?: number; // seconds
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
}

// ============ REDIS PROVIDER ============

let redisClient: Redis | null = null;
let redisConnected = false;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[Cache] No REDIS_URL configured, using memory fallback');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log('[Cache] Redis connected');
      redisConnected = true;
    });

    redisClient.on('error', (err) => {
      console.error('[Cache] Redis error:', err.message);
      redisConnected = false;
    });

    redisClient.on('close', () => {
      console.log('[Cache] Redis disconnected');
      redisConnected = false;
    });

    // Try to connect
    redisClient.connect().catch(() => {
      console.log('[Cache] Redis connection failed, using memory fallback');
      redisClient = null;
    });

    return redisClient;
  } catch {
    console.log('[Cache] Redis init failed, using memory fallback');
    return null;
  }
}

class RedisProvider implements CacheProvider {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const data = JSON.stringify(value);
    if (options?.ttl) {
      await this.client.setex(key, options.ttl, data);
    } else {
      await this.client.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}

// ============ MEMORY PROVIDER ============

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt?: number;
}

const memoryStore = new Map<string, MemoryCacheEntry<unknown>>();

class MemoryProvider implements CacheProvider {
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryStore.get(key) as MemoryCacheEntry<T> | undefined;
    if (!entry) return null;
    
    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const entry: MemoryCacheEntry<T> = { value };
    if (options?.ttl) {
      entry.expiresAt = Date.now() + options.ttl * 1000;
    }
    memoryStore.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    memoryStore.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = memoryStore.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return false;
    }
    
    return true;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const result: string[] = [];
    
    for (const key of memoryStore.keys()) {
      if (regex.test(key)) {
        result.push(key);
      }
    }
    
    return result;
  }
}

// ============ HYBRID CACHE ============

class HybridCache implements CacheProvider {
  private redis: RedisProvider | null = null;
  private memory: MemoryProvider = new MemoryProvider();

  constructor() {
    const client = getRedisClient();
    // Create the provider even if the connection isn't established yet.
    // getProvider() will only use it when redisConnected becomes true.
    if (client) {
      this.redis = new RedisProvider(client);
    }
  }

  private getProvider(): CacheProvider {
    // Always check if Redis is connected
    if (this.redis && redisConnected) {
      return this.redis;
    }
    return this.memory;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.getProvider().get<T>(key);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    return this.getProvider().set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    return this.getProvider().delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.getProvider().exists(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.getProvider().keys(pattern);
  }

  isRedisConnected(): boolean {
    return redisConnected;
  }
}

// ============ FILE CACHE (for large files) ============

const CACHE_DIR = path.join(process.cwd(), '.cache', 'grid');

export class FileCache {
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      this.initialized = true;
    } catch (err) {
      console.error('[FileCache] Failed to create cache dir:', err);
    }
  }

  static getFilePath(key: string): string {
    // Sanitize key for filename
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(CACHE_DIR, `${safeKey}.json`);
  }

  static async get<T>(key: string): Promise<T | null> {
    await this.init();
    
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    
    try {
      const filePath = this.getFilePath(key);
      await fs.writeFile(filePath, JSON.stringify(value), 'utf-8');
    } catch (err) {
      console.error('[FileCache] Failed to write:', err);
    }
  }

  static async exists(key: string): Promise<boolean> {
    await this.init();
    
    try {
      const filePath = this.getFilePath(key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  static async clear(): Promise<void> {
    try {
      const files = await fs.readdir(CACHE_DIR);
      await Promise.all(
        files.map(f => fs.unlink(path.join(CACHE_DIR, f)))
      );
    } catch {
      // Directory doesn't exist or is empty
    }
  }
}

// ============ EXPORTS ============

// Singleton cache instance
let cacheInstance: HybridCache | null = null;

export function getCache(): HybridCache {
  if (!cacheInstance) {
    cacheInstance = new HybridCache();
  }
  return cacheInstance;
}

// Cache key generators
export const CacheKeys = {
  teamData: (teamId: string) => `team:${teamId}:data`,
  teamSeries: (teamId: string) => `team:${teamId}:series`,
  teamSeriesIds: (teamId: string, titleId: string, first: number) => `team:${teamId}:series:${titleId}:${first}`,
  seriesEndState: (seriesId: string) => `series:${seriesId}:endstate`,
  seriesEventsFeatures: (seriesId: string) => `series:${seriesId}:events:features`,
  prepareJob: (jobId: string) => `job:${jobId}`,
  headToHead: (team1: string, team2: string) => {
    const sorted = [team1, team2].sort();
    return `h2h:${sorted[0]}:${sorted[1]}`;
  },
};

// Default TTLs (in seconds)
export const CacheTTL = {
  TEAM_DATA: 3600,      // 1 hour
  SERIES_IDS: 3600,     // 1 hour
  END_STATE: 86400,     // 24 hours (files rarely change)
  EVENTS_FEATURES: 86400, // 24 hours (features rarely change for finished series)
  JOB_STATUS: 300,      // 5 minutes
};

export { HybridCache, MemoryProvider, RedisProvider };
