/**
 * Hook for team data with background loading support
 * Uses the new GRID data service with caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Re-export types from the service for convenience
export type {
  TeamData,
  PlayerStats,
  PlayerChampionStats,
  ChampionPickStats,
  BanStats,
  ChampionCombo,
  MatchResult,
  ObjectiveStats,
  SideStats,
  GameAverages,
  GamePicksBans,
  PrepareJobStatus,
} from '@/lib/services/gridDataService';

import type { TeamData, PrepareJobStatus } from '@/lib/services/gridDataService';

interface UseTeamDataOptions {
  teamId: string | null;
  enabled?: boolean;
  autoLoad?: boolean; // If true, will trigger prepare job if data not cached
}

interface UseTeamDataResult {
  data: TeamData | null;
  loading: boolean;
  progress: number;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTeamData({ teamId, enabled = true, autoLoad = false }: UseTeamDataOptions): UseTeamDataResult {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTeamIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state when teamId changes
  useEffect(() => {
    if (teamId !== prevTeamIdRef.current) {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setData(null);
      setError(null);
      setProgress(0);
      setLoading(false);
      prevTeamIdRef.current = teamId;
    }
  }, [teamId]);

  const fetchData = useCallback(async () => {
    if (!teamId || !enabled) {
      setLoading(false);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    setProgress(0);

    const currentTeamId = teamId; // Capture for closure

    try {
      // Try to get cached data first
      const response = await fetch(`/api/analytics/team-data?teamId=${teamId}`, {
        signal: abortController.signal
      });
      
      // Check if we're still on the same team
      if (currentTeamId !== prevTeamIdRef.current) {
        console.log('[useTeamData] Team changed during fetch, aborting');
        return;
      }
      
      const result = await response.json();

      if (result.status === 'ready' && result.data) {
        setData(result.data);
        setProgress(100);
        setLoading(false);
        return;
      }

      // Data not cached - if autoLoad, wait for it
      if (autoLoad) {
        setProgress(30);
        console.log(`[useTeamData] Data not cached, loading for team ${teamId}...`);
        
        const waitResponse = await fetch(`/api/analytics/team-data?teamId=${teamId}&wait=true`, {
          signal: abortController.signal
        });
        
        // Check again if team changed
        if (currentTeamId !== prevTeamIdRef.current) {
          console.log('[useTeamData] Team changed during wait fetch, aborting');
          return;
        }
        
        const waitResult = await waitResponse.json();
        
        if (waitResult.status === 'ready' && waitResult.data) {
          setData(waitResult.data);
          setProgress(100);
        } else if (waitResult.status === 'no-data') {
          // Team exists but has no match data
          setError(waitResult.message || 'No match data found for this team');
          setData(null);
        } else if (waitResult.status === 'error' || waitResult.error) {
          throw new Error(waitResult.message || waitResult.error || 'Failed to load team data');
        } else if (waitResult.status === 'pending') {
          // Still pending after wait - something went wrong
          throw new Error('Data preparation timed out. Please try again.');
        } else {
          throw new Error('Unexpected response from server');
        }
      } else {
        // Not autoLoad and no cached data
        setError('Data not yet available. Loading in progress...');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useTeamData] Request aborted');
        return;
      }
      console.error('[useTeamData] Error fetching data:', err);
      // Only set error if we're still on the same team
      if (currentTeamId === prevTeamIdRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
        setData(null);
      }
    } finally {
      if (currentTeamId === prevTeamIdRef.current) {
        setLoading(false);
      }
    }
  }, [teamId, enabled, autoLoad]);

  useEffect(() => {
    fetchData();
    
    return () => {
      // Cleanup: cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetchData]);

  return { data, loading, progress, error, refetch: fetchData };
}

// ============ PREPARE DATA HOOK ============

interface UsePrepareDataOptions {
  blueTeamId: string | null;
  redTeamId: string | null;
  autoStart?: boolean;
}

interface UsePrepareDataResult {
  status: PrepareJobStatus | null;
  loading: boolean;
  error: string | null;
  startPrepare: () => Promise<void>;
  isReady: boolean;
}

export function usePrepareData({ blueTeamId, redTeamId, autoStart = false }: UsePrepareDataOptions): UsePrepareDataResult {
  const [status, setStatus] = useState<PrepareJobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPrepare = useCallback(async () => {
    if (!blueTeamId || !redTeamId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueTeamId, redTeamId }),
      });

      const result = await response.json();

      if (result.status === 'cached') {
        // Both teams already cached
        setStatus({
          jobId: 'cached',
          status: 'ready',
          progress: 100,
          message: 'All data ready (from cache)',
          teams: {
            blue: { teamId: blueTeamId, status: 'ready' },
            red: { teamId: redTeamId, status: 'ready' },
          },
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      if (result.jobId) {
        setJobId(result.jobId);
        // Start polling for status
        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/analytics/prepare?jobId=${result.jobId}`);
            const statusData = await statusRes.json();
            setStatus(statusData);

            if (statusData.status === 'ready' || statusData.status === 'error') {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setLoading(false);
            }
          } catch {
            // Polling error, continue trying
          }
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start preparation');
      setLoading(false);
    }
  }, [blueTeamId, redTeamId]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && blueTeamId && redTeamId) {
      startPrepare();
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [autoStart, blueTeamId, redTeamId, startPrepare]);

  const isReady = status?.status === 'ready';

  return { status, loading, error, startPrepare, isReady };
}

// ============ COMBINED ANALYTICS HOOK ============

interface UseMatchAnalyticsNewOptions {
  blueTeamId: string | null;
  redTeamId: string | null;
  enabled?: boolean;
}

interface UseMatchAnalyticsNewResult {
  blueTeam: TeamData | null;
  redTeam: TeamData | null;
  loading: boolean;
  progress: number;
  error: string | null;
  isReady: boolean;
  startLoading: () => Promise<void>;
}

export function useMatchAnalyticsNew({ 
  blueTeamId, 
  redTeamId, 
  enabled = true 
}: UseMatchAnalyticsNewOptions): UseMatchAnalyticsNewResult {
  const [blueTeam, setBlueTeam] = useState<TeamData | null>(null);
  const [redTeam, setRedTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const prepare = usePrepareData({ 
    blueTeamId, 
    redTeamId,
    autoStart: false 
  });

  // When prepare is done, fetch the data
  useEffect(() => {
    if (prepare.isReady) {
      // Fetch both team data
      const fetchBothTeams = async () => {
        try {
          const [blueRes, redRes] = await Promise.all([
            fetch(`/api/analytics/team-data?teamId=${blueTeamId}`),
            fetch(`/api/analytics/team-data?teamId=${redTeamId}`),
          ]);

          const [blueData, redData] = await Promise.all([
            blueRes.json(),
            redRes.json(),
          ]);

          if (blueData.status === 'ready') setBlueTeam(blueData.data);
          if (redData.status === 'ready') setRedTeam(redData.data);
          
          setProgress(100);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch team data');
        } finally {
          setLoading(false);
        }
      };

      fetchBothTeams();
    }
  }, [prepare.isReady, blueTeamId, redTeamId]);

  // Update progress from prepare job
  useEffect(() => {
    if (prepare.status) {
      setProgress(prepare.status.progress);
    }
    if (prepare.error) {
      setError(prepare.error);
    }
  }, [prepare.status, prepare.error]);

  const startLoading = useCallback(async () => {
    if (!blueTeamId || !redTeamId || !enabled) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    await prepare.startPrepare();
  }, [blueTeamId, redTeamId, enabled, prepare]);

  const isReady = !!(blueTeam && redTeam);

  return { 
    blueTeam, 
    redTeam, 
    loading, 
    progress, 
    error, 
    isReady,
    startLoading 
  };
}
