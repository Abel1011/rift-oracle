/**
 * GRID Data Service
 * 
 * Handles downloading and caching team data from GRID APIs
 * Uses File Download API for bulk data (end-states)
 * Uses GraphQL only for series IDs
 */

import { getCache, FileCache, CacheKeys, CacheTTL } from '../cache';
import { getTeamSeries, getTeamDetails, TITLE_IDS } from '../grid/client';
import AdmZip from 'adm-zip';

// ============ TYPES ============

export interface PlayerChampionStats {
  name: string;
  games: number;
  wins: number;
  winRate: number;
}

export interface PlayerStats {
  id: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgDamage: number;
  avgDamagePerMinute: number;
  avgVisionScore: number;
  avgVisionPerMinute: number;
  avgGold: number;
  avgGoldPerMinute: number;
  firstBloodParticipation: number; // % of games with first blood kill/assist
  champions: PlayerChampionStats[];
}

export interface ChampionPickStats {
  name: string;
  count: number;
  wins: number;
  winRate: number;
}

export interface BanStats {
  name: string;
  count: number;
}

export interface ChampionCombo {
  champion1: string;
  champion2: string;
  gamesPlayedTogether: number;
  wins: number;
  winRate: number;
  // How often champion2 is picked when champion1 is picked (affinity)
  affinityRate: number;
}

export interface GamePicksBans {
  teamPicks: string[];      // Our team's picks (champion names)
  teamBans: string[];       // Our team's bans
  opponentPicks: string[];  // Opponent's picks
  opponentBans: string[];   // Opponent's bans (bans against us)
}

export interface MatchResult {
  seriesId: string;
  date: string;
  opponent: string;
  opponentId: string;
  won: boolean;
  score: string;
  tournament?: string;
  // Game-level details
  games: Array<{
    gameNumber: number;
    won: boolean;
    side: 'blue' | 'red';
    duration: number; // minutes
    kills: number;
    deaths: number;
    goldDiff: number;
    draft: GamePicksBans;
  }>;
}

export interface ObjectiveStats {
  avgDragons: number;
  avgBarons: number;
  avgHeralds: number;
  avgVoidGrubs: number;
  avgTowers: number;
  avgInhibitors: number;
  firstDragonRate: number;
  firstBaronRate: number;
  firstTowerRate: number;
  firstBloodRate: number;
  // Dragon types
  dragonsByType: {
    cloud: number;
    infernal: number;
    mountain: number;
    ocean: number;
    hextech: number;
    chemtech: number;
  };
  atakhanKills: number;
}

export interface SideStats {
  blueWins: number;
  blueLosses: number;
  blueWinRate: number;
  redWins: number;
  redLosses: number;
  redWinRate: number;
}

export interface GameAverages {
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgDuration: number; // minutes
  avgGoldDiff: number; // at end of game
  avgDamageDealt: number;
  avgDamageTaken: number;
  avgVisionScore: number;
}

export interface TeamData {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  lastUpdated: string;
  
  // Series record
  seriesWins: number;
  seriesLosses: number;
  seriesWinRate: number;
  
  // Game record
  gamesPlayed: number;
  gamesWon: number;
  gameWinRate: number;
  
  // Side-specific win rates
  sideStats: SideStats;
  
  // Game averages
  gameAverages: GameAverages;
  
  // Objective stats
  objectives: ObjectiveStats;
  
  // Player pools
  players: PlayerStats[];
  
  // Champion stats
  mostPicked: ChampionPickStats[];
  mostBannedAgainst: BanStats[];
  
  // Champion combos (pairs that are frequently picked together)
  championCombos: ChampionCombo[];
  
  // Recent matches with details
  recentMatches: MatchResult[];
  
  // Source series IDs
  seriesIds: string[];
}

// Extended interface for the actual API response
export interface SeriesEndState {
  seriesState: {
    id: string;
    finished: boolean;
    startedAt?: string;
    teams: Array<{
      id: string;
      name: string;
      won: boolean;
      score: number;
      kills?: number;
      deaths?: number;
      firstKill?: boolean;
      objectives?: Array<{
        type: string;
        completionCount: number;
        completedFirst: boolean;
      }>;
      players?: Array<{
        id: string;
        name: string;
        kills: number;
        deaths: number;
        killAssistsGiven: number;
        firstKill?: boolean;
      }>;
    }>;
    games: Array<{
      sequenceNumber: number;
      finished: boolean;
      clock?: { currentSeconds: number };
      teams: Array<{
        id: string;
        side: string;
        won: boolean;
        kills: number;
        deaths: number;
        killAssistsGiven?: number;
        damageDealt?: number;
        damageTaken?: number;
        visionScore?: number;
        netWorth?: number;
        totalMoneyEarned?: number;
        moneyDifference?: number;
        firstKill?: boolean;
        objectives?: Array<{
          type: string;
          completionCount: number;
          completedFirst: boolean;
        }>;
        players: Array<{
          id: string;
          name: string;
          character: { id: string; name: string };
          kills: number;
          deaths: number;
          killAssistsGiven: number;
          damageDealt?: number;
          visionScore?: number;
          netWorth?: number;
          totalMoneyEarned?: number;
          firstKill?: boolean;
        }>;
      }>;
      draftActions: Array<{
        type: 'ban' | 'pick';
        drafter: { id: string; type: string };
        draftable: { name: string; type: string };
      }>;
    }>;
  };
}

export interface PrepareJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  progress: number;
  message?: string;
  teams: {
    blue: { teamId: string; status: 'pending' | 'downloading' | 'ready' | 'error' };
    red: { teamId: string; status: 'pending' | 'downloading' | 'ready' | 'error' };
  };
  startedAt: string;
  completedAt?: string;
}

// ============ EVENTS FEATURES (Series Events JSONL) ============

export interface DraftActionFeature {
  gameNumber?: number;
  sequenceNumber: number;
  type: 'pick' | 'ban';
  teamId?: string;
  side?: 'blue' | 'red';
  champion: string;
}

export interface SeriesEventsFeatures {
  seriesId: string;
  extractedAt: string;
  draftActions: DraftActionFeature[];
  itemPurchasesByTeam: Record<string, Record<string, number>>; // teamId -> itemName -> count
  itemPurchasesByTeamAndChampion: Record<string, Record<string, Record<string, number>>>; // teamId -> championName -> itemName -> count
  stats: {
    linesProcessed: number;
    eventsProcessed: number;
  };
}

// ============ FILE DOWNLOAD API ============

const FILE_DOWNLOAD_API = 'https://api.grid.gg/file-download';

async function downloadSeriesEndState(seriesId: string): Promise<SeriesEndState | null> {
  const apiKey = process.env.GRID_API_KEY;
  if (!apiKey) return null;

  const cacheKey = CacheKeys.seriesEndState(seriesId);
  const cached = await FileCache.get<SeriesEndState>(cacheKey);
  if (cached) {
    console.log(`[GRID] Cache hit for series ${seriesId}`);
    return cached;
  }

  try {
    console.log(`[GRID] Downloading end-state for series ${seriesId}`);
    const response = await fetch(`${FILE_DOWNLOAD_API}/end-state/grid/series/${seriesId}`, {
      headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) {
      console.error(`[GRID] Download failed for series ${seriesId}: ${response.status}`);
      return null;
    }

    const data = await response.json() as SeriesEndState;
    await FileCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[GRID] Error downloading series ${seriesId}:`, error);
    return null;
  }
}

function incrementNestedCounter(obj: Record<string, number>, key: string, inc = 1) {
  obj[key] = (obj[key] ?? 0) + inc;
}

function ensureRecord<T>(obj: Record<string, T>, key: string, make: () => T): T {
  if (!obj[key]) obj[key] = make();
  return obj[key];
}

function extractDraftActionsFromEvent(event: any): DraftActionFeature[] {
  const actions: DraftActionFeature[] = [];
  const side = (event?.actor?.state?.side ?? event?.actor?.side ?? '').toString().toLowerCase();
  const normalizedSide = side === 'blue' || side === 'red' ? (side as 'blue' | 'red') : undefined;

  const deltaGames = event?.seriesStateDelta?.games;
  if (!Array.isArray(deltaGames)) return actions;

  for (const game of deltaGames) {
    const gameNumber = typeof game?.sequenceNumber === 'number' ? game.sequenceNumber : undefined;
    const draftActions = game?.draftActions;
    if (!Array.isArray(draftActions)) continue;

    for (const draftAction of draftActions) {
      const type = (draftAction?.type ?? '').toString().toLowerCase();
      if (type !== 'pick' && type !== 'ban') continue;

      const champion = draftAction?.draftable?.name;
      if (!champion || typeof champion !== 'string') continue;

      const sequenceNumber = draftAction?.sequenceNumber;
      if (typeof sequenceNumber !== 'number') continue;

      const teamId = draftAction?.drafter?.id ?? event?.actor?.id;
      actions.push({
        gameNumber,
        sequenceNumber,
        type,
        teamId: teamId ? String(teamId) : undefined,
        side: normalizedSide,
        champion,
      });
    }
  }

  return actions;
}

function processItemPurchaseEvent(
  event: any,
  byTeam: SeriesEventsFeatures['itemPurchasesByTeam'],
  byTeamAndChampion: SeriesEventsFeatures['itemPurchasesByTeamAndChampion']
) {
  const itemName = event?.target?.name;
  if (!itemName || typeof itemName !== 'string') return;

  const teamId = event?.actor?.state?.teamId ?? event?.actor?.teamId;
  if (!teamId) return;

  const teamKey = String(teamId);
  const teamMap = ensureRecord(byTeam, teamKey, () => ({}));
  incrementNestedCounter(teamMap, itemName, 1);

  const championName = event?.actor?.state?.character?.name;
  if (championName && typeof championName === 'string') {
    const champMap = ensureRecord(byTeamAndChampion, teamKey, () => ({}));
    const itemMap = ensureRecord(champMap, championName, () => ({}));
    incrementNestedCounter(itemMap, itemName, 1);
  }
}

async function downloadSeriesEventsFeatures(seriesId: string): Promise<SeriesEventsFeatures | null> {
  const apiKey = process.env.GRID_API_KEY;
  if (!apiKey) return null;

  const cacheKey = CacheKeys.seriesEventsFeatures(seriesId);
  const cached = await FileCache.get<SeriesEventsFeatures>(cacheKey);
  if (cached) {
    console.log(`[GRID] Cache hit for series events features ${seriesId}`);
    return cached;
  }

  try {
    console.log(`[GRID] Downloading events zip for series ${seriesId}`);
    const response = await fetch(`${FILE_DOWNLOAD_API}/events/grid/series/${seriesId}`, {
      headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) {
      console.error(`[GRID] Events download failed for series ${seriesId}: ${response.status}`);
      return null;
    }

    const zipBuffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    const jsonlEntry = entries.find(e => e.entryName.toLowerCase().endsWith('.jsonl'));
    if (!jsonlEntry) {
      console.error(`[GRID] No .jsonl entry found in events zip for series ${seriesId}`);
      return null;
    }

    const jsonlText = jsonlEntry.getData().toString('utf8');

    const features: SeriesEventsFeatures = {
      seriesId: String(seriesId),
      extractedAt: new Date().toISOString(),
      draftActions: [],
      itemPurchasesByTeam: {},
      itemPurchasesByTeamAndChampion: {},
      stats: { linesProcessed: 0, eventsProcessed: 0 },
    };

    // Parse JSONL without splitting into an array (avoids large intermediate allocations)
    let start = 0;
    while (start < jsonlText.length) {
      const end = jsonlText.indexOf('\n', start);
      const line = (end === -1 ? jsonlText.slice(start) : jsonlText.slice(start, end)).trim();
      start = end === -1 ? jsonlText.length : end + 1;
      if (!line) continue;

      features.stats.linesProcessed++;

      let record: any;
      try {
        record = JSON.parse(line);
      } catch {
        continue;
      }

      const events = record?.events;
      if (!Array.isArray(events)) continue;

      for (const event of events) {
        features.stats.eventsProcessed++;
        const type = (event?.type ?? '').toString();

        if (type === 'team-picked-character' || type === 'team-banned-character') {
          features.draftActions.push(...extractDraftActionsFromEvent(event));
        }

        if (type === 'player-purchased-item') {
          processItemPurchaseEvent(event, features.itemPurchasesByTeam, features.itemPurchasesByTeamAndChampion);
        }
      }
    }

    // Stable ordering for draft actions
    features.draftActions.sort((a, b) => {
      const gA = a.gameNumber ?? 0;
      const gB = b.gameNumber ?? 0;
      if (gA !== gB) return gA - gB;
      return a.sequenceNumber - b.sequenceNumber;
    });

    await FileCache.set(cacheKey, features);
    return features;
  } catch (error) {
    console.error(`[GRID] Error downloading/parsing events for series ${seriesId}:`, error);
    return null;
  }
}

export async function getSeriesEventsFeatures(seriesId: string): Promise<SeriesEventsFeatures | null> {
  return FileCache.get<SeriesEventsFeatures>(CacheKeys.seriesEventsFeatures(seriesId));
}

export async function isSeriesEventsFeaturesCached(seriesId: string): Promise<boolean> {
  return FileCache.exists(CacheKeys.seriesEventsFeatures(seriesId));
}

export async function prepareSeriesEventsFeatures(seriesId: string): Promise<SeriesEventsFeatures | null> {
  return downloadSeriesEventsFeatures(seriesId);
}

export async function prepareSeriesEndState(seriesId: string): Promise<SeriesEndState | null> {
  return downloadSeriesEndState(seriesId);
}

// ============ HELPER FUNCTIONS ============

function getObjectiveCount(objectives: Array<{ type: string; completionCount: number; completedFirst: boolean }> | undefined, type: string): number {
  return objectives?.find(o => o.type === type)?.completionCount || 0;
}

function getObjectiveFirst(objectives: Array<{ type: string; completionCount: number; completedFirst: boolean }> | undefined, type: string): boolean {
  return objectives?.find(o => o.type === type)?.completedFirst || false;
}

// ============ DATA AGGREGATION ============

function aggregateTeamData(
  teamId: string,
  teamName: string,
  teamLogo: string | undefined,
  seriesData: SeriesEndState[],
  seriesIds: string[]
): TeamData {
  // Player tracking
  const playerStatsMap = new Map<string, {
    id: string;
    name: string;
    games: number;
    wins: number;
    kills: number;
    deaths: number;
    assists: number;
    damage: number;
    visionScore: number;
    gold: number;
    totalDuration: number; // for per-minute calculations
    firstBloods: number;
    champions: Map<string, { games: number; wins: number }>;
  }>();

  // Champion tracking
  const championPicksMap = new Map<string, { count: number; wins: number }>();
  const bansAgainstMap = new Map<string, number>();
  
  // Champion combo tracking - tracks pairs of champions picked together
  const championComboMap = new Map<string, { games: number; wins: number }>();
  // Track how many games each champion was picked (for affinity calculation)
  const championGamesMap = new Map<string, number>();
  
  // Match records
  const matches: MatchResult[] = [];

  // Counters
  let totalSeriesWins = 0;
  let totalSeriesLosses = 0;
  let totalGamesPlayed = 0;
  let totalGamesWon = 0;

  // Side stats
  let blueWins = 0, blueLosses = 0;
  let redWins = 0, redLosses = 0;

  // Game totals for averages
  let totalKills = 0, totalDeaths = 0, totalAssists = 0;
  let totalDuration = 0;
  let totalGoldDiff = 0;
  let totalDamageDealt = 0, totalDamageTaken = 0;
  let totalVisionScore = 0;

  // Objective totals
  let totalDragons = 0, totalBarons = 0, totalHeralds = 0;
  let totalVoidGrubs = 0, totalTowers = 0, totalInhibitors = 0;
  let firstDragons = 0, firstBarons = 0, firstTowers = 0, firstBloods = 0;
  let atakhanKills = 0;
  
  // Dragon types
  const dragonTypes = { cloud: 0, infernal: 0, mountain: 0, ocean: 0, hextech: 0, chemtech: 0 };

  for (const series of seriesData) {
    if (!series?.seriesState) continue;

    const { teams, games } = series.seriesState;
    const ourTeam = teams.find(t => t.id === teamId);
    const opponent = teams.find(t => t.id !== teamId);

    if (!ourTeam || !opponent) continue;

    // Series result
    if (ourTeam.won) {
      totalSeriesWins++;
    } else {
      totalSeriesLosses++;
    }

    // Process series-level objectives if available
    if (ourTeam.objectives) {
      atakhanKills += getObjectiveCount(ourTeam.objectives, 'slayThornboundAtakhan');
    }

    // Game details for match record
    const gameDetails: MatchResult['games'] = [];

    // Process each game
    for (const game of games || []) {
      const ourGameTeam = game.teams?.find(t => t.id === teamId);
      const oppGameTeam = game.teams?.find(t => t.id !== teamId);
      if (!ourGameTeam) continue;

      const gameWon = ourGameTeam.won;
      const side = ourGameTeam.side as 'blue' | 'red';
      const durationSeconds = game.clock?.currentSeconds || 0;
      const durationMinutes = durationSeconds / 60;

      totalGamesPlayed++;
      if (gameWon) totalGamesWon++;

      // Side stats
      if (side === 'blue') {
        if (gameWon) blueWins++; else blueLosses++;
      } else {
        if (gameWon) redWins++; else redLosses++;
      }

      // Team totals
      const teamKills = ourGameTeam.kills || 0;
      const teamDeaths = ourGameTeam.deaths || 0;
      const teamAssists = ourGameTeam.killAssistsGiven || 0;
      const goldDiff = ourGameTeam.moneyDifference || 0;
      const damageDealt = ourGameTeam.damageDealt || 0;
      const damageTaken = ourGameTeam.damageTaken || 0;
      const visionScore = ourGameTeam.visionScore || 0;

      totalKills += teamKills;
      totalDeaths += teamDeaths;
      totalAssists += teamAssists;
      totalDuration += durationMinutes;
      totalGoldDiff += goldDiff;
      totalDamageDealt += damageDealt;
      totalDamageTaken += damageTaken;
      totalVisionScore += visionScore;

      // Objectives from game team
      if (ourGameTeam.objectives) {
        totalDragons += getObjectiveCount(ourGameTeam.objectives, 'slayDragon');
        totalBarons += getObjectiveCount(ourGameTeam.objectives, 'slayBaron');
        totalHeralds += getObjectiveCount(ourGameTeam.objectives, 'slayRiftHerald');
        totalVoidGrubs += getObjectiveCount(ourGameTeam.objectives, 'slayVoidGrub');
        totalTowers += getObjectiveCount(ourGameTeam.objectives, 'destroyTower');
        totalInhibitors += getObjectiveCount(ourGameTeam.objectives, 'destroyFortifier');

        if (getObjectiveFirst(ourGameTeam.objectives, 'slayDragon')) firstDragons++;
        if (getObjectiveFirst(ourGameTeam.objectives, 'slayBaron')) firstBarons++;
        if (getObjectiveFirst(ourGameTeam.objectives, 'destroyTower')) firstTowers++;

        // Dragon types
        dragonTypes.cloud += getObjectiveCount(ourGameTeam.objectives, 'slayCloudDrake');
        dragonTypes.infernal += getObjectiveCount(ourGameTeam.objectives, 'slayInfernalDrake');
        dragonTypes.mountain += getObjectiveCount(ourGameTeam.objectives, 'slayMountainDrake');
        dragonTypes.ocean += getObjectiveCount(ourGameTeam.objectives, 'slayOceanDrake');
        dragonTypes.hextech += getObjectiveCount(ourGameTeam.objectives, 'slayHextechDrake');
        dragonTypes.chemtech += getObjectiveCount(ourGameTeam.objectives, 'slayChemtechDrake');
      }

      // First blood
      if (ourGameTeam.firstKill) firstBloods++;

      // Extract draft picks/bans for this game
      const draft: GamePicksBans = {
        teamPicks: [],
        teamBans: [],
        opponentPicks: [],
        opponentBans: [],
      };

      for (const action of game.draftActions || []) {
        if (action.draftable.type !== 'character') continue;
        const champName = action.draftable.name;
        const isOurTeam = action.drafter.id === teamId;
        
        if (action.type === 'pick') {
          if (isOurTeam) {
            draft.teamPicks.push(champName);
          } else {
            draft.opponentPicks.push(champName);
          }
        } else if (action.type === 'ban') {
          if (isOurTeam) {
            draft.teamBans.push(champName);
          } else {
            draft.opponentBans.push(champName);
          }
        }
      }

      // Game detail for match record
      gameDetails.push({
        gameNumber: game.sequenceNumber,
        won: gameWon,
        side,
        duration: Math.round(durationMinutes),
        kills: teamKills,
        deaths: teamDeaths,
        goldDiff,
        draft,
      });

      // Track champion combos (pairs picked together in same game)
      // Update individual champion games count
      for (const champName of draft.teamPicks) {
        championGamesMap.set(champName, (championGamesMap.get(champName) || 0) + 1);
      }
      // Generate all pairs and track them
      for (let i = 0; i < draft.teamPicks.length; i++) {
        for (let j = i + 1; j < draft.teamPicks.length; j++) {
          // Create a consistent key (alphabetically sorted)
          const [champ1, champ2] = [draft.teamPicks[i], draft.teamPicks[j]].sort();
          const comboKey = `${champ1}|${champ2}`;
          const existing = championComboMap.get(comboKey) || { games: 0, wins: 0 };
          existing.games++;
          if (gameWon) existing.wins++;
          championComboMap.set(comboKey, existing);
        }
      }

      // Player stats
      for (const player of ourGameTeam.players || []) {
        const existing = playerStatsMap.get(player.id) || {
          id: player.id,
          name: player.name,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
          visionScore: 0,
          gold: 0,
          totalDuration: 0,
          firstBloods: 0,
          champions: new Map(),
        };

        existing.games++;
        if (gameWon) existing.wins++;
        existing.kills += player.kills || 0;
        existing.deaths += player.deaths || 0;
        existing.assists += player.killAssistsGiven || 0;
        existing.damage += player.damageDealt || 0;
        existing.visionScore += player.visionScore || 0;
        existing.gold += player.totalMoneyEarned || player.netWorth || 0;
        existing.totalDuration += durationMinutes;
        if (player.firstKill) existing.firstBloods++;

        // Champion usage
        const champName = player.character?.name || 'Unknown';
        const champStats = existing.champions.get(champName) || { games: 0, wins: 0 };
        champStats.games++;
        if (gameWon) champStats.wins++;
        existing.champions.set(champName, champStats);

        playerStatsMap.set(player.id, existing);

        // Team champion picks
        const pickStats = championPicksMap.get(champName) || { count: 0, wins: 0 };
        pickStats.count++;
        if (gameWon) pickStats.wins++;
        championPicksMap.set(champName, pickStats);
      }

      // Bans against our team (by opponents)
      for (const action of game.draftActions || []) {
        if (action.type === 'ban' && action.drafter.id !== teamId && action.draftable.type === 'character') {
          const champName = action.draftable.name;
          bansAgainstMap.set(champName, (bansAgainstMap.get(champName) || 0) + 1);
        }
      }
    }

    // Match record
    matches.push({
      seriesId: series.seriesState.id,
      date: series.seriesState.startedAt || '',
      opponent: opponent.name,
      opponentId: opponent.id,
      won: ourTeam.won,
      score: `${ourTeam.score}-${opponent.score}`,
      games: gameDetails,
    });
  }

  // Calculate averages
  const gp = totalGamesPlayed || 1; // avoid division by zero

  // Format player stats
  const players: PlayerStats[] = Array.from(playerStatsMap.values())
    .map(p => {
      const kda = p.deaths > 0 ? (p.kills + p.assists) / p.deaths : p.kills + p.assists;
      const avgDuration = p.games > 0 ? p.totalDuration / p.games : 0;
      
      return {
        id: p.id,
        name: p.name,
        gamesPlayed: p.games,
        wins: p.wins,
        winRate: p.games > 0 ? (p.wins / p.games) * 100 : 0,
        avgKills: p.games > 0 ? p.kills / p.games : 0,
        avgDeaths: p.games > 0 ? p.deaths / p.games : 0,
        avgAssists: p.games > 0 ? p.assists / p.games : 0,
        avgKDA: kda,
        avgDamage: p.games > 0 ? Math.round(p.damage / p.games) : 0,
        avgDamagePerMinute: p.totalDuration > 0 ? Math.round(p.damage / p.totalDuration) : 0,
        avgVisionScore: p.games > 0 ? Math.round((p.visionScore / p.games) * 10) / 10 : 0,
        avgVisionPerMinute: p.totalDuration > 0 ? Math.round((p.visionScore / p.totalDuration) * 100) / 100 : 0,
        avgGold: p.games > 0 ? Math.round(p.gold / p.games) : 0,
        avgGoldPerMinute: p.totalDuration > 0 ? Math.round(p.gold / p.totalDuration) : 0,
        firstBloodParticipation: p.games > 0 ? (p.firstBloods / p.games) * 100 : 0,
        champions: Array.from(p.champions.entries())
          .sort((a, b) => b[1].games - a[1].games)
          .map(([name, stats]) => ({
            name,
            games: stats.games,
            wins: stats.wins,
            winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
          })),
      };
    })
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // Format champion picks
  const mostPicked: ChampionPickStats[] = Array.from(championPicksMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      wins: stats.wins,
      winRate: stats.count > 0 ? (stats.wins / stats.count) * 100 : 0,
    }));

  // Format bans against
  const mostBannedAgainst: BanStats[] = Array.from(bansAgainstMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  // Format champion combos (pairs that are frequently picked together)
  const championCombos: ChampionCombo[] = Array.from(championComboMap.entries())
    .filter(([_, stats]) => stats.games >= 2) // Minimum 2 games together to be significant
    .map(([comboKey, stats]) => {
      const [champion1, champion2] = comboKey.split('|');
      const champ1Games = championGamesMap.get(champion1) || 1;
      const champ2Games = championGamesMap.get(champion2) || 1;
      // Affinity: how often they appear together relative to how often the less-picked one appears
      const minGames = Math.min(champ1Games, champ2Games);
      const affinityRate = (stats.games / minGames) * 100;
      
      return {
        champion1,
        champion2,
        gamesPlayedTogether: stats.games,
        wins: stats.wins,
        winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0,
        affinityRate: Math.min(100, affinityRate), // Cap at 100%
      };
    })
    .sort((a, b) => {
      // Sort by affinity first, then by games played together
      if (b.affinityRate !== a.affinityRate) return b.affinityRate - a.affinityRate;
      return b.gamesPlayedTogether - a.gamesPlayedTogether;
    })
    .slice(0, 15); // Top 15 combos

  // Sort matches by date (newest first)
  matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate team KDA
  const teamKDA = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;

  return {
    teamId,
    teamName,
    teamLogo,
    lastUpdated: new Date().toISOString(),
    
    seriesWins: totalSeriesWins,
    seriesLosses: totalSeriesLosses,
    seriesWinRate: (totalSeriesWins + totalSeriesLosses) > 0 
      ? (totalSeriesWins / (totalSeriesWins + totalSeriesLosses)) * 100 
      : 0,
    
    gamesPlayed: totalGamesPlayed,
    gamesWon: totalGamesWon,
    gameWinRate: totalGamesPlayed > 0 ? (totalGamesWon / totalGamesPlayed) * 100 : 0,
    
    sideStats: {
      blueWins,
      blueLosses,
      blueWinRate: (blueWins + blueLosses) > 0 ? (blueWins / (blueWins + blueLosses)) * 100 : 0,
      redWins,
      redLosses,
      redWinRate: (redWins + redLosses) > 0 ? (redWins / (redWins + redLosses)) * 100 : 0,
    },
    
    gameAverages: {
      avgKills: Math.round((totalKills / gp) * 10) / 10,
      avgDeaths: Math.round((totalDeaths / gp) * 10) / 10,
      avgAssists: Math.round((totalAssists / gp) * 10) / 10,
      avgKDA: Math.round(teamKDA * 100) / 100,
      avgDuration: Math.round(totalDuration / gp),
      avgGoldDiff: Math.round(totalGoldDiff / gp),
      avgDamageDealt: Math.round(totalDamageDealt / gp),
      avgDamageTaken: Math.round(totalDamageTaken / gp),
      avgVisionScore: Math.round(totalVisionScore / gp),
    },
    
    objectives: {
      avgDragons: Math.round((totalDragons / gp) * 10) / 10,
      avgBarons: Math.round((totalBarons / gp) * 10) / 10,
      avgHeralds: Math.round((totalHeralds / gp) * 10) / 10,
      avgVoidGrubs: Math.round((totalVoidGrubs / gp) * 10) / 10,
      avgTowers: Math.round((totalTowers / gp) * 10) / 10,
      avgInhibitors: Math.round((totalInhibitors / gp) * 10) / 10,
      firstDragonRate: gp > 0 ? (firstDragons / gp) * 100 : 0,
      firstBaronRate: gp > 0 ? (firstBarons / gp) * 100 : 0,
      firstTowerRate: gp > 0 ? (firstTowers / gp) * 100 : 0,
      firstBloodRate: gp > 0 ? (firstBloods / gp) * 100 : 0,
      dragonsByType: dragonTypes,
      atakhanKills,
    },
    
    players,
    mostPicked,
    mostBannedAgainst,
    championCombos,
    recentMatches: matches.slice(0, 30),
    seriesIds,
  };
}

// ============ MAIN SERVICE FUNCTIONS ============

/**
 * Download and cache team data from GRID
 */
export async function prepareTeamData(
  teamId: string,
  maxSeries: number = 15,
  onProgress?: (progress: number, message: string) => void
): Promise<TeamData | null> {
  const cache = getCache();
  
  const cacheKey = CacheKeys.teamData(teamId);
  const cached = await cache.get<TeamData>(cacheKey);
  if (cached) {
    console.log(`[GRID Service] Cache hit for team ${teamId}`);
    onProgress?.(100, 'Data loaded from cache');
    return cached;
  }

  onProgress?.(5, 'Fetching team info...');
  
  // Get team details - this can throw if team doesn't exist
  let teamDetails;
  try {
    teamDetails = await getTeamDetails(teamId);
  } catch (err) {
    console.error(`[GRID Service] Failed to get team details for ${teamId}:`, err);
    throw new Error(`Team not found or API error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
  
  const teamName = teamDetails.team.name;
  const teamLogo = teamDetails.team.logoUrl;

  onProgress?.(15, 'Fetching recent series...');

  let seriesIds: string[] = [];
  try {
    seriesIds = await getTeamRecentSeriesIds(teamId, maxSeries, TITLE_IDS.LOL);
  } catch (err) {
    console.error(`[GRID Service] Failed to get series for team ${teamId}:`, err);
    throw new Error(`Failed to fetch team series: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  if (seriesIds.length === 0) {
    console.log(`[GRID Service] No LoL series found for team ${teamId} (${teamName})`);
    onProgress?.(100, 'No series found');
    // Return null to indicate no data (not an error)
    return null;
  }

  onProgress?.(25, `Downloading ${seriesIds.length} series...`);

  const seriesData: SeriesEndState[] = [];
  let downloadErrors = 0;
  
  for (let i = 0; i < seriesIds.length; i++) {
    try {
      const endState = await downloadSeriesEndState(seriesIds[i]);
      if (endState) {
        seriesData.push(endState);
      } else {
        downloadErrors++;
      }
    } catch (err) {
      console.error(`[GRID Service] Failed to download series ${seriesIds[i]}:`, err);
      downloadErrors++;
    }
    
    const progress = 25 + Math.round((i + 1) / seriesIds.length * 60);
    onProgress?.(progress, `Downloaded ${i + 1}/${seriesIds.length} series`);
  }

  // If we couldn't download any series data, return null
  if (seriesData.length === 0) {
    console.log(`[GRID Service] No series data could be downloaded for team ${teamId}. ${downloadErrors} errors.`);
    onProgress?.(100, 'No series data available');
    return null;
  }

  console.log(`[GRID Service] Downloaded ${seriesData.length}/${seriesIds.length} series for team ${teamId}`);
  onProgress?.(90, 'Aggregating data...');

  const teamData = aggregateTeamData(teamId, teamName, teamLogo, seriesData, seriesIds);

  await cache.set(cacheKey, teamData, { ttl: CacheTTL.TEAM_DATA });

  onProgress?.(100, 'Data ready');

  return teamData;
}

/**
 * Get recent series IDs for a team, cached in Redis/memory with a TTL.
 * This avoids repeating GraphQL calls during cron ingestion.
 */
export async function getTeamRecentSeriesIds(
  teamId: string,
  first: number,
  titleId: typeof TITLE_IDS.LOL = TITLE_IDS.LOL
): Promise<string[]> {
  const cache = getCache();
  const cacheKey = CacheKeys.teamSeriesIds(teamId, titleId, first);
  const cached = await cache.get<string[]>(cacheKey);
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  const seriesRes = await getTeamSeries(teamId, first, titleId);
  const seriesIds = (seriesRes?.allSeries?.edges ?? []).map(e => e.node.id).filter(Boolean);
  await cache.set(cacheKey, seriesIds, { ttl: CacheTTL.SERIES_IDS });
  return seriesIds;
}

/**
 * Get cached team data (doesn't download if not cached)
 */
export async function getTeamData(teamId: string): Promise<TeamData | null> {
  const cache = getCache();
  const cacheKey = CacheKeys.teamData(teamId);
  return cache.get<TeamData>(cacheKey);
}

/**
 * Check if team data is cached
 */
export async function isTeamDataCached(teamId: string): Promise<boolean> {
  const cache = getCache();
  const cacheKey = CacheKeys.teamData(teamId);
  return cache.exists(cacheKey);
}

/**
 * Clear team data cache
 */
export async function clearTeamCache(teamId: string): Promise<void> {
  const cache = getCache();
  const cacheKey = CacheKeys.teamData(teamId);
  await cache.delete(cacheKey);
}

// ============ JOB MANAGEMENT ============

const activeJobs = new Map<string, PrepareJobStatus>();

export async function startPrepareJob(
  blueTeamId: string,
  redTeamId: string
): Promise<string> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const status: PrepareJobStatus = {
    jobId,
    status: 'pending',
    progress: 0,
    teams: {
      blue: { teamId: blueTeamId, status: 'pending' },
      red: { teamId: redTeamId, status: 'pending' },
    },
    startedAt: new Date().toISOString(),
  };

  activeJobs.set(jobId, status);

  processJob(jobId, blueTeamId, redTeamId).catch(err => {
    console.error(`[Job ${jobId}] Error:`, err);
    const job = activeJobs.get(jobId);
    if (job) {
      job.status = 'error';
      job.message = err.message;
    }
  });

  return jobId;
}

async function processJob(jobId: string, blueTeamId: string, redTeamId: string): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';

  job.teams.blue.status = 'downloading';
  await prepareTeamData(blueTeamId, 15, (progress, message) => {
    job.progress = Math.round(progress / 2);
    job.message = `Blue team: ${message}`;
  });
  job.teams.blue.status = 'ready';

  job.teams.red.status = 'downloading';
  await prepareTeamData(redTeamId, 15, (progress, message) => {
    job.progress = 50 + Math.round(progress / 2);
    job.message = `Red team: ${message}`;
  });
  job.teams.red.status = 'ready';

  job.status = 'ready';
  job.progress = 100;
  job.completedAt = new Date().toISOString();
  job.message = 'All data ready';
}

export function getJobStatus(jobId: string): PrepareJobStatus | null {
  return activeJobs.get(jobId) || null;
}

export function cleanupJobs(): void {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000;

  for (const [jobId, job] of activeJobs.entries()) {
    const jobAge = now - new Date(job.startedAt).getTime();
    if (jobAge > maxAge) {
      activeJobs.delete(jobId);
    }
  }
}
