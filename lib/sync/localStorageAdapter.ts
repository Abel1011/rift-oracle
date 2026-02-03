// LocalStorage-based sync adapter
// Easy to use for demo, works across tabs in same browser

import { DraftSyncAdapter, DraftSyncData } from './types';

const STORAGE_KEY = 'c9-draft-sync';
const STORAGE_EVENT_KEY = 'c9-draft-sync-event';

export function createLocalStorageAdapter(): DraftSyncAdapter {
  const listeners: Set<(data: DraftSyncData) => void> = new Set();
  
  // Handle storage events from other tabs
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const data: DraftSyncData = JSON.parse(event.newValue);
        listeners.forEach(callback => callback(data));
      } catch (e) {
        console.error('[LocalStorageAdapter] Failed to parse storage event:', e);
      }
    }
  };

  // Handle custom events for same-tab updates
  const handleCustomEvent = (event: CustomEvent<DraftSyncData>) => {
    listeners.forEach(callback => callback(event.detail));
  };

  // Setup listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(STORAGE_EVENT_KEY as any, handleCustomEvent as EventListener);
  }

  return {
    subscribe(callback: (data: DraftSyncData) => void): () => void {
      listeners.add(callback);
      
      // Return unsubscribe function
      return () => {
        listeners.delete(callback);
      };
    },

    publish(data: DraftSyncData): void {
      if (typeof window === 'undefined') return;
      
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        
        // Dispatch custom event for same-tab listeners
        // (storage events only fire in OTHER tabs)
        const customEvent = new CustomEvent(STORAGE_EVENT_KEY, { detail: data });
        window.dispatchEvent(customEvent);
      } catch (e) {
        console.error('[LocalStorageAdapter] Failed to publish:', e);
      }
    },

    getCurrentState(): DraftSyncData | null {
      if (typeof window === 'undefined') return null;
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('[LocalStorageAdapter] Failed to get current state:', e);
      }
      return null;
    },

    destroy(): void {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener(STORAGE_EVENT_KEY as any, handleCustomEvent as EventListener);
      }
      listeners.clear();
    }
  };
}
