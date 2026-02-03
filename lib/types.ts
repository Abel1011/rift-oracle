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

export interface DraftState {
  bluePicks: string[];
  blueBans: string[];
  redPicks: string[];
  redBans: string[];
  currentTurn: number;
  isFinished: boolean;
}
