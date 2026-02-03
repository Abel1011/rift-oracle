/**
 * Custom hooks exports
 */

// Sync hooks
export { useDraftSync } from './useDraftSync';

// Analytics hooks (legacy)
export { useTeamStats, useHeadToHead, useSeriesDetails, useMatchAnalytics } from './useAnalytics';

// Team data hooks (new - with caching)
export { useTeamData, usePrepareData, useMatchAnalyticsNew } from './useTeamData';
export type { 
  TeamData, 
  PlayerStats, 
  PlayerChampionStats,
  ChampionPickStats, 
  BanStats, 
  MatchResult,
  ObjectiveStats,
  SideStats,
  GameAverages,
  PrepareJobStatus 
} from './useTeamData';
