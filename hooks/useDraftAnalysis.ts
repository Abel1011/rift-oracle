/**
 * Hook for real-time draft analysis
 * Fetches recommendations and predictions using GRID data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftState } from '@/lib/types';
import type { DraftAnalysis } from '@/lib/services/draftAnalysisService';

interface UseDraftAnalysisOptions {
  draftState: DraftState;
  assistForTeamId: string | null;
  assistForSide: 'BLUE' | 'RED' | null;
  blueTeamId: string | null;
  redTeamId: string | null;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseDraftAnalysisResult {
  analysis: DraftAnalysis | null;
  loading: boolean;
  error: string | null;
  dataStatus: {
    ourTeam: 'ready' | 'loading' | 'missing';
    enemyTeam: 'ready' | 'loading' | 'missing';
  };
  refetch: () => void;
}

export function useDraftAnalysis({
  draftState,
  assistForTeamId,
  assistForSide,
  blueTeamId,
  redTeamId,
  enabled = true,
  debounceMs = 300
}: UseDraftAnalysisOptions): UseDraftAnalysisResult {
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<UseDraftAnalysisResult['dataStatus']>({
    ourTeam: 'missing',
    enemyTeam: 'missing'
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestRef = useRef<string>('');

  const fetchAnalysis = useCallback(async () => {
    if (!enabled || !assistForTeamId || !assistForSide) {
      return;
    }

    // Create a request key to detect duplicate requests
    const requestKey = JSON.stringify({
      draftState,
      assistForTeamId,
      assistForSide,
      blueTeamId,
      redTeamId
    });

    // Skip if same request
    if (requestKey === lastRequestRef.current && analysis) {
      return;
    }
    lastRequestRef.current = requestKey;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/draft-recommendations?wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftState,
          assistForTeamId,
          assistForSide,
          blueTeamId,
          redTeamId
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'error') {
        throw new Error(result.message || 'Analysis failed');
      }

      setAnalysis(result.analysis || null);
      setDataStatus(result.dataStatus || { ourTeam: 'missing', enemyTeam: 'missing' });

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('[useDraftAnalysis] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled, assistForTeamId, assistForSide, blueTeamId, redTeamId, draftState, analysis]);

  // Debounced fetch on changes
  useEffect(() => {
    if (!enabled || !assistForTeamId || !assistForSide) {
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the fetch
    debounceTimeoutRef.current = setTimeout(() => {
      fetchAnalysis();
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchAnalysis, enabled, assistForTeamId, assistForSide, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    analysis,
    loading,
    error,
    dataStatus,
    refetch: fetchAnalysis
  };
}

export type { DraftAnalysis };
