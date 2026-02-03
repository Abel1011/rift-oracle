/**
 * GRID API Client
 * For fetching esports data from GRID's GraphQL APIs
 * 
 * GRID has multiple API endpoints:
 * - Central Data: tournaments, series, teams, players
 * - Statistics Feed: team/player statistics
 * - Live Data Feed: real-time series state (WebSocket)
 */

// Game Title IDs from GRID
export const TITLE_IDS = {
  CSGO: '1',
  DOTA2: '2',
  LOL: '3',        // League of Legends
  PUBG: '4',
  VALORANT: '6',
  R6: '25',        // Rainbow Six Siege
  CS2: '28',       // Counter Strike 2
} as const;

// API Endpoints
export const GRID_ENDPOINTS = {
  CENTRAL_DATA: '/central-data/graphql',
  STATISTICS: '/statistics-feed/graphql',
  LIVE_DATA: '/live-data-feed/series-state/graphql',
} as const;

type GridEndpoint = typeof GRID_ENDPOINTS[keyof typeof GRID_ENDPOINTS];

// Server-side only - these will be read at runtime
function getGridConfig() {
  return {
    baseUrl: process.env.GRID_API_URL || 'https://api-op.grid.gg',
    apiKey: process.env.GRID_API_KEY || '',
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against GRID API
 */
export async function gridQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  endpoint: GridEndpoint = GRID_ENDPOINTS.CENTRAL_DATA
): Promise<T> {
  const { baseUrl, apiKey } = getGridConfig();
  
  if (!apiKey) {
    throw new Error('GRID_API_KEY is not configured');
  }

  const url = `${baseUrl}${endpoint}`;
  console.log('[GRID] Request to:', url); // Debug log
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GRID API error: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  if (!result.data) {
    throw new Error('No data returned from GRID API');
  }

  return result.data;
}

// ============ QUERIES ============

export const QUERIES = {
  // Get all game titles (LoL, Valorant, CS2, etc)
  GET_TITLES: `
    query GetTitles {
      titles {
        id
        name
        nameShortened
      }
    }
  `,

  // Get tournaments with pagination
  GET_TOURNAMENTS: `
    query GetTournaments($first: Int, $after: String, $filter: TournamentFilter) {
      tournaments(first: $first, after: $after, filter: $filter) {
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
        totalCount
        edges {
          cursor
          node {
            id
            name
            nameShortened
          }
        }
      }
    }
  `,

  // Get teams with optional filters
  GET_TEAMS: `
    query GetTeams($first: Int, $after: String, $filter: TeamFilter) {
      teams(first: $first, after: $after, filter: $filter) {
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
        edges {
          node {
            id
            name
            nameShortened
            logoUrl
          }
        }
      }
    }
  `,

  // Get series (matches) with filters
  GET_SERIES: `
    query GetSeries($first: Int, $filter: SeriesFilter) {
      allSeries(first: $first, filter: $filter) {
        totalCount
        edges {
          node {
            id
            startTimeScheduled
            format {
              nameShortened
            }
            teams {
              baseInfo {
                id
                name
                logoUrl
              }
            }
            tournament {
              id
              name
            }
          }
        }
      }
    }
  `,

  // Get series (matches) with detailed data for a specific team
  GET_TEAM_SERIES: `
    query GetTeamSeries($first: Int, $filter: SeriesFilter, $orderBy: SeriesOrderBy!, $orderDirection: OrderDirection!) {
      allSeries(first: $first, filter: $filter, orderBy: $orderBy, orderDirection: $orderDirection) {
        totalCount
        edges {
          node {
            id
            startTimeScheduled
            format {
              nameShortened
            }
            teams {
              baseInfo {
                id
                name
                logoUrl
              }
              scoreAdvantage
            }
            players {
              id
              nickname
            }
            tournament {
              id
              name
            }
          }
        }
      }
    }
  `,

  // Get series details (basic info only - detailed game data requires Live Data Feed API)
  GET_SERIES_DETAILS: `
    query GetSeriesDetails($id: ID!) {
      series(id: $id) {
        id
        startTimeScheduled
        format {
          nameShortened
        }
        teams {
          baseInfo {
            id
            name
            logoUrl
          }
          scoreAdvantage
        }
        players {
          id
          nickname
        }
        tournament {
          id
          name
        }
      }
    }
  `,

  // Get team details
  GET_TEAM_DETAILS: `
    query GetTeamDetails($id: ID!) {
      team(id: $id) {
        id
        name
        nameShortened
        logoUrl
        colorPrimary
        colorSecondary
        organization {
          id
          name
        }
      }
    }
  `,

  // Get team roster from recent series
  GET_TEAM_ROSTER: `
    query GetTeamRoster($first: Int, $filter: SeriesFilter, $orderBy: SeriesOrderBy!, $orderDirection: OrderDirection!) {
      allSeries(first: $first, filter: $filter, orderBy: $orderBy, orderDirection: $orderDirection) {
        edges {
          node {
            players {
              id
              nickname
            }
            teams {
              baseInfo {
                id
              }
            }
          }
        }
      }
    }
  `,

  // Get content catalog entities (champions) for LoL
  GET_CHAMPIONS: `
    query GetChampions($first: Int, $filter: ContentCatalogEntityFilter) {
      contentCatalogEntities(first: $first, filter: $filter) {
        totalCount
        edges {
          node {
            id
            name
            type
            imageUrl
          }
        }
      }
    }
  `,
};

// ============ TYPE DEFINITIONS ============

export interface Title {
  id: string;
  name: string;
  nameShortened?: string;
}

export interface Tournament {
  id: string;
  name: string;
  nameShortened?: string;
}

export interface Team {
  id: string;
  name: string;
  nameShortened?: string;
  logoUrl?: string;
}

export interface Player {
  id: string;
  nickname: string;
}

// TeamParticipant in allSeries/series queries
export interface SeriesTeam {
  baseInfo: Team;
  scoreAdvantage?: number;
}

// Note: GamePlayer, GameTeam, DraftAction, Game are only available 
// through the Live Data Feed API (seriesState), not the central-data API

export interface GamePlayer {
  id: string;
  name: string;
  character?: {
    id: string;
    name: string;
  };
  kills?: number;
  deaths?: number;
  killAssistsGiven?: number;
}

export interface GameTeam {
  id: string;
  side: 'BLUE' | 'RED';
  won?: boolean;
  players?: GamePlayer[];
}

export interface DraftAction {
  id: string;
  type: 'BAN' | 'PICK';
  sequenceNumber: number;
  drafter: {
    id: string;
    type: string;
  };
  draftable: {
    id: string;
    type: string;
    name: string;
  };
}

export interface Game {
  id: string;
  sequenceNumber: number;
  finished?: boolean;
  teams?: GameTeam[];
  draftActions?: DraftAction[];
}

export interface Series {
  id: string;
  startTimeScheduled?: string;
  format?: {
    nameShortened: string;
  };
  teams: SeriesTeam[];
  players?: Player[];
  tournament?: Tournament;
}

export interface TeamDetails extends Team {
  colorPrimary?: string;
  colorSecondary?: string;
  organization?: {
    id: string;
    name: string;
  };
}

export interface TitlesResponse {
  titles: Title[];
}

export interface TournamentsResponse {
  tournaments: {
    pageInfo: {
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
    edges: Array<{
      cursor: string;
      node: Tournament;
    }>;
  };
}

export interface TeamsResponse {
  teams: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    totalCount: number;
    edges: Array<{
      node: Team;
    }>;
  };
}

export interface TeamSeriesResponse {
  allSeries: {
    totalCount: number;
    edges: Array<{
      node: Series;
    }>;
  };
}

export interface SeriesDetailsResponse {
  series: Series;
}

export interface TeamDetailsResponse {
  team: TeamDetails;
}

// ============ API FUNCTIONS ============

/**
 * Fetch all game titles (LoL, Valorant, CS2, etc)
 */
export async function getTitles(): Promise<TitlesResponse> {
  return gridQuery<TitlesResponse>(QUERIES.GET_TITLES);
}

/**
 * Fetch tournaments from GRID
 */
export async function getTournaments(first = 50, after?: string, titleId?: string): Promise<TournamentsResponse> {
  const filter = titleId ? { titleId } : undefined;
  return gridQuery<TournamentsResponse>(QUERIES.GET_TOURNAMENTS, { first, after, filter });
}

/**
 * Fetch teams from GRID, optionally filtered by game title and name
 */
export async function getTeams(
  first = 50, 
  after?: string, 
  titleId?: string,
  nameSearch?: string
): Promise<TeamsResponse> {
  const filter: Record<string, unknown> = {};
  
  if (titleId) {
    filter.titleId = titleId;
  }
  
  // Use GRID's native StringFilter with 'contains' for case-insensitive search
  if (nameSearch) {
    filter.name = { contains: nameSearch };
  }
  
  return gridQuery<TeamsResponse>(QUERIES.GET_TEAMS, { 
    first, 
    after, 
    filter: Object.keys(filter).length > 0 ? filter : undefined 
  });
}

/**
 * Check if GRID API is configured
 */
export function isGridConfigured(): boolean {
  const { apiKey } = getGridConfig();
  return !!apiKey && apiKey !== 'your-api-key-here';
}

/**
 * Fetch recent series for a specific team
 */
export async function getTeamSeries(
  teamId: string,
  first = 20,
  titleId = TITLE_IDS.LOL
): Promise<TeamSeriesResponse> {
  const filter = {
    teamIds: { in: [teamId] },
    titleIds: { in: [titleId] }
  };
  
  return gridQuery<TeamSeriesResponse>(QUERIES.GET_TEAM_SERIES, {
    first,
    filter,
    orderBy: 'StartTimeScheduled',
    orderDirection: 'DESC'
  });
}

/**
 * Fetch series details with games, picks, bans, and player stats
 */
export async function getSeriesDetails(seriesId: string): Promise<SeriesDetailsResponse> {
  return gridQuery<SeriesDetailsResponse>(QUERIES.GET_SERIES_DETAILS, { id: seriesId });
}

/**
 * Fetch team details
 */
export async function getTeamDetails(teamId: string): Promise<TeamDetailsResponse> {
  return gridQuery<TeamDetailsResponse>(QUERIES.GET_TEAM_DETAILS, { id: teamId });
}

/**
 * Fetch head-to-head series between two teams
 */
export async function getHeadToHead(
  team1Id: string,
  team2Id: string,
  first = 10,
  titleId = TITLE_IDS.LOL
): Promise<TeamSeriesResponse> {
  // Get series where either team participated (will filter in code for both)
  const filter = {
    teamIds: { in: [team1Id, team2Id] },
    titleIds: { in: [titleId] }
  };
  
  return gridQuery<TeamSeriesResponse>(QUERIES.GET_TEAM_SERIES, {
    first,
    filter,
    orderBy: 'StartTimeScheduled',
    orderDirection: 'DESC'
  });
}

// ============ STATISTICS FEED QUERIES ============

export const STATISTICS_QUERIES = {
  // Get team statistics (wins, losses, kills, deaths, champion picks)
  GET_TEAM_STATISTICS: `
    query GetTeamStatistics($teamId: ID!, $filter: TeamStatisticsFilter!) {
      teamStatistics(teamId: $teamId, filter: $filter) {
        id
        series {
          count
          won {
            count
            percentage
          }
          kills { sum avg }
          deaths { sum avg }
          firstKill { count percentage }
          duration { avg }
        }
        game {
          count
          won {
            count
            percentage
          }
          kills { sum avg }
          deaths { sum avg }
          duration { avg }
          objectives {
            type
            completionCount { sum avg }
            completedFirst { count percentage }
          }
          players {
            characters {
              character { id name }
              count
              percentage
            }
          }
        }
      }
    }
  `,

  // Get player statistics
  GET_PLAYER_STATISTICS: `
    query GetPlayerStatistics($playerId: ID!, $filter: PlayerStatisticsFilter!) {
      playerStatistics(playerId: $playerId, filter: $filter) {
        id
        game {
          count
          won { count percentage }
          kills { sum avg }
          deaths { sum avg }
          killAssistsReceived { sum avg }
          characters {
            character { id name }
            count
            percentage
          }
        }
      }
    }
  `,
};

// ============ STATISTICS FEED TYPES ============

// Objective type from the Statistics API
export interface ObjectiveStats {
  type: string;  // e.g., 'slayDragon', 'slayBaron', 'destroyTower', 'slayRiftHerald'
  completionCount: { sum: number; avg: number };
  completedFirst: Array<{ count: number; percentage: number }>;
}

export interface TeamStatisticsResponse {
  teamStatistics: {
    id: string;
    series: {
      count: number;
      won: Array<{ count: number; percentage: number }>;  // [true, false] = [wins, losses]
      kills: { sum: number; avg: number };
      deaths: { sum: number; avg: number };
      firstKill: Array<{ count: number; percentage: number }>;
      duration: { avg: string | number };  // ISO 8601 duration string (PT1H55M20.553S)
    };
    game: {
      count: number;
      won: Array<{ count: number; percentage: number }>;
      kills: { sum: number; avg: number };
      deaths: { sum: number; avg: number };
      duration: { avg: string | number };  // ISO 8601 duration string
      objectives: ObjectiveStats[];
      players: {
        characters: Array<{
          character: { id: string; name: string };
          count: number;
          percentage: number;
        }>;
      };
    };
  };
}

export interface PlayerStatisticsResponse {
  playerStatistics: {
    id: string;
    game: {
      count: number;
      won: Array<{ count: number; percentage: number }>;
      kills: { sum: number; avg: number };
      deaths: { sum: number; avg: number };
      killAssistsReceived: { sum: number; avg: number };
      characters: Array<{
        character: { id: string; name: string };
        count: number;
        percentage: number;
      }>;
    };
  };
}

// ============ STATISTICS FEED FUNCTIONS ============

export type TimeWindow = 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_3_MONTHS' | 'LAST_6_MONTHS' | 'LAST_YEAR';

/**
 * Fetch team statistics from the Statistics Feed API
 */
export async function getTeamStatistics(
  teamId: string,
  timeWindow: TimeWindow = 'LAST_6_MONTHS'
): Promise<TeamStatisticsResponse> {
  return gridQuery<TeamStatisticsResponse>(
    STATISTICS_QUERIES.GET_TEAM_STATISTICS,
    { teamId, filter: { timeWindow } },
    GRID_ENDPOINTS.STATISTICS
  );
}

/**
 * Fetch player statistics from the Statistics Feed API
 */
export async function getPlayerStatistics(
  playerId: string,
  timeWindow: TimeWindow = 'LAST_6_MONTHS'
): Promise<PlayerStatisticsResponse> {
  return gridQuery<PlayerStatisticsResponse>(
    STATISTICS_QUERIES.GET_PLAYER_STATISTICS,
    { playerId, filter: { timeWindow } },
    GRID_ENDPOINTS.STATISTICS
  );
}

// ============ LIVE DATA FEED QUERIES ============

export const LIVE_DATA_QUERIES = {
  // Get series result and draft actions
  GET_SERIES_STATE: `
    query GetSeriesState($id: ID!) {
      seriesState(id: $id) {
        id
        started
        finished
        teams {
          id
          name
          won
          score
        }
        games {
          id
          sequenceNumber
          finished
          teams {
            id
            won
          }
          draftActions {
            type
            drafter {
              id
              type
            }
            draftable {
              name
              type
            }
          }
        }
      }
    }
  `,
};

// ============ LIVE DATA FEED TYPES ============

export interface DraftActionData {
  type: 'ban' | 'pick';
  drafter: {
    id: string;
    type: string;
  };
  draftable: {
    name: string;
    type: string;
  };
}

export interface GameStateData {
  id: string;
  sequenceNumber: number;
  finished?: boolean;
  teams: Array<{
    id: string;
    won?: boolean;
  }>;
  draftActions: DraftActionData[];
}

export interface SeriesStateResponse {
  seriesState: {
    id: string;
    started?: boolean;
    finished?: boolean;
    teams: Array<{
      id: string;
      name: string;
      won?: boolean;
      score: number;
    }>;
    games: GameStateData[];
  } | null;
}

// ============ LIVE DATA FEED FUNCTIONS ============

/**
 * Fetch series state (result, score, draft actions) from Live Data Feed
 */
export async function getSeriesState(seriesId: string): Promise<SeriesStateResponse> {
  return gridQuery<SeriesStateResponse>(
    LIVE_DATA_QUERIES.GET_SERIES_STATE,
    { id: seriesId },
    GRID_ENDPOINTS.LIVE_DATA
  );
}

/**
 * Get bans against a team from multiple series
 * Returns a count of champions banned against the team
 */
export async function getTeamBansAgainst(
  teamId: string,
  seriesIds: string[]
): Promise<Map<string, number>> {
  const banCounts = new Map<string, number>();
  
  // Fetch series states in parallel (batch of 5 to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < seriesIds.length; i += batchSize) {
    const batch = seriesIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(id => getSeriesState(id).catch(() => null))
    );
    
    for (const result of results) {
      if (!result?.seriesState?.games) continue;
      
      for (const game of result.seriesState.games) {
        for (const action of game.draftActions || []) {
          // Count bans BY opponents (not by this team)
          if (action.type === 'ban' && action.drafter.id !== teamId) {
            const champName = action.draftable.name;
            banCounts.set(champName, (banCounts.get(champName) || 0) + 1);
          }
        }
      }
    }
  }
  
  return banCounts;
}
