import { NextRequest, NextResponse } from 'next/server';
import { CURATED_TEAMS, CuratedTeam } from '@/lib/data/curatedTeams';
import { CacheKeys, FileCache } from '@/lib/cache';
import { TITLE_IDS } from '@/lib/grid/client';
import { getTeamRecentSeriesIds, prepareSeriesEndState, prepareSeriesEventsFeatures, isSeriesEventsFeaturesCached } from '@/lib/services/gridDataService';

interface SeriesIngestResult {
  seriesId: string;
  endState: 'downloaded' | 'cached' | 'error' | 'skipped';
  events: 'downloaded' | 'cached' | 'error' | 'skipped';
  error?: string;
}

interface TeamIngestResult {
  teamId: string;
  teamName: string;
  region: string;
  requestedSeries: number;
  seriesFound: number;
  seriesProcessed: number;
  endStatesDownloaded: number;
  eventsDownloaded: number;
  skippedExisting: number;
  errors: number;
  series: SeriesIngestResult[];
}

interface SyncSeriesReport {
  timestamp: string;
  params: {
    region?: string;
    teamId?: string;
    maxSeriesPerTeam: number;
    delayMs: number;
    onlyMissing: boolean;
    limitTeams?: number;
  };
  totals: {
    teams: number;
    seriesProcessed: number;
    endStatesDownloaded: number;
    eventsDownloaded: number;
    skippedExisting: number;
    errors: number;
  };
  notes: {
    zipsWrittenToDisk: boolean;
    cacheDir: string;
  };
  results: TeamIngestResult[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Delay between each series request to avoid 429 rate limiting
const SERIES_DELAY_MS = 1500;

function parseBoolean(value: string | null, defaultValue: boolean) {
  if (value === null) return defaultValue;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return defaultValue;
}

function pickTeams(region: string | null, teamId: string | null, limitTeams: number | undefined): CuratedTeam[] {
  let teams = CURATED_TEAMS;

  if (region) {
    teams = teams.filter(t => t.region === region);
  }

  if (teamId) {
    teams = teams.filter(t => t.id === teamId);
  }

  if (limitTeams !== undefined && Number.isFinite(limitTeams)) {
    teams = teams.slice(0, Math.max(0, limitTeams));
  }

  return teams;
}

async function ingestTeamSeries(team: CuratedTeam, maxSeriesPerTeam: number, onlyMissing: boolean): Promise<TeamIngestResult> {
  const result: TeamIngestResult = {
    teamId: team.id,
    teamName: team.name,
    region: team.region,
    requestedSeries: maxSeriesPerTeam,
    seriesFound: 0,
    seriesProcessed: 0,
    endStatesDownloaded: 0,
    eventsDownloaded: 0,
    skippedExisting: 0,
    errors: 0,
    series: [],
  };

  const seriesIds = await getTeamRecentSeriesIds(team.id, maxSeriesPerTeam, TITLE_IDS.LOL);
  result.seriesFound = seriesIds.length;

  for (let idx = 0; idx < seriesIds.length; idx++) {
    const seriesId = seriesIds[idx];
    
    // Add delay between series to avoid 429 rate limiting (except for first one)
    if (idx > 0) {
      await delay(SERIES_DELAY_MS);
    }
    
    const seriesResult: SeriesIngestResult = {
      seriesId,
      endState: 'skipped',
      events: 'skipped',
    };

    try {
      const endStateKey = CacheKeys.seriesEndState(seriesId);
      const endStateCached = await FileCache.exists(endStateKey);
      const eventsCached = await isSeriesEventsFeaturesCached(seriesId);

      if (onlyMissing && endStateCached && eventsCached) {
        result.skippedExisting++;
        seriesResult.endState = 'cached';
        seriesResult.events = 'cached';
        result.series.push(seriesResult);
        continue;
      }

      // End-state
      if (!onlyMissing || !endStateCached) {
        const endState = await prepareSeriesEndState(seriesId);
        if (endState) {
          seriesResult.endState = endStateCached ? 'cached' : 'downloaded';
          if (!endStateCached) result.endStatesDownloaded++;
        } else {
          seriesResult.endState = 'error';
        }
      } else {
        seriesResult.endState = 'cached';
      }

      // Events -> Features (zip is processed in-memory; no zip left on disk)
      if (!onlyMissing || !eventsCached) {
        const features = await prepareSeriesEventsFeatures(seriesId);
        if (features) {
          seriesResult.events = eventsCached ? 'cached' : 'downloaded';
          if (!eventsCached) result.eventsDownloaded++;
        } else {
          seriesResult.events = 'error';
        }
      } else {
        seriesResult.events = 'cached';
      }

      result.seriesProcessed++;
      result.series.push(seriesResult);
    } catch (err) {
      result.errors++;
      seriesResult.endState = 'error';
      seriesResult.events = 'error';
      seriesResult.error = err instanceof Error ? err.message : 'Unknown error';
      result.series.push(seriesResult);
    }
  }

  result.errors = result.series.filter(s => s.endState === 'error' || s.events === 'error').length;

  return result;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const region = searchParams.get('region');
  const teamId = searchParams.get('teamId');
  const maxSeriesPerTeam = parseInt(searchParams.get('maxSeries') || '10', 10);
  const delayMs = parseInt(searchParams.get('delay') || '2000', 10); // Increased to avoid 429 rate limiting
  const onlyMissing = parseBoolean(searchParams.get('onlyMissing'), true);
  const limitTeamsRaw = searchParams.get('limitTeams');
  const limitTeams = limitTeamsRaw ? parseInt(limitTeamsRaw, 10) : undefined;

  if (!process.env.GRID_API_KEY) {
    return NextResponse.json({ error: 'GRID_API_KEY is not configured' }, { status: 500 });
  }

  const teamsToProcess = pickTeams(region, teamId, limitTeams);

  const results: TeamIngestResult[] = [];

  for (let i = 0; i < teamsToProcess.length; i++) {
    const team = teamsToProcess[i];
    console.log(`[CRON] Ingest series data ${i + 1}/${teamsToProcess.length}: ${team.name} (${team.id})`);

    try {
      const teamResult = await ingestTeamSeries(team, maxSeriesPerTeam, onlyMissing);
      results.push(teamResult);

      console.log(
        `[CRON] ${team.name}: processed=${teamResult.seriesProcessed} endStatesDownloaded=${teamResult.endStatesDownloaded} eventsDownloaded=${teamResult.eventsDownloaded} skippedExisting=${teamResult.skippedExisting} errors=${teamResult.errors}`
      );
    } catch (err) {
      results.push({
        teamId: team.id,
        teamName: team.name,
        region: team.region,
        requestedSeries: maxSeriesPerTeam,
        seriesFound: 0,
        seriesProcessed: 0,
        endStatesDownloaded: 0,
        eventsDownloaded: 0,
        skippedExisting: 0,
        errors: 1,
        series: [
          {
            seriesId: 'n/a',
            endState: 'error',
            events: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        ],
      });
    }

    if (i < teamsToProcess.length - 1 && delayMs > 0) {
      await delay(delayMs);
    }
  }

  const totals = results.reduce(
    (acc, r) => {
      acc.teams += 1;
      acc.seriesProcessed += r.seriesProcessed;
      acc.endStatesDownloaded += r.endStatesDownloaded;
      acc.eventsDownloaded += r.eventsDownloaded;
      acc.skippedExisting += r.skippedExisting;
      acc.errors += r.errors;
      return acc;
    },
    {
      teams: 0,
      seriesProcessed: 0,
      endStatesDownloaded: 0,
      eventsDownloaded: 0,
      skippedExisting: 0,
      errors: 0,
    }
  );

  const report: SyncSeriesReport = {
    timestamp: new Date().toISOString(),
    params: {
      region: region ?? undefined,
      teamId: teamId ?? undefined,
      maxSeriesPerTeam: Number.isFinite(maxSeriesPerTeam) ? maxSeriesPerTeam : 10,
      delayMs: Number.isFinite(delayMs) ? delayMs : 500,
      onlyMissing,
      limitTeams,
    },
    totals,
    notes: {
      zipsWrittenToDisk: false,
      cacheDir: '.cache/grid',
    },
    results,
  };

  return NextResponse.json(report);
}
