/**
 * API Route: Prepare Analytics Data
 * 
 * POST: Start background job to download team data
 * GET: Check job status
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  startPrepareJob, 
  getJobStatus,
  isTeamDataCached 
} from '@/lib/services/gridDataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueTeamId, redTeamId } = body;

    if (!blueTeamId || !redTeamId) {
      return NextResponse.json(
        { error: 'Missing blueTeamId or redTeamId' },
        { status: 400 }
      );
    }

    // Check if already cached
    const [blueCached, redCached] = await Promise.all([
      isTeamDataCached(blueTeamId),
      isTeamDataCached(redTeamId),
    ]);

    if (blueCached && redCached) {
      return NextResponse.json({
        status: 'cached',
        message: 'Both teams already cached',
        teams: {
          blue: { cached: true },
          red: { cached: true },
        },
      });
    }

    // Start background job
    const jobId = await startPrepareJob(blueTeamId, redTeamId);

    return NextResponse.json({
      status: 'started',
      jobId,
      message: 'Data preparation started',
      teams: {
        blue: { cached: blueCached },
        red: { cached: redCached },
      },
    });
  } catch (error) {
    console.error('[API] Prepare error:', error);
    return NextResponse.json(
      { error: 'Failed to start data preparation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    );
  }

  const status = getJobStatus(jobId);

  if (!status) {
    return NextResponse.json(
      { error: 'Job not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json(status);
}
