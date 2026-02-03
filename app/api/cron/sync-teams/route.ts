import { NextRequest, NextResponse } from 'next/server';
import { CURATED_TEAMS, CuratedTeam } from '@/lib/data/curatedTeams';
import { gridQuery, TITLE_IDS, GRID_ENDPOINTS } from '@/lib/grid/client';

// Query to get recent series for a team
const GET_TEAM_SERIES_COUNT = `
  query GetTeamSeriesCount($filter: SeriesFilter) {
    allSeries(first: 1, filter: $filter) {
      totalCount
    }
  }
`;

interface SeriesCountResponse {
  allSeries: {
    totalCount: number;
  };
}

interface TeamSyncResult {
  id: string;
  name: string;
  nameShortened: string;
  region: string;
  seriesCount: number;
  hasData: boolean;
  error?: string;
}

interface SyncReport {
  timestamp: string;
  totalTeams: number;
  teamsWithData: number;
  teamsWithoutData: number;
  teamsWithErrors: number;
  results: TeamSyncResult[];
  summary: {
    byRegion: Record<string, { total: number; withData: number; withoutData: number }>;
  };
}

// Delay helper to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkTeamData(team: CuratedTeam): Promise<TeamSyncResult> {
  try {
    const filter = {
      titleIds: { in: [TITLE_IDS.LOL] },
      teamIds: { in: [team.id] },
    };

    const result = await gridQuery<SeriesCountResponse>(
      GET_TEAM_SERIES_COUNT,
      { filter },
      GRID_ENDPOINTS.CENTRAL_DATA
    );

    const seriesCount = result.allSeries?.totalCount || 0;

    return {
      id: team.id,
      name: team.name,
      nameShortened: team.nameShortened,
      region: team.region,
      seriesCount,
      hasData: seriesCount > 0,
    };
  } catch (error) {
    return {
      id: team.id,
      name: team.name,
      nameShortened: team.nameShortened,
      region: team.region,
      seriesCount: 0,
      hasData: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const delayMs = parseInt(searchParams.get('delay') || '2000', 10); // Default 2s between requests to avoid rate limits
  const region = searchParams.get('region'); // Optional: filter by region
  const dryRun = searchParams.get('dryRun') === 'true'; // Just show teams without checking

  // Filter teams by region if specified
  const teamsToCheck = region 
    ? CURATED_TEAMS.filter(t => t.region === region)
    : CURATED_TEAMS;

  if (dryRun) {
    return NextResponse.json({
      message: 'Dry run - teams that would be checked',
      totalTeams: teamsToCheck.length,
      teams: teamsToCheck.map(t => ({
        id: t.id,
        name: t.name,
        nameShortened: t.nameShortened,
        region: t.region,
      })),
    });
  }

  console.log(`[CRON] Starting team data sync for ${teamsToCheck.length} teams...`);

  const results: TeamSyncResult[] = [];
  
  for (let i = 0; i < teamsToCheck.length; i++) {
    const team = teamsToCheck[i];
    console.log(`[CRON] Checking team ${i + 1}/${teamsToCheck.length}: ${team.name} (${team.id})`);
    
    const result = await checkTeamData(team);
    results.push(result);
    
    // Log progress
    if (result.hasData) {
      console.log(`  ✓ ${team.name}: ${result.seriesCount} series`);
    } else if (result.error) {
      console.log(`  ✗ ${team.name}: ERROR - ${result.error}`);
    } else {
      console.log(`  ⚠ ${team.name}: No data found`);
    }

    // Delay between requests to avoid rate limiting (except for last item)
    if (i < teamsToCheck.length - 1) {
      await delay(delayMs);
    }
  }

  // Generate summary by region
  const byRegion: Record<string, { total: number; withData: number; withoutData: number }> = {};
  
  for (const result of results) {
    if (!byRegion[result.region]) {
      byRegion[result.region] = { total: 0, withData: 0, withoutData: 0 };
    }
    byRegion[result.region].total++;
    if (result.hasData) {
      byRegion[result.region].withData++;
    } else {
      byRegion[result.region].withoutData++;
    }
  }

  const report: SyncReport = {
    timestamp: new Date().toISOString(),
    totalTeams: results.length,
    teamsWithData: results.filter(r => r.hasData).length,
    teamsWithoutData: results.filter(r => !r.hasData && !r.error).length,
    teamsWithErrors: results.filter(r => r.error).length,
    results,
    summary: { byRegion },
  };

  console.log(`[CRON] Sync complete:`, {
    total: report.totalTeams,
    withData: report.teamsWithData,
    withoutData: report.teamsWithoutData,
    errors: report.teamsWithErrors,
  });

  return NextResponse.json(report);
}

// POST can be used for manual trigger with specific team IDs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamIds, delay: delayMs = 500 } = body;

    if (!teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: 'teamIds array is required' },
        { status: 400 }
      );
    }

    const teamsToCheck = CURATED_TEAMS.filter(t => teamIds.includes(t.id));
    
    if (teamsToCheck.length === 0) {
      return NextResponse.json(
        { error: 'No matching teams found in curated list' },
        { status: 404 }
      );
    }

    const results: TeamSyncResult[] = [];
    
    for (let i = 0; i < teamsToCheck.length; i++) {
      const team = teamsToCheck[i];
      const result = await checkTeamData(team);
      results.push(result);
      
      if (i < teamsToCheck.length - 1) {
        await delay(delayMs);
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalTeams: results.length,
      teamsWithData: results.filter(r => r.hasData).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
