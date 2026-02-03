import { NextRequest, NextResponse } from 'next/server';
import { getTeams, TITLE_IDS } from '@/lib/grid/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Use GRID's native search filter - it supports case-insensitive 'contains'
    const result = await getTeams(
      Math.min(limit, 50), // GRID max is 50
      undefined,
      TITLE_IDS.LOL,
      search || undefined // Pass search term to filter by name
    );

    if (!result.teams || !result.teams.edges) {
      return NextResponse.json({ teams: [] });
    }

    const teams = result.teams.edges
      .map((edge) => edge.node)
      .filter((team) => team.name);

    return NextResponse.json({ 
      teams, 
      total: result.teams.totalCount,
      searched: !!search 
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
