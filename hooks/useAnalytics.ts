import { useState, useEffect, useCallback } from 'react';
import type { TeamStats, HeadToHeadStats, SeriesAnalysis } from '@/lib/api/analytics-types';

// ============ TEAM STATS HOOK ============

interface UseTeamStatsOptions {
  teamId: string | null;
  enabled?: boolean;
}

interface UseTeamStatsResult {
  data: TeamStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTeamStats({ teamId, enabled = true }: UseTeamStatsOptions): UseTeamStatsResult {
  const [data, setData] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!teamId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/team-stats?teamId=${teamId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch team stats');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ HEAD TO HEAD HOOK ============

interface UseHeadToHeadOptions {
  team1Id: string | null;
  team2Id: string | null;
  enabled?: boolean;
}

interface UseHeadToHeadResult {
  data: HeadToHeadStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHeadToHead({ team1Id, team2Id, enabled = true }: UseHeadToHeadOptions): UseHeadToHeadResult {
  const [data, setData] = useState<HeadToHeadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!team1Id || !team2Id || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/head-to-head?team1Id=${team1Id}&team2Id=${team2Id}&wait=true`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch head-to-head stats');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [team1Id, team2Id, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ SERIES DETAILS HOOK ============

interface UseSeriesDetailsOptions {
  seriesId: string | null;
  enabled?: boolean;
}

interface UseSeriesDetailsResult {
  data: SeriesAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSeriesDetails({ seriesId, enabled = true }: UseSeriesDetailsOptions): UseSeriesDetailsResult {
  const [data, setData] = useState<SeriesAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!seriesId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/series-details?seriesId=${seriesId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch series details');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [seriesId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ COMBINED ANALYTICS HOOK ============

interface UseMatchAnalyticsOptions {
  blueTeamId: string | null;
  redTeamId: string | null;
  enabled?: boolean;
}

interface UseMatchAnalyticsResult {
  blueTeamStats: TeamStats | null;
  redTeamStats: TeamStats | null;
  headToHead: HeadToHeadStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMatchAnalytics({ blueTeamId, redTeamId, enabled = true }: UseMatchAnalyticsOptions): UseMatchAnalyticsResult {
  const [blueTeamStats, setBlueTeamStats] = useState<TeamStats | null>(null);
  const [redTeamStats, setRedTeamStats] = useState<TeamStats | null>(null);
  const [headToHead, setHeadToHead] = useState<HeadToHeadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    if (!blueTeamId && !redTeamId) return;

    setLoading(true);
    setError(null);

    try {
      // Build fetch promises only for teams that are selected
      // Use wait=true to automatically prepare data if not cached
      const promises: Promise<Response>[] = [];
      
      if (blueTeamId) {
        promises.push(fetch(`/api/analytics/team-stats?teamId=${blueTeamId}&wait=true`));
      }
      if (redTeamId) {
        promises.push(fetch(`/api/analytics/team-stats?teamId=${redTeamId}&wait=true`));
      }
      if (blueTeamId && redTeamId) {
        promises.push(fetch(`/api/analytics/head-to-head?team1Id=${blueTeamId}&team2Id=${redTeamId}&wait=true`));
      }

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(r => r.json()));

      let resultIndex = 0;
      
      if (blueTeamId) {
        const blueData = results[resultIndex++];
        if (blueData.success) setBlueTeamStats(blueData.data);
      }
      
      if (redTeamId) {
        const redData = results[resultIndex++];
        if (redData.success) setRedTeamStats(redData.data);
      }
      
      if (blueTeamId && redTeamId) {
        const h2hData = results[resultIndex++];
        if (h2hData?.success) setHeadToHead(h2hData.data);
      }

      // Check for any errors
      const errors = results
        .filter(r => !r.success && r.message)
        .map(r => r.message);

      if (errors.length > 0) {
        setError(errors.join('; '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [blueTeamId, redTeamId, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { blueTeamStats, redTeamStats, headToHead, loading, error, refetch: fetchData };
}

