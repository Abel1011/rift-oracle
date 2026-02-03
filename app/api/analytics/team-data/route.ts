/**
 * API Route: Team Data (Full)
 * 
 * GET: Retrieve full team data with all statistics
 * Uses the new GRID data service with caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTeamData, prepareTeamData, clearTeamCache } from '@/lib/services/gridDataService';
import { isGridConfigured } from '@/lib/grid/client';

export async function GET(request: NextRequest) {
  if (!isGridConfigured()) {
    return NextResponse.json({
      error: 'GRID API not configured',
      message: 'Please set GRID_API_KEY in your .env file',
    }, { status: 500 });
  }

  const teamId = request.nextUrl.searchParams.get('teamId');
  const wait = request.nextUrl.searchParams.get('wait') === 'true';
  const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

  if (!teamId) {
    return NextResponse.json(
      { error: 'Missing teamId parameter' },
      { status: 400 }
    );
  }

  try {
    // Clear cache if refresh requested
    if (refresh) {
      await clearTeamCache(teamId);
    }

    // Try to get cached data first
    let teamData = await getTeamData(teamId);

    // If not cached and wait=true, prepare it now
    if (!teamData && wait) {
      console.log(`[team-data] Preparing full data for team ${teamId}...`);
      try {
        teamData = await prepareTeamData(teamId, 15);
      } catch (prepareError) {
        console.error(`[team-data] Error preparing data for team ${teamId}:`, prepareError);
        return NextResponse.json({
          status: 'error',
          error: 'Failed to prepare team data',
          message: prepareError instanceof Error ? prepareError.message : 'Unknown error during data preparation',
          teamId,
        }, { status: 500 });
      }
      
      // Check if prepareTeamData returned null (no series found or other issue)
      if (!teamData) {
        console.log(`[team-data] No data available for team ${teamId}`);
        return NextResponse.json({
          status: 'no-data',
          error: 'No match data found for this team',
          message: 'This team may not have recent matches in the GRID database, or the team ID may be incorrect.',
          teamId,
        });
      }
    }

    // If no data and wait wasn't requested
    if (!teamData) {
      return NextResponse.json({
        status: 'pending',
        message: 'Team data not yet cached. Use ?wait=true to prepare data.',
        teamId,
      });
    }

    // Return full data
    return NextResponse.json({
      status: 'ready',
      data: teamData,
    });
  } catch (error) {
    console.error('[API] Team data error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to retrieve team data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
