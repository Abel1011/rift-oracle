import { NextRequest, NextResponse } from 'next/server';
import { 
  getTeamData,
  isTeamDataCached,
  prepareTeamData,
} from '@/lib/services/gridDataService';
import { isGridConfigured } from '@/lib/grid/client';
import type { HeadToHeadStats } from '@/lib/api/analytics-types';

export async function GET(request: NextRequest) {
  if (!isGridConfigured()) {
    return NextResponse.json({
      error: 'GRID API not configured',
      message: 'Please set GRID_API_KEY in your .env file',
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const team1Id = searchParams.get('team1Id');
    const team2Id = searchParams.get('team2Id');
    const wait = searchParams.get('wait') === 'true';

    if (!team1Id || !team2Id) {
      return NextResponse.json({
        error: 'Missing team1Id or team2Id parameter',
      }, { status: 400 });
    }

    // Get cached data for both teams
    let team1Data = await getTeamData(team1Id);
    let team2Data = await getTeamData(team2Id);

    // If not cached and wait=true, prepare it now (may take a bit)
    if ((!team1Data || !team2Data) && wait) {
      console.log(`[head-to-head] Preparing data (wait=true) for teams ${team1Id} and ${team2Id}...`);
      const [prepared1, prepared2] = await Promise.all([
        team1Data ? Promise.resolve(team1Data) : prepareTeamData(team1Id, 10),
        team2Data ? Promise.resolve(team2Data) : prepareTeamData(team2Id, 10),
      ]);
      team1Data = prepared1;
      team2Data = prepared2;
    }

    // If data not cached for either team, return pending status
    if (!team1Data || !team2Data) {
      const team1Cached = await isTeamDataCached(team1Id);
      const team2Cached = await isTeamDataCached(team2Id);
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Team data not cached for one or both teams. Use /api/analytics/prepare or add ?wait=true.',
        team1Cached,
        team2Cached,
      });
    }

    const normalizeId = (value: unknown) => String(value ?? '');

    // Find matches between these two teams.
    // Prefer team1 perspective, but fall back to team2 perspective if needed.
    const matchesFromTeam1 = team1Data.recentMatches.filter(m => normalizeId(m.opponentId) === team2Id);
    const matchesFromTeam2 = team2Data.recentMatches.filter(m => normalizeId(m.opponentId) === team1Id);

    const matchMap = new Map<string, { source: 'team1' | 'team2'; match: typeof team1Data.recentMatches[number] }>();
    for (const match of matchesFromTeam1) matchMap.set(match.seriesId, { source: 'team1', match });
    for (const match of matchesFromTeam2) {
      if (!matchMap.has(match.seriesId)) matchMap.set(match.seriesId, { source: 'team2', match });
    }
    const h2hMatches = Array.from(matchMap.values());

    // Initialize stats
    let team1Wins = 0;
    let team2Wins = 0;

    const recentMatches: HeadToHeadStats['recentMatches'] = [];
    // Track champion picks with wins: { picks: number, wins: number }
    const team1Champions: Map<string, { picks: number; wins: number }> = new Map();
    const team2Champions: Map<string, { picks: number; wins: number }> = new Map();
    const commonBans: Map<string, number> = new Map();

    h2hMatches.forEach(({ source, match }) => {
      const seriesWonByTeam1 = source === 'team1' ? match.won : !match.won;
      if (seriesWonByTeam1) team1Wins++;
      else team2Wins++;

      // Determine score from games
      let t1Score = 0;
      let t2Score = 0;
      
      match.games.forEach(game => {
        const gameWonByTeam1 = source === 'team1' ? game.won : !game.won;
        if (gameWonByTeam1) {
          t1Score++;
        } else {
          t2Score++;
        }

        const team1Picks = source === 'team1' ? game.draft.teamPicks : game.draft.opponentPicks;
        const team2Picks = source === 'team1' ? game.draft.opponentPicks : game.draft.teamPicks;

        // Track champion picks from team 1
        team1Picks.forEach(champ => {
          const current = team1Champions.get(champ) || { picks: 0, wins: 0 };
          current.picks++;
          if (gameWonByTeam1) current.wins++;
          team1Champions.set(champ, current);
        });

        // Track champion picks from team 2
        team2Picks.forEach(champ => {
          const current = team2Champions.get(champ) || { picks: 0, wins: 0 };
          current.picks++;
          if (!gameWonByTeam1) current.wins++;
          team2Champions.set(champ, current);
        });
        
        // Track bans from both sides
        game.draft.teamBans.forEach(champ => {
          commonBans.set(champ, (commonBans.get(champ) || 0) + 1);
        });
        game.draft.opponentBans.forEach(champ => {
          commonBans.set(champ, (commonBans.get(champ) || 0) + 1);
        });
      });

      recentMatches.push({
        id: match.seriesId,
        date: match.date,
        winner: seriesWonByTeam1 ? team1Data.teamName : team2Data.teamName,
        score: `${t1Score}-${t2Score}`,
        tournament: match.tournament,
      });
    });

    // Sort champions by count and calculate winRate
    const sortedTeam1Champs = [...team1Champions.entries()]
      .sort((a, b) => b[1].picks - a[1].picks)
      .slice(0, 10)
      .map(([name, stats]) => ({ 
        name, 
        count: stats.picks,
        winRate: stats.picks > 0 ? Math.round((stats.wins / stats.picks) * 100) : 0
      }));

    const sortedTeam2Champs = [...team2Champions.entries()]
      .sort((a, b) => b[1].picks - a[1].picks)
      .slice(0, 10)
      .map(([name, stats]) => ({ 
        name, 
        count: stats.picks,
        winRate: stats.picks > 0 ? Math.round((stats.wins / stats.picks) * 100) : 0
      }));

    const sortedBans = [...commonBans.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const stats: HeadToHeadStats = {
      team1: {
        id: team1Id,
        name: team1Data.teamName,
        logoUrl: team1Data.teamLogo || '',
        wins: team1Wins,
      },
      team2: {
        id: team2Id,
        name: team2Data.teamName,
        logoUrl: team2Data.teamLogo || '',
        wins: team2Wins,
      },
      totalSeries: h2hMatches.length,
      recentMatches,
      championsPickedByTeam1: sortedTeam1Champs,
      championsPickedByTeam2: sortedTeam2Champs,
      commonBans: sortedBans,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Head to head error:', error);
    return NextResponse.json({
      error: 'Failed to fetch head-to-head stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
