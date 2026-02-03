import { NextRequest, NextResponse } from 'next/server';
import { analyzeDraft, DraftAnalysis } from '@/lib/services/draftAnalysisService';
import { getTeamData, prepareTeamData, isTeamDataCached } from '@/lib/services/gridDataService';
import type { DraftState } from '@/lib/types';

interface DraftRecommendationRequest {
  draftState: DraftState;
  assistForTeamId: string;
  assistForSide: 'BLUE' | 'RED';
  blueTeamId?: string;
  redTeamId?: string;
}

interface DraftRecommendationResponse {
  status: 'ready' | 'loading' | 'error';
  analysis?: DraftAnalysis;
  message?: string;
  dataStatus: {
    ourTeam: 'ready' | 'loading' | 'missing';
    enemyTeam: 'ready' | 'loading' | 'missing';
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<DraftRecommendationResponse>> {
  try {
    const body = await request.json() as DraftRecommendationRequest;
    const { draftState, assistForTeamId, assistForSide, blueTeamId, redTeamId } = body;

    if (!draftState) {
      return NextResponse.json({
        status: 'error',
        message: 'draftState is required',
        dataStatus: { ourTeam: 'missing', enemyTeam: 'missing' }
      }, { status: 400 });
    }

    if (!assistForTeamId || !assistForSide) {
      return NextResponse.json({
        status: 'error',
        message: 'assistForTeamId and assistForSide are required',
        dataStatus: { ourTeam: 'missing', enemyTeam: 'missing' }
      }, { status: 400 });
    }

    // Determine our team and enemy team IDs
    const ourTeamId = assistForTeamId;
    const enemyTeamId = assistForSide === 'BLUE' ? redTeamId : blueTeamId;

    // Check if we need to wait for data
    const waitParam = request.nextUrl.searchParams.get('wait');
    const shouldWait = waitParam === 'true';

    // Load team data
    let ourTeamData = await getTeamData(ourTeamId);
    let enemyTeamData = enemyTeamId ? await getTeamData(enemyTeamId) : null;

    const dataStatus: DraftRecommendationResponse['dataStatus'] = {
      ourTeam: ourTeamData ? 'ready' : 'missing',
      enemyTeam: enemyTeamId ? (enemyTeamData ? 'ready' : 'missing') : 'ready'
    };

    // If data not cached and shouldWait, prepare it
    if (shouldWait) {
      if (!ourTeamData) {
        dataStatus.ourTeam = 'loading';
        try {
          ourTeamData = await prepareTeamData(ourTeamId, 15);
          dataStatus.ourTeam = ourTeamData ? 'ready' : 'missing';
        } catch (e) {
          console.error('[DraftRec] Failed to prepare our team data:', e);
          dataStatus.ourTeam = 'missing';
        }
      }

      if (enemyTeamId && !enemyTeamData) {
        dataStatus.enemyTeam = 'loading';
        try {
          enemyTeamData = await prepareTeamData(enemyTeamId, 15);
          dataStatus.enemyTeam = enemyTeamData ? 'ready' : 'missing';
        } catch (e) {
          console.error('[DraftRec] Failed to prepare enemy team data:', e);
          dataStatus.enemyTeam = 'missing';
        }
      }
    }

    // Perform analysis (works even with partial data)
    const analysis = analyzeDraft(
      draftState,
      ourTeamData,
      enemyTeamData,
      assistForSide
    );

    return NextResponse.json({
      status: 'ready',
      analysis,
      dataStatus
    });

  } catch (error) {
    console.error('[DraftRec] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      dataStatus: { ourTeam: 'missing', enemyTeam: 'missing' }
    }, { status: 500 });
  }
}

// GET endpoint for quick status check
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const blueTeamId = params.get('blueTeamId');
  const redTeamId = params.get('redTeamId');

  const status = {
    blueTeamCached: blueTeamId ? await isTeamDataCached(blueTeamId) : false,
    redTeamCached: redTeamId ? await isTeamDataCached(redTeamId) : false
  };

  return NextResponse.json(status);
}
