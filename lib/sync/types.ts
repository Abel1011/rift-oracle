// Types for the draft synchronization system
import { DraftState } from '../types';

export interface DraftSyncData {
  draftState: DraftState;
  timestamp: number;
  source: 'draft' | 'analysis';
}

export interface DraftSyncAdapter {
  // Subscribe to draft state changes
  subscribe(callback: (data: DraftSyncData) => void): () => void;
  
  // Publish draft state changes
  publish(data: DraftSyncData): void;
  
  // Get current state (if available)
  getCurrentState(): DraftSyncData | null;
  
  // Cleanup resources
  destroy(): void;
}

export type SyncAdapterFactory = () => DraftSyncAdapter;
