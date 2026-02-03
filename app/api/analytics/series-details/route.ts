import { NextRequest, NextResponse } from 'next/server';
import { 
  getSeriesDetails,
  isGridConfigured
} from '@/lib/grid/client';
import type { SeriesAnalysis } from '@/lib/api/analytics-types';

export async function GET(request: NextRequest) {
  if (!isGridConfigured()) {
    return NextResponse.json({
      error: 'GRID API not configured',
      message: 'Please set GRID_API_KEY in your .env file',
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('seriesId');

    if (!seriesId) {
      return NextResponse.json({
        error: 'Missing seriesId parameter',
      }, { status: 400 });
    }

    // Fetch series details
    // Note: The central-data API only provides basic series info
    // Detailed game data (picks, bans, player stats) requires Live Data Feed API
    const res = await getSeriesDetails(seriesId);
    const series = res.series;

    // Transform the data (limited to what central-data API provides)
    const analysis: SeriesAnalysis = {
      id: series.id,
      date: series.startTimeScheduled,
      format: series.format?.nameShortened,
      tournament: series.tournament?.name,
      teams: series.teams.map(t => ({
        id: t.baseInfo.id,
        name: t.baseInfo.name,
        logoUrl: t.baseInfo.logoUrl,
        score: Math.max(0, t.scoreAdvantage ?? 0),
        won: (t.scoreAdvantage ?? 0) > 0,
        players: series.players?.map(p => p.nickname) || [],
      })),
      // Game details require Live Data Feed API - returning empty array
      games: [],
    };

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Series details error:', error);
    return NextResponse.json({
      error: 'Failed to fetch series details',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
