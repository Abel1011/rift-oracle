/**
 * Shared types between frontend and backend API
 * These types match the Pydantic models in the Python backend
 */

export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
export type Side = 'BLUE' | 'RED';

export interface Champion {
  id: string;
  name: string;
  roles: Role[];
  winRate: number;
  pickRate: number;
  banRate: number;
  tags: string[];
  imageUrl?: string;
}

export interface DraftState {
  bluePicks: string[];
  blueBans: string[];
  redPicks: string[];
  redBans: string[];
  currentTurn: number;
  isFinished: boolean;
}

export interface Recommendation {
  championId: string;
  championName: string;
  predictedWinRate: number;
  reasoning: string;
  score: number;
  synergies: string[];
  counters: string[];
}

export interface DraftWarning {
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

export interface DraftRecommendationResponse {
  recommendations: Recommendation[];
  currentWinProbability: number;
  warnings: DraftWarning[];
  analysis?: string;
}

export interface EnemyPrediction {
  championId: string;
  championName: string;
  probability: number;
  reasoning: string;
}

export interface EnemyPredictionResponse {
  predictions: EnemyPrediction[];
  confidence: number;
}

export interface WinProbabilityResponse {
  blueProbability: number;
  redProbability: number;
  factors: string[];
}

export interface DraftAnalysisResponse {
  recommendations: Recommendation[];
  enemyPredictions: EnemyPrediction[];
  winProbability: WinProbabilityResponse;
  warnings: DraftWarning[];
  draftPhase: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  frontend: {
    status: string;
    version: string;
  };
  backend: {
    status: string;
    service?: string;
    version?: string;
    error?: string;
    cache?: {
      healthy: boolean;
      type: string;
      redis_available: boolean;
    };
  };
}

export interface ChampionsListResponse {
  count: number;
  champions: Champion[];
}
