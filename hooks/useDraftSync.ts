'use client';

import { useEffect, useCallback, useRef } from 'react';
import { DraftState } from '@/lib/types';
import { DraftSyncData, getGlobalSyncAdapter } from '@/lib/sync';

interface UseDraftSyncOptions {
  // The source identifier for this hook instance
  source: 'draft' | 'analysis';
  
  // Callback when receiving state from another source
  onStateReceived?: (state: DraftState) => void;
  
  // Whether to load initial state from sync
  loadInitialState?: boolean;
}

interface UseDraftSyncReturn {
  // Publish current draft state to sync
  publishState: (state: DraftState) => void;
  
  // Get current synced state
  getCurrentState: () => DraftState | null;
}

export function useDraftSync(options: UseDraftSyncOptions): UseDraftSyncReturn {
  const { source, onStateReceived, loadInitialState = true } = options;
  const adapterRef = useRef(getGlobalSyncAdapter());
  const lastPublishedRef = useRef<number>(0);

  // Subscribe to state changes
  useEffect(() => {
    const adapter = adapterRef.current;

    // Load initial state if requested
    if (loadInitialState && onStateReceived) {
      const currentState = adapter.getCurrentState();
      if (currentState && currentState.source !== source) {
        onStateReceived(currentState.draftState);
      }
    }

    // Subscribe to updates
    const unsubscribe = adapter.subscribe((data: DraftSyncData) => {
      // Ignore our own updates
      if (data.source === source) return;
      
      // Ignore old updates
      if (data.timestamp <= lastPublishedRef.current) return;
      
      if (onStateReceived) {
        onStateReceived(data.draftState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [source, onStateReceived, loadInitialState]);

  // Publish state changes
  const publishState = useCallback((state: DraftState) => {
    const timestamp = Date.now();
    lastPublishedRef.current = timestamp;
    
    adapterRef.current.publish({
      draftState: state,
      timestamp,
      source
    });
  }, [source]);

  // Get current synced state
  const getCurrentState = useCallback((): DraftState | null => {
    const data = adapterRef.current.getCurrentState();
    return data?.draftState ?? null;
  }, []);

  return {
    publishState,
    getCurrentState
  };
}
