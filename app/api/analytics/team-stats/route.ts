import { NextRequest, NextResponse } from 'next/server';
import { 
  getTeamData,
  prepareTeamData,
  isTeamDataCached,
} from '@/lib/services/gridDataService';
import { isGridConfigured } from '@/lib/grid/client';
import type { TeamStats } from '@/lib/api/analytics-types';

export async function GET(request: NextRequest) {
  if (!isGridConfigured()) {
    return NextResponse.json({
      error: 'GRID API not configured',
      message: 'Please set GRID_API_KEY in your .env file',
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const wait = searchParams.get('wait') === 'true';

    if (!teamId) {
      return NextResponse.json({
        error: 'Missing teamId parameter',
      }, { status: 400 });
    }

    // Check if data is cached
    let teamData = await getTeamData(teamId);

    // If not cached and wait=true, prepare it now
    if (!teamData && wait) {
      console.log(`[team-stats] Preparing data for team ${teamId}...`);
      teamData = await prepareTeamData(teamId, 10);
    }

    // If still no data, return pending status
    if (!teamData) {
      const isCached = await isTeamDataCached(teamId);
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Team data not cached. Use /api/analytics/prepare or add ?wait=true',
        teamId,
        cached: isCached,
      });
    }

    // Convert TeamData to TeamStats format for backward compatibility
    const stats: TeamStats = {
      team: {
        id: teamData.teamId,
        name: teamData.teamName,
        logoUrl: teamData.teamLogo,
      },
      recentRecord: {
        wins: teamData.seriesWins,
        losses: teamData.seriesLosses,
        winRate: teamData.seriesWinRate,
        totalMatches: teamData.seriesWins + teamData.seriesLosses,
      },
      championStats: {
        mostPicked: teamData.mostPicked.map(c => ({
          name: c.name,
          count: c.count,
          winRate: c.winRate,
        })),
        mostBanned: teamData.mostBannedAgainst.map(b => ({
          name: b.name,
          count: b.count,
        })),
      },
      gameStats: {
        gamesPlayed: teamData.gamesPlayed,
        gamesWon: teamData.gamesWon,
        avgKills: 0, // Will be calculated from players
        avgDeaths: 0,
        avgDurationMinutes: 0,
        objectives: {
          avgDragons: 0,
          avgBarons: 0,
          avgTowers: 0,
          avgHeralds: 0,
          avgVoidGrubs: 0,
          firstDragonRate: 0,
          firstBaronRate: 0,
          firstTowerRate: 0,
        },
      },
      seriesStats: {
        avgKillsPerSeries: 0,
        avgDeathsPerSeries: 0,
        firstBloodRate: 0,
        avgDurationMinutes: 0,
      },
      playerChampionPools: {},
      recentMatches: teamData.recentMatches.map(m => ({
        id: m.seriesId,
        date: m.date,
        opponent: m.opponent,
        opponentLogo: undefined,
        result: m.won ? 'W' : 'L',
        score: m.score,
        tournament: m.tournament,
        format: undefined,
      })),
    };

    // Calculate avg stats from players
    if (teamData.players.length > 0 && stats.gameStats) {
      const totalKills = teamData.players.reduce((sum, p) => sum + p.avgKills * p.gamesPlayed, 0);
      const totalDeaths = teamData.players.reduce((sum, p) => sum + p.avgDeaths * p.gamesPlayed, 0);
      const totalGames = teamData.players.reduce((sum, p) => sum + p.gamesPlayed, 0) / 5; // 5 players per game
      
      if (totalGames > 0) {
        stats.gameStats.avgKills = totalKills / totalGames;
        stats.gameStats.avgDeaths = totalDeaths / totalGames;
      }
    }

    // Build player champion pools
    for (const player of teamData.players) {
      stats.playerChampionPools[player.name] = player.champions.slice(0, 5).map(c => ({
        champion: c.name,
        games: c.games,
      }));
    }

    return NextResponse.json({
      success: true,
      data: stats,
      source: 'file-download-api',
      lastUpdated: teamData.lastUpdated,
    });
  } catch (error) {
    console.error('Team stats error:', error);
    return NextResponse.json({
      error: 'Failed to fetch team stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}