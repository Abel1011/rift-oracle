export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export interface Champion {
  id: string;
  name: string;
  roles: Role[];
  winRate: number;
  pickRate: number;
  banRate: number;
  tags: string[];
  imageUrl: string;
}

export interface DraftAction {
  type: 'PICK' | 'BAN';
  side: 'BLUE' | 'RED';
  championId: string;
  order: number;
  role?: Role;
}

export interface Recommendation {
  championId: string;
  predictedWinRate: number;
  reasoning: string;
  score: number;
}

export interface DraftTiming {
  turn: number;
  championId: string;
  side: 'BLUE' | 'RED';
  type: 'PICK' | 'BAN';
  timestamp: number;
  durationMs: number; // Time taken for this pick/ban
}

export interface DraftState {
  bluePicks: string[];
  blueBans: string[];
  redPicks: string[];
  redBans: string[];
  currentTurn: number;
  isFinished: boolean;
  // Timing data
  timings?: DraftTiming[];
  draftStartTime?: number;
}
