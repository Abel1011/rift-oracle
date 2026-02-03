// Draft Synchronization Service
// Abstracted to easily swap between different sync mechanisms

export * from './types';
export { createLocalStorageAdapter } from './localStorageAdapter';
export { createBroadcastChannelAdapter } from './broadcastChannelAdapter';

import { DraftSyncAdapter } from './types';
import { createLocalStorageAdapter } from './localStorageAdapter';
import { createBroadcastChannelAdapter } from './broadcastChannelAdapter';

// Sync adapter types
export type SyncAdapterType = 'localStorage' | 'broadcastChannel' | 'websocket';

// Factory function to create the appropriate adapter
export function createSyncAdapter(type: SyncAdapterType = 'localStorage'): DraftSyncAdapter {
  switch (type) {
    case 'broadcastChannel':
      return createBroadcastChannelAdapter();
    case 'websocket':
      // TODO: Implement WebSocket adapter for multi-device sync
      console.warn('[SyncService] WebSocket adapter not implemented, falling back to localStorage');
      return createLocalStorageAdapter();
    case 'localStorage':
    default:
      return createLocalStorageAdapter();
  }
}

// Singleton instance for the app
let globalAdapter: DraftSyncAdapter | null = null;

export function getGlobalSyncAdapter(): DraftSyncAdapter {
  if (!globalAdapter) {
    // Default to localStorage for demo
    // Change this to 'broadcastChannel' or 'websocket' as needed
    globalAdapter = createSyncAdapter('localStorage');
  }
  return globalAdapter;
}

export function resetGlobalSyncAdapter(): void {
  if (globalAdapter) {
    globalAdapter.destroy();
    globalAdapter = null;
  }
}
