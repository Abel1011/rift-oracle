/**
 * Draft Configuration Context
 * Stores the selected teams and their data for the draft simulation
 * Persists to localStorage for cross-tab synchronization
 */
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface TeamConfig {
  id: string;
  name: string;
  nameShortened?: string;
  logoUrl?: string;
}

export interface DraftConfig {
  blueTeam: TeamConfig | null;
  redTeam: TeamConfig | null;
  isConfigured: boolean;
}

interface DraftConfigContextType {
  config: DraftConfig;
  isHydrated: boolean;
  setBlueTeam: (team: TeamConfig | null) => void;
  setRedTeam: (team: TeamConfig | null) => void;
  swapTeams: () => void;
  resetConfig: () => void;
}

// Storage key for localStorage persistence
const STORAGE_KEY = 'c9-draft-config';

// Cloud9 as default team
const CLOUD9_DEFAULT: TeamConfig = {
  id: '47351',
  name: 'Cloud9',
  nameShortened: 'C9',
  logoUrl: 'https://cdn.grid.gg/assets/team-logos/f7d208601ddc141eb136d9aba8ae7156',
};

const initialConfig: DraftConfig = {
  blueTeam: CLOUD9_DEFAULT,
  redTeam: null,
  isConfigured: false,
};

// Helper to load config from localStorage
function loadFromStorage(): DraftConfig {
  if (typeof window === 'undefined') return initialConfig;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DraftConfig;
      // Validate the structure
      if (parsed && typeof parsed === 'object') {
        return {
          blueTeam: parsed.blueTeam || initialConfig.blueTeam,
          redTeam: parsed.redTeam || null,
          isConfigured: !!(parsed.blueTeam && parsed.redTeam),
        };
      }
    }
  } catch (e) {
    console.error('[DraftConfig] Failed to load from storage:', e);
  }
  
  return initialConfig;
}

// Helper to save config to localStorage
function saveToStorage(config: DraftConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    
    // Dispatch custom event for same-tab listeners
    const event = new CustomEvent('c9-draft-config-change', { detail: config });
    window.dispatchEvent(event);
  } catch (e) {
    console.error('[DraftConfig] Failed to save to storage:', e);
  }
}

const DraftConfigContext = createContext<DraftConfigContextType | undefined>(undefined);

export function DraftConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DraftConfig>(initialConfig);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedConfig = loadFromStorage();
    setConfig(storedConfig);
    setIsHydrated(true);
  }, []);
  
  // Listen for changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue) as DraftConfig;
          setConfig(newConfig);
        } catch (e) {
          console.error('[DraftConfig] Failed to parse storage event:', e);
        }
      }
    };
    
    // Listen for same-tab updates
    const handleCustomEvent = (event: CustomEvent<DraftConfig>) => {
      // Ignore - this is our own update
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('c9-draft-config-change', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('c9-draft-config-change', handleCustomEvent as EventListener);
    };
  }, []);
  
  // Save to localStorage whenever config changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(config);
    }
  }, [config, isHydrated]);

  const setBlueTeam = useCallback((team: TeamConfig | null) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        blueTeam: team,
        isConfigured: !!(team && prev.redTeam),
      };
      return newConfig;
    });
  }, []);

  const setRedTeam = useCallback((team: TeamConfig | null) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        redTeam: team,
        isConfigured: !!(prev.blueTeam && team),
      };
      return newConfig;
    });
  }, []);

  const swapTeams = useCallback(() => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        blueTeam: prev.redTeam,
        redTeam: prev.blueTeam,
      };
      return newConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(initialConfig);
  }, []);

  return (
    <DraftConfigContext.Provider value={{ config, isHydrated, setBlueTeam, setRedTeam, swapTeams, resetConfig }}>
      {children}
    </DraftConfigContext.Provider>
  );
}

export function useDraftConfig() {
  const context = useContext(DraftConfigContext);
  if (!context) {
    throw new Error('useDraftConfig must be used within a DraftConfigProvider');
  }
  return context;
}
