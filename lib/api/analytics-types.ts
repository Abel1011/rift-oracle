/**
 * Analytics API Types
 * Shared types for analytics endpoints and hooks
 */

export interface TeamStats {
  team: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  recentRecord: {
    wins: number;
    losses: number;
    winRate: number;
    totalMatches: number;
  };
  championStats: {
    mostPicked: Array<{ name: string; count: number; winRate: number }>;
    mostBanned: Array<{ name: string; count: number }>;
  };
  // Additional stats from GRID Statistics Feed
  gameStats?: {
    gamesPlayed: number;
    gamesWon: number;
    avgKills: number;
    avgDeaths: number;
    avgDurationMinutes?: number;
    objectives: {
      avgDragons: number;
      avgBarons: number;
      avgTowers: number;
      avgHeralds?: number;
      avgVoidGrubs?: number;
      firstDragonRate?: number;
      firstBaronRate?: number;
      firstTowerRate?: number;
    };
  };
  seriesStats?: {
    avgKillsPerSeries: number;
    avgDeathsPerSeries: number;
    firstBloodRate: number;
    avgDurationMinutes: number;
  };
  playerChampionPools: Record<string, Array<{ champion: string; games: number }>>;
  recentMatches: Array<{
    id: string;
    date: string;
    opponent: string;
    opponentLogo?: string;
    result: 'W' | 'L' | 'TBD';
    score: string;
    tournament?: string;
    format?: string;
  }>;
}

export interface HeadToHeadStats {
  team1: {
    id: string;
    name: string;
    logoUrl?: string;
    wins: number;
  };
  team2: {
    id: string;
    name: string;
    logoUrl?: string;
    wins: number;
  };
  totalSeries: number;
  recentMatches: Array<{
    id: string;
    date: string;
    winner: string;
    score: string;
    tournament?: string;
  }>;
  championsPickedByTeam1: Array<{ name: string; count: number; winRate: number }>;
  championsPickedByTeam2: Array<{ name: string; count: number; winRate: number }>;
  commonBans: Array<{ name: string; count: number }>;
}

export interface SeriesAnalysis {
  id: string;
  date?: string;
  format?: string;
  tournament?: string;
  teams: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    score?: number;
    won?: boolean;
    players: string[];
  }>;
  games: Array<{
    id: string;
    gameNumber: number;
    winner?: 'BLUE' | 'RED';
    blueSide: {
      teamId: string;
      picks: string[];
      bans: string[];
      players: Array<{
        name: string;
        champion: string;
        kills: number;
        deaths: number;
        assists: number;
      }>;
    };
    redSide: {
      teamId: string;
      picks: string[];
      bans: string[];
      players: Array<{
        name: string;
        champion: string;
        kills: number;
        deaths: number;
        assists: number;
      }>;
    };
  }>;
}
