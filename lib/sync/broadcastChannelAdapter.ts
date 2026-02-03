// BroadcastChannel-based sync adapter
// More efficient than localStorage for cross-tab communication
// Falls back to localStorage if BroadcastChannel is not available

import { DraftSyncAdapter, DraftSyncData } from './types';
import { createLocalStorageAdapter } from './localStorageAdapter';

const CHANNEL_NAME = 'c9-draft-sync-channel';

export function createBroadcastChannelAdapter(): DraftSyncAdapter {
  // Fallback to localStorage if BroadcastChannel is not supported
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    console.warn('[BroadcastChannelAdapter] BroadcastChannel not available, falling back to localStorage');
    return createLocalStorageAdapter();
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  const listeners: Set<(data: DraftSyncData) => void> = new Set();
  let lastState: DraftSyncData | null = null;

  channel.onmessage = (event: MessageEvent<DraftSyncData>) => {
    lastState = event.data;
    listeners.forEach(callback => callback(event.data));
  };

  return {
    subscribe(callback: (data: DraftSyncData) => void): () => void {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    publish(data: DraftSyncData): void {
      lastState = data;
      channel.postMessage(data);
      // Also notify local listeners
      listeners.forEach(callback => callback(data));
    },

    getCurrentState(): DraftSyncData | null {
      return lastState;
    },

    destroy(): void {
      channel.close();
      listeners.clear();
    }
  };
}
