/**
 * Draft Analysis Service
 * 
 * Provides real-time draft recommendations using GRID data:
 * - Team champion pools and win rates
 * - Player signature champions
 * - Counter-picks based on historical matchups
 * - Synergy analysis from team compositions
 * - Predicted enemy picks based on tendencies
 */

import type { TeamData, ChampionPickStats, BanStats, PlayerStats } from './gridDataService';
import type { DraftState, Role } from '../types';
import { CHAMPIONS } from '../data';

// ============ TYPES ============

export interface DraftRecommendation {
  championId: string;
  championName: string;
  predictedWinRate: number;
  score: number;
  reasons: string[];
  tags: ('SIGNATURE' | 'HIGH_WINRATE' | 'COUNTER' | 'SYNERGY' | 'FLEX' | 'DENY' | 'COMFORT')[];
}

export interface DraftPrediction {
  championId: string;
  championName: string;
  probability: number;
  reasons: string[];
}

export interface StrategyInsights {
  earlyGame: {
    edge: number; // -100..100 (positive = favor us)
    label: string;
    details: Array<{ key: string; our: number; enemy: number; unit: '%' | '' }>;
    recommendations: string[];
  };
  objectives: {
    focus: 'DRAGONS' | 'TOWERS' | 'BARON' | 'HERALD' | 'BALANCED';
    details: Array<{ key: string; our: number; enemy: number; unit: '' }>;
    recommendations: string[];
  };
  tempo: {
    ourAvgDuration: number;
    enemyAvgDuration: number;
    style: 'FAST' | 'SLOW' | 'MIXED';
    recommendations: string[];
  };
  macroEdge: {
    avgGoldDiff: { our: number; enemy: number };
    avgVisionScore: { our: number; enemy: number };
  };
}

export interface DraftWarning {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  suggestion?: string;
}

export interface DraftAnalysis {
  // Current state
  currentTurn: number;
  phase: string;
  currentSide: 'BLUE' | 'RED';
  currentAction: 'PICK' | 'BAN';
  
  // Win probability
  winProbability: {
    ourTeam: number;
    enemyTeam: number;
    delta: number; // Change from last turn
  };
  
  // Recommendations for our team
  recommendations: DraftRecommendation[];
  
  // Predictions for enemy team
  enemyPredictions: DraftPrediction[];

  // Macro/plan insights (team-data derived; heuristic)
  strategyInsights?: StrategyInsights;
  
  // Warnings and suggestions
  warnings: DraftWarning[];
  
  // Composition analysis
  compositionAnalysis: {
    ourTeam: CompositionInfo;
    enemyTeam: CompositionInfo;
  };
}

export interface CompositionInfo {
  tags: string[];
  missingRoles: string[];
  damageProfile: {
    physical: number;
    magic: number;
    mixed: number;
  };
  strengths: string[];
  weaknesses: string[];
}

// ============ HELPERS ============

const ALL_ROLES: Role[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const getChampionByName = (name: string) => 
  CHAMPIONS.find(c => c.name.toLowerCase() === name.toLowerCase());

const getChampionById = (id: string) => 
  CHAMPIONS.find(c => c.id === id);

function normalizePredictions(predictions: DraftPrediction[]): DraftPrediction[] {
  if (predictions.length === 0) return predictions;
  const total = predictions.reduce((sum, p) => sum + (Number.isFinite(p.probability) ? p.probability : 0), 0);
  if (total <= 0) return predictions;
  return predictions.map(p => ({
    ...p,
    probability: (p.probability / total) * 100,
  }));
}

// Standard draft order: who picks/bans at each turn
const DRAFT_ORDER: Array<{ side: 'BLUE' | 'RED'; type: 'BAN' | 'PICK' }> = [
  // Ban phase 1 (turns 0-5)
  { side: 'BLUE', type: 'BAN' },  // 0
  { side: 'RED', type: 'BAN' },   // 1
  { side: 'BLUE', type: 'BAN' },  // 2
  { side: 'RED', type: 'BAN' },   // 3
  { side: 'BLUE', type: 'BAN' },  // 4
  { side: 'RED', type: 'BAN' },   // 5
  // Pick phase 1 (turns 6-11)
  { side: 'BLUE', type: 'PICK' }, // 6  - B1
  { side: 'RED', type: 'PICK' },  // 7  - R1
  { side: 'RED', type: 'PICK' },  // 8  - R2
  { side: 'BLUE', type: 'PICK' }, // 9  - B2
  { side: 'BLUE', type: 'PICK' }, // 10 - B3
  { side: 'RED', type: 'PICK' },  // 11 - R3
  // Ban phase 2 (turns 12-15)
  { side: 'RED', type: 'BAN' },   // 12
  { side: 'BLUE', type: 'BAN' },  // 13
  { side: 'RED', type: 'BAN' },   // 14
  { side: 'BLUE', type: 'BAN' },  // 15
  // Pick phase 2 (turns 16-19)
  { side: 'RED', type: 'PICK' },  // 16 - R4
  { side: 'BLUE', type: 'PICK' }, // 17 - B4
  { side: 'BLUE', type: 'PICK' }, // 18 - B5
  { side: 'RED', type: 'PICK' },  // 19 - R5
];

function getCurrentAction(turn: number): { side: 'BLUE' | 'RED'; type: 'BAN' | 'PICK' } | null {
  if (turn < 0 || turn >= 20) return null;
  return DRAFT_ORDER[turn];
}

function getPhaseDescription(turn: number): string {
  if (turn < 6) return 'BAN PHASE 1';
  if (turn < 12) return 'PICK PHASE 1';
  if (turn < 16) return 'BAN PHASE 2';
  if (turn < 20) return 'PICK PHASE 2';
  return 'DRAFT COMPLETE';
}

// ============ ANALYSIS FUNCTIONS ============

/**
 * Calculate win probability based on draft state and team data
 */
function calculateWinProbability(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): { ourTeam: number; enemyTeam: number; delta: number } {
  const ourPicks = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const enemyPicks = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  
  let ourScore = 50; // Start at 50%
  let enemyScore = 50;
  
  // Factor 1: Team's historical win rate (weight: 10%)
  if (ourTeamData?.gameWinRate) {
    ourScore += (ourTeamData.gameWinRate - 50) * 0.1;
  }
  if (enemyTeamData?.gameWinRate) {
    enemyScore += (enemyTeamData.gameWinRate - 50) * 0.1;
  }
  
  // Factor 2: Champion picks and their win rates with the team
  for (const pickId of ourPicks) {
    const champ = getChampionById(pickId);
    if (!champ) continue;
    
    // Check if this is a comfort pick for our team
    const teamPick = ourTeamData?.mostPicked?.find(
      p => p.name.toLowerCase() === champ.name.toLowerCase()
    );
    
    if (teamPick && teamPick.count >= 3) {
      // Use team's actual win rate on this champion
      ourScore += (teamPick.winRate - 50) * 0.15;
    } else {
      // Use global win rate
      ourScore += (champ.winRate * 100 - 50) * 0.08;
    }
  }
  
  for (const pickId of enemyPicks) {
    const champ = getChampionById(pickId);
    if (!champ) continue;
    
    const teamPick = enemyTeamData?.mostPicked?.find(
      p => p.name.toLowerCase() === champ.name.toLowerCase()
    );
    
    if (teamPick && teamPick.count >= 3) {
      enemyScore += (teamPick.winRate - 50) * 0.15;
    } else {
      enemyScore += (champ.winRate * 100 - 50) * 0.08;
    }
  }
  
  // Factor 3: Side advantage (blue side historically ~51-52% win rate)
  if (ourSide === 'BLUE') {
    ourScore += 1.5;
  } else {
    enemyScore += 1.5;
  }
  
  // Factor 4: Team's side-specific performance
  if (ourSide === 'BLUE' && ourTeamData?.sideStats?.blueWinRate) {
    ourScore += (ourTeamData.sideStats.blueWinRate - 50) * 0.05;
  } else if (ourSide === 'RED' && ourTeamData?.sideStats?.redWinRate) {
    ourScore += (ourTeamData.sideStats.redWinRate - 50) * 0.05;
  }

  // Factor 5: Early/macro edges (only when both teams exist)
  if (ourTeamData?.objectives && enemyTeamData?.objectives) {
    const fbDiff = (ourTeamData.objectives.firstBloodRate ?? 0) - (enemyTeamData.objectives.firstBloodRate ?? 0);
    const ftDiff = (ourTeamData.objectives.firstTowerRate ?? 0) - (enemyTeamData.objectives.firstTowerRate ?? 0);
    const fdDiff = (ourTeamData.objectives.firstDragonRate ?? 0) - (enemyTeamData.objectives.firstDragonRate ?? 0);

    // Differences are in percentage points. Keep weights small to avoid overpowering draft.
    const earlyEdge = fbDiff * 0.03 + ftDiff * 0.02 + fdDiff * 0.015; // ~[-6, +6]
    ourScore += earlyEdge;
    enemyScore -= earlyEdge;
  }

  if (ourTeamData?.gameAverages && enemyTeamData?.gameAverages) {
    const goldDiffK = (ourTeamData.gameAverages.avgGoldDiff - enemyTeamData.gameAverages.avgGoldDiff) / 1000;
    const visionDiff = (ourTeamData.gameAverages.avgVisionScore - enemyTeamData.gameAverages.avgVisionScore) / 10;

    const macroEdge = goldDiffK * 0.9 + visionDiff * 0.35; // typically small
    ourScore += macroEdge;
    enemyScore -= macroEdge;
  }
  
  // Normalize to percentages
  const total = ourScore + enemyScore;
  const ourPercent = Math.min(75, Math.max(25, (ourScore / total) * 100));
  const enemyPercent = 100 - ourPercent;
  
  return {
    ourTeam: ourPercent,
    enemyTeam: enemyPercent,
    // NOTE: This is vs even (50/50). Client can compute turn-to-turn delta if desired.
    delta: ourPercent - 50
  };
}

function computeStrategyInsights(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): StrategyInsights | undefined {
  if (!ourTeamData || !enemyTeamData) return undefined;

  const ourObj = ourTeamData.objectives;
  const enemyObj = enemyTeamData.objectives;
  const ourAvg = ourTeamData.gameAverages;
  const enemyAvg = enemyTeamData.gameAverages;

  const fb = { our: ourObj?.firstBloodRate ?? 0, enemy: enemyObj?.firstBloodRate ?? 0 };
  const ft = { our: ourObj?.firstTowerRate ?? 0, enemy: enemyObj?.firstTowerRate ?? 0 };
  const fd = { our: ourObj?.firstDragonRate ?? 0, enemy: enemyObj?.firstDragonRate ?? 0 };

  const earlyEdgePoints = (fb.our - fb.enemy) * 0.45 + (ft.our - ft.enemy) * 0.35 + (fd.our - fd.enemy) * 0.2;
  const earlyEdge = Math.max(-100, Math.min(100, earlyEdgePoints));

  const ourPickIds = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const enemyPickIds = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  const ourPicked = ourPickIds.map(getChampionById).filter(Boolean);
  const enemyPicked = enemyPickIds.map(getChampionById).filter(Boolean);

  const ourDraftRoles = (ourPicked.flatMap(c => c?.roles ?? []) as Role[]);
  const missingRoles = ALL_ROLES.filter(r => !ourDraftRoles.includes(r));

  const ourEarlyCount = ourPicked.filter(c => c?.tags?.includes('Assassin') || c?.tags?.includes('Fighter')).length;
  const ourScaleCount = ourPicked.filter(c => c?.tags?.includes('Mage') || c?.tags?.includes('Marksman')).length;
  const enemyEarlyCount = enemyPicked.filter(c => c?.tags?.includes('Assassin') || c?.tags?.includes('Fighter')).length;
  const enemyScaleCount = enemyPicked.filter(c => c?.tags?.includes('Mage') || c?.tags?.includes('Marksman')).length;

  const ourLean = ourEarlyCount - ourScaleCount;
  const enemyLean = enemyEarlyCount - enemyScaleCount;

  const earlyRecommendations: string[] = [];
  if (earlyEdge >= 12) {
    earlyRecommendations.push('Lean into early skirmishes and snowball lanes');
    earlyRecommendations.push('Prioritize champions with early push + roam');
  } else if (earlyEdge <= -12) {
    earlyRecommendations.push('Avoid early flips; draft stability and scaling');
    earlyRecommendations.push('Trade objectives instead of contesting blindly');
  } else {
    earlyRecommendations.push('Early game looks even; play around draft win conditions');
  }

  if (missingRoles.length > 0 && missingRoles.length < 5) {
    earlyRecommendations.push(`Draft still missing: ${missingRoles.join(', ')}`);
  }

  // Draft-aware nuance
  if (ourPickIds.length >= 2) {
    if (ourLean >= 2 && earlyEdge <= -8) {
      earlyRecommendations.push('Your draft leans proactive, but team early stats are lower—avoid overforcing early');
    }
    if (ourLean <= -2 && earlyEdge >= 8) {
      earlyRecommendations.push('Team has an early edge, but draft leans scaling—convert safely with lanes + vision');
    }
    if (enemyLean >= 2) {
      earlyRecommendations.push('Enemy draft looks proactive—respect early ganks and skirmish timers');
    }
  }

  // Objective identity
  const ourDrag = ourObj?.avgDragons ?? 0;
  const ourTow = ourObj?.avgTowers ?? 0;
  const ourHer = ourObj?.avgHeralds ?? 0;
  const ourBar = ourObj?.avgBarons ?? 0;
  const enemyDrag = enemyObj?.avgDragons ?? 0;
  const enemyTow = enemyObj?.avgTowers ?? 0;
  const enemyHer = enemyObj?.avgHeralds ?? 0;
  const enemyBar = enemyObj?.avgBarons ?? 0;

  const ourFocusMetric = [
    { key: 'DRAGONS' as const, value: ourDrag },
    { key: 'TOWERS' as const, value: ourTow },
    { key: 'HERALD' as const, value: ourHer },
    { key: 'BARON' as const, value: ourBar },
  ].sort((a, b) => b.value - a.value);

  const top = ourFocusMetric[0];
  const second = ourFocusMetric[1];
  const focus: StrategyInsights['objectives']['focus'] = (top.value - second.value) < 0.25 ? 'BALANCED' : (top.key === 'HERALD' ? 'HERALD' : top.key);

  const objectiveRecommendations: string[] = [];
  if (focus === 'DRAGONS') objectiveRecommendations.push('Draft for bot prio + dragon stacking (TP timers, reset windows)');
  if (focus === 'TOWERS') objectiveRecommendations.push('Draft for lane dominance and plate snowball (range + siege)');
  if (focus === 'HERALD') objectiveRecommendations.push('Draft for early topside control and Herald rotations');
  if (focus === 'BARON') objectiveRecommendations.push('Draft for clean Baron setups: vision, DPS, and turn potential');
  if (focus === 'BALANCED') objectiveRecommendations.push('Team takes mixed objectives; focus on execution and tempo');

  // Draft-aware objective hint
  const hasADC = ourDraftRoles.includes('ADC');
  const hasSUP = ourDraftRoles.includes('SUPPORT');
  const hasJNG = ourDraftRoles.includes('JUNGLE');
  const hasTOP = ourDraftRoles.includes('TOP');
  if (ourPickIds.length >= 2) {
    if (hasADC && hasSUP) {
      objectiveRecommendations.unshift('Bot lane presence detected—prioritize dragon setup windows (prio + resets)');
    } else if (hasTOP && hasJNG) {
      objectiveRecommendations.unshift('Topside presence detected—consider Herald rotations and early topside control');
    } else if (hasJNG) {
      objectiveRecommendations.unshift('Jungle is locked—anchor the plan around early pathing and first objective');
    }
  }

  // Tempo
  const ourDur = ourAvg?.avgDuration ?? 0;
  const enemyDur = enemyAvg?.avgDuration ?? 0;
  const durDiff = ourDur - enemyDur;
  const style: StrategyInsights['tempo']['style'] = Math.abs(durDiff) <= 2.5 ? 'MIXED' : (ourDur < enemyDur ? 'FAST' : 'SLOW');
  const tempoRecommendations: string[] = [];
  if (style === 'FAST') tempoRecommendations.push('You tend to win faster—prioritize early tempo and decisive midgame fights');
  if (style === 'SLOW') tempoRecommendations.push('You tend to play longer—draft scaling, waveclear, and safe sidelanes');
  if (style === 'MIXED') tempoRecommendations.push('Tempo styles are similar—draft around matchup specifics');

  if (ourPickIds.length >= 2) {
    if (ourLean >= 2) tempoRecommendations.push('Draft leans proactive: look for early prio and midgame tempo');
    if (ourLean <= -2) tempoRecommendations.push('Draft leans scaling: prioritize waveclear and safe sidelanes');
  }

  return {
    earlyGame: {
      edge: earlyEdge,
      label: earlyEdge >= 12 ? 'EARLY ADVANTAGE' : earlyEdge <= -12 ? 'EARLY RISK' : 'EARLY EVEN',
      details: [
        { key: 'First Blood', our: fb.our, enemy: fb.enemy, unit: '%' },
        { key: 'First Tower', our: ft.our, enemy: ft.enemy, unit: '%' },
        { key: 'First Dragon', our: fd.our, enemy: fd.enemy, unit: '%' },
      ],
      recommendations: earlyRecommendations,
    },
    objectives: {
      focus,
      details: [
        { key: 'Avg Dragons', our: ourDrag, enemy: enemyDrag, unit: '' },
        { key: 'Avg Towers', our: ourTow, enemy: enemyTow, unit: '' },
        { key: 'Avg Heralds', our: ourHer, enemy: enemyHer, unit: '' },
        { key: 'Avg Barons', our: ourBar, enemy: enemyBar, unit: '' },
      ],
      recommendations: objectiveRecommendations,
    },
    tempo: {
      ourAvgDuration: ourDur,
      enemyAvgDuration: enemyDur,
      style,
      recommendations: tempoRecommendations,
    },
    macroEdge: {
      avgGoldDiff: { our: ourAvg?.avgGoldDiff ?? 0, enemy: enemyAvg?.avgGoldDiff ?? 0 },
      avgVisionScore: { our: ourAvg?.avgVisionScore ?? 0, enemy: enemyAvg?.avgVisionScore ?? 0 },
    },
  };
}

/**
 * Generate pick/ban recommendations
 */
function generateRecommendations(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED',
  actionType: 'PICK' | 'BAN'
): DraftRecommendation[] {
  const usedChampions = [
    ...draftState.bluePicks,
    ...draftState.blueBans,
    ...draftState.redPicks,
    ...draftState.redBans
  ];
  
  const ourPicks = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const enemyPicks = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  
  const recommendations: DraftRecommendation[] = [];
  
  // Get available champions
  const availableChampions = CHAMPIONS.filter(c => !usedChampions.includes(c.id));
  
  for (const champion of availableChampions) {
    let score = 50;
    const reasons: string[] = [];
    const tags: DraftRecommendation['tags'] = [];
    
    // === PICK-SPECIFIC SCORING ===
    if (actionType === 'PICK') {
      // 1. Signature champion bonus
      const ourTeamPick = ourTeamData?.mostPicked?.find(
        p => p.name.toLowerCase() === champion.name.toLowerCase()
      );
      if (ourTeamPick && ourTeamPick.count >= 3) {
        score += 15;
        tags.push('SIGNATURE');
        reasons.push(`Team signature pick (${ourTeamPick.count} games, ${ourTeamPick.winRate.toFixed(0)}% WR)`);
        
        if (ourTeamPick.winRate >= 60) {
          score += 10;
          tags.push('HIGH_WINRATE');
          reasons.push(`Excellent win rate with this champion`);
        }
      }
      
      // 2. Player champion pool
      if (ourTeamData?.players) {
        for (const player of ourTeamData.players) {
          const playerChamp = player.champions?.find(
            c => c.name.toLowerCase() === champion.name.toLowerCase()
          );
          if (playerChamp && playerChamp.games >= 2 && playerChamp.winRate >= 55) {
            score += 8;
            tags.push('COMFORT');
            reasons.push(`${player.name} comfort pick (${playerChamp.winRate.toFixed(0)}% WR)`);
            break;
          }
        }
      }
      
      // 3. Synergy with existing picks
      const ourChamps = ourPicks.map(id => getChampionById(id)).filter(Boolean);
      
      // 3a. Check historical champion combos from team data
      if (ourTeamData?.championCombos && ourChamps.length > 0) {
        for (const pickedChamp of ourChamps) {
          if (!pickedChamp) continue;
          
          // Find combos involving this candidate champion and any already-picked champion
          const relevantCombo = ourTeamData.championCombos.find(combo => {
            const champNameLower = champion.name.toLowerCase();
            const pickedNameLower = pickedChamp.name.toLowerCase();
            return (
              (combo.champion1.toLowerCase() === champNameLower && combo.champion2.toLowerCase() === pickedNameLower) ||
              (combo.champion2.toLowerCase() === champNameLower && combo.champion1.toLowerCase() === pickedNameLower)
            );
          });
          
          if (relevantCombo && relevantCombo.gamesPlayedTogether >= 2) {
            const affinityBonus = relevantCombo.affinityRate >= 70 ? 12 : relevantCombo.affinityRate >= 50 ? 8 : 4;
            const winRateBonus = relevantCombo.winRate >= 60 ? 8 : relevantCombo.winRate >= 50 ? 4 : 0;
            score += affinityBonus + winRateBonus;
            
            if (!tags.includes('SYNERGY')) tags.push('SYNERGY');
            
            const pairedWith = pickedChamp.name;
            if (relevantCombo.affinityRate >= 70) {
              reasons.push(`Core duo with ${pairedWith} (${relevantCombo.gamesPlayedTogether}G, ${relevantCombo.winRate.toFixed(0)}% WR)`);
            } else {
              reasons.push(`Often paired with ${pairedWith} (${relevantCombo.affinityRate.toFixed(0)}% affinity)`);
            }
            break; // Only count one combo per champion to avoid double-scoring
          }
        }
      }
      
      // 3b. Generic tag-based synergy (fallback if no historical data)
      // Tank + ADC synergy
      if (ourChamps.some(c => c?.tags.includes('Tank')) && champion.tags.includes('Marksman')) {
        score += 5;
        tags.push('SYNERGY');
        reasons.push('Good synergy with frontline');
      }
      
      // Engage + followup
      if (ourChamps.some(c => c?.tags.includes('Tank') || c?.name === 'Jarvan IV' || c?.name === 'Sejuani')) {
        if (champion.tags.includes('Mage') || champion.tags.includes('Marksman')) {
          score += 3;
          reasons.push('Follows up on team engage');
        }
      }
      
      // 4. Counter-pick potential against enemy
      const enemyChamps = enemyPicks.map(id => getChampionById(id)).filter(Boolean);
      
      // Anti-assassin
      if (enemyChamps.some(c => c?.tags.includes('Assassin'))) {
        if (champion.tags.includes('Tank') && (champion.roles.includes('SUPPORT') || champion.roles.includes('JUNGLE'))) {
          score += 6;
          tags.push('COUNTER');
          reasons.push('Strong counter-engage against assassins');
        }
      }
      
      // 5. Role filling
      const ourRoles = ourChamps.flatMap(c => c?.roles || []) as Role[];
      const missingRoles = ALL_ROLES.filter(r => !ourRoles.includes(r));
      
      if (missingRoles.some(r => champion.roles.includes(r))) {
        score += 4;
        reasons.push(`Fills ${champion.roles.join('/')} role`);
      }
      
      // 6. Flex pick bonus
      if (champion.roles.length >= 2) {
        score += 3;
        tags.push('FLEX');
        reasons.push(`Flex pick (${champion.roles.join('/')})`);
      }
      
      // 7. Base win rate
      if (champion.winRate >= 0.52) {
        score += (champion.winRate - 0.50) * 30;
        if (champion.winRate >= 0.53) {
          tags.push('HIGH_WINRATE');
          reasons.push(`High global win rate (${(champion.winRate * 100).toFixed(1)}%)`);
        }
      }
    }
    
    // === BAN-SPECIFIC SCORING ===
    if (actionType === 'BAN') {
      // 1. Enemy signature champions (priority ban)
      const enemyTeamPick = enemyTeamData?.mostPicked?.find(
        p => p.name.toLowerCase() === champion.name.toLowerCase()
      );
      if (enemyTeamPick && enemyTeamPick.count >= 3) {
        score += 25;
        tags.push('DENY');
        reasons.push(`Enemy signature (${enemyTeamPick.count}G, ${enemyTeamPick.winRate.toFixed(0)}% WR)`);
        
        if (enemyTeamPick.winRate >= 60) {
          score += 15;
          reasons.push(`Very high enemy win rate on this champion`);
        }
      }
      
      // 2. Enemy player pools
      if (enemyTeamData?.players) {
        for (const player of enemyTeamData.players) {
          const playerChamp = player.champions?.find(
            c => c.name.toLowerCase() === champion.name.toLowerCase()
          );
          if (playerChamp && playerChamp.games >= 3 && playerChamp.winRate >= 60) {
            score += 12;
            tags.push('DENY');
            reasons.push(`Deny ${player.name}'s ${champion.name} (${playerChamp.winRate.toFixed(0)}% WR)`);
            break;
          }
        }
      }
      
      // 3. Often banned against enemy
      const bannedAgainst = enemyTeamData?.mostBannedAgainst?.find(
        b => b.name.toLowerCase() === champion.name.toLowerCase()
      );
      if (bannedAgainst && bannedAgainst.count >= 2) {
        score += 8;
        reasons.push(`Frequently banned vs this team (${bannedAgainst.count}x)`);
      }
      
      // 4. Counter to our draft
      const ourChamps = ourPicks.map(id => getChampionById(id)).filter(Boolean);
      
      // Ban assassins if we have squishy carries
      if (ourChamps.some(c => c?.tags.includes('Marksman') || c?.tags.includes('Mage'))) {
        if (champion.tags.includes('Assassin') && champion.winRate >= 0.50) {
          score += 6;
          tags.push('COUNTER');
          reasons.push('Protects our carries from assassin threat');
        }
      }
      
      // 5. High ban rate champions (meta bans)
      if (champion.banRate >= 0.15) {
        score += champion.banRate * 20;
        reasons.push(`High ban rate (${(champion.banRate * 100).toFixed(0)}%)`);
      }
      
      // 6. OP champions
      if (champion.winRate >= 0.53 && champion.pickRate >= 0.08) {
        score += 10;
        tags.push('HIGH_WINRATE');
        reasons.push(`Strong meta champion (${(champion.winRate * 100).toFixed(1)}% WR)`);
      }
    }
    
    // Calculate predicted win rate impact
    const predictedWinRate = Math.min(65, Math.max(40, 50 + (score - 50) * 0.3));
    
    recommendations.push({
      championId: champion.id,
      championName: champion.name,
      predictedWinRate,
      score,
      reasons: reasons.length > 0 ? reasons : ['Decent option'],
      tags: Array.from(new Set(tags)) as DraftRecommendation['tags']
    });
  }
  
  // Sort by score and return top results
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 8);
}

/**
 * Predict enemy picks
 */
function predictEnemyPicks(
  draftState: DraftState,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): DraftPrediction[] {
  const usedChampions = [
    ...draftState.bluePicks,
    ...draftState.blueBans,
    ...draftState.redPicks,
    ...draftState.redBans
  ];
  
  const enemyPicks = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  const predictions: DraftPrediction[] = [];
  
  const availableChampions = CHAMPIONS.filter(c => !usedChampions.includes(c.id));
  
  for (const champion of availableChampions) {
    let probability = 5; // Base probability
    const reasons: string[] = [];
    
    // 1. Enemy signature champions
    const enemyPick = enemyTeamData?.mostPicked?.find(
      p => p.name.toLowerCase() === champion.name.toLowerCase()
    );
    if (enemyPick) {
      probability += enemyPick.count * 3;
      reasons.push(`Team has picked ${enemyPick.count} times (${enemyPick.winRate.toFixed(0)}% WR)`);
    }
    
    // 2. Enemy player pools
    if (enemyTeamData?.players) {
      for (const player of enemyTeamData.players) {
        const playerChamp = player.champions?.find(
          c => c.name.toLowerCase() === champion.name.toLowerCase()
        );
        if (playerChamp && playerChamp.games >= 2) {
          probability += playerChamp.games * 2;
          reasons.push(`${player.name} plays this (${playerChamp.games}G)`);
          break;
        }
      }
    }
    
    // 3. Role needs
    const enemyChamps = enemyPicks.map(id => getChampionById(id)).filter(Boolean);
    const enemyRoles = enemyChamps.flatMap(c => c?.roles || []) as Role[];
    const missingRoles = ALL_ROLES.filter(r => !enemyRoles.includes(r));
    
    if (missingRoles.some(r => champion.roles.includes(r))) {
      probability += 8;
      reasons.push(`Fills missing ${champion.roles.join('/')} role`);
    }
    
    // 3b. Check if this champion forms a known combo with enemy's existing picks
    if (enemyTeamData?.championCombos && enemyChamps.length > 0) {
      for (const pickedChamp of enemyChamps) {
        if (!pickedChamp) continue;
        
        const relevantCombo = enemyTeamData.championCombos.find(combo => {
          const champNameLower = champion.name.toLowerCase();
          const pickedNameLower = pickedChamp.name.toLowerCase();
          return (
            (combo.champion1.toLowerCase() === champNameLower && combo.champion2.toLowerCase() === pickedNameLower) ||
            (combo.champion2.toLowerCase() === champNameLower && combo.champion1.toLowerCase() === pickedNameLower)
          );
        });
        
        if (relevantCombo && relevantCombo.gamesPlayedTogether >= 2) {
          // Significant combo found - increase prediction probability
          const comboBonus = relevantCombo.affinityRate >= 70 ? 25 : relevantCombo.affinityRate >= 50 ? 15 : 8;
          probability += comboBonus;
          
          if (relevantCombo.affinityRate >= 70) {
            reasons.unshift(`Core duo with ${pickedChamp.name} (${relevantCombo.affinityRate.toFixed(0)}% paired)`);
          } else {
            reasons.push(`Often paired with ${pickedChamp.name}`);
          }
          break;
        }
      }
    }
    
    // 4. High pick rate in meta
    if (champion.pickRate >= 0.10) {
      probability += champion.pickRate * 30;
      reasons.push(`Popular meta pick (${(champion.pickRate * 100).toFixed(0)}% pick rate)`);
    }
    
    // Normalize to percentage (max 80%)
    probability = Math.min(80, probability);
    
    predictions.push({
      championId: champion.id,
      championName: champion.name,
      probability,
      reasons: reasons.length > 0 ? reasons : ['Possible pick']
    });
  }
  
  const top = predictions.sort((a, b) => b.probability - a.probability).slice(0, 5);
  return normalizePredictions(top);
}

/**
 * Predict enemy bans (what they will ban AGAINST us)
 * Heuristic: targets our comfort picks + high patch bans + role pinch.
 */
function predictEnemyBans(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): DraftPrediction[] {
  const usedChampions = [
    ...draftState.bluePicks,
    ...draftState.blueBans,
    ...draftState.redPicks,
    ...draftState.redBans,
  ];

  const ourPicks = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const ourChamps = ourPicks.map(id => getChampionById(id)).filter(Boolean);
  const ourRoles = ourChamps.flatMap(c => c?.roles || []) as Role[];
  const missingRoles = ALL_ROLES.filter(r => !ourRoles.includes(r));

  const availableChampions = CHAMPIONS.filter(c => !usedChampions.includes(c.id));
  const predictions: DraftPrediction[] = [];

  for (const champion of availableChampions) {
    let probability = 4;
    const reasons: string[] = [];

    // 1) Ban meta/high-ban champions
    if (champion.banRate >= 0.15) {
      probability += champion.banRate * 40;
      reasons.push(`High patch ban rate (${(champion.banRate * 100).toFixed(0)}%)`);
    }
    if (champion.winRate >= 0.53 && champion.pickRate >= 0.10) {
      probability += 10;
      reasons.push(`Strong meta profile (${(champion.winRate * 100).toFixed(1)}% WR)`);
    }

    // 2) Deny our team signature/comfort
    const ourTeamPick = ourTeamData?.mostPicked?.find(p => p.name.toLowerCase() === champion.name.toLowerCase());
    if (ourTeamPick && ourTeamPick.count >= 3) {
      probability += 18 + Math.min(10, (ourTeamPick.winRate - 50) * 0.4);
      reasons.push(`Our signature pick (${ourTeamPick.count}G, ${ourTeamPick.winRate.toFixed(0)}% WR)`);
    }

    if (ourTeamData?.players) {
      for (const player of ourTeamData.players) {
        const playerChamp = player.champions?.find(c => c.name.toLowerCase() === champion.name.toLowerCase());
        if (playerChamp && playerChamp.games >= 2) {
          probability += 6 + Math.min(8, playerChamp.games * 1.5);
          reasons.push(`${player.name} comfort (${playerChamp.games}G)`);
          break;
        }
      }
    }

    // 3) Role pinch: ban top-tier champions for roles we still need
    if (missingRoles.some(r => champion.roles.includes(r))) {
      probability += 6;
      reasons.push(`Role pinch (${champion.roles.join('/')})`);
    }

    // Normalize
    probability = Math.min(80, probability);
    if (probability >= 8) {
      predictions.push({
        championId: champion.id,
        championName: champion.name,
        probability,
        reasons: reasons.length ? reasons : ['Possible deny ban'],
      });
    }
  }

  const top = predictions.sort((a, b) => b.probability - a.probability).slice(0, 5);
  return normalizePredictions(top);
}

/**
 * Generate draft warnings
 */
function generateWarnings(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): DraftWarning[] {
  const warnings: DraftWarning[] = [];
  const ourPicks = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const enemyPicks = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  
  const ourChamps = ourPicks.map(id => getChampionById(id)).filter(Boolean);
  const enemyChamps = enemyPicks.map(id => getChampionById(id)).filter(Boolean);
  
  // Check damage profile
  const ourAP = ourChamps.filter(c => c?.tags.includes('Mage')).length;
  const ourAD = ourChamps.filter(c => c?.tags.includes('Fighter') || c?.tags.includes('Marksman') || c?.tags.includes('Assassin')).length;
  
  if (ourPicks.length >= 3 && ourAP === 0) {
    warnings.push({
      severity: 'warning',
      message: 'No AP damage in composition',
      suggestion: 'Consider picking a mage or AP champion to diversify damage'
    });
  }
  
  if (ourPicks.length >= 3 && ourAD === 0) {
    warnings.push({
      severity: 'warning',
      message: 'No AD damage in composition',
      suggestion: 'Consider picking an AD champion for balanced damage'
    });
  }
  
  // Check for frontline
  const hasFrontline = ourChamps.some(c => c?.tags.includes('Tank'));
  if (ourPicks.length >= 4 && !hasFrontline) {
    warnings.push({
      severity: 'warning',
      message: 'No frontline in composition',
      suggestion: 'Team may struggle in teamfights without a tank'
    });
  }
  
  // Check enemy threats
  const enemyAssassins = enemyChamps.filter(c => c?.tags.includes('Assassin'));
  if (enemyAssassins.length >= 2) {
    warnings.push({
      severity: 'critical',
      message: `Enemy has ${enemyAssassins.length} assassins (${enemyAssassins.map(c => c?.name).join(', ')})`,
      suggestion: 'Prioritize peel and protection for carries'
    });
  }
  
  // Check if we're leaving OP picks open
  if (draftState.currentTurn < 10) {
    const unbannedOPs = CHAMPIONS.filter(c => 
      c.winRate >= 0.53 && 
      c.pickRate >= 0.10 && 
      !draftState.blueBans.includes(c.id) && 
      !draftState.redBans.includes(c.id) &&
      !draftState.bluePicks.includes(c.id) &&
      !draftState.redPicks.includes(c.id)
    );
    
    if (unbannedOPs.length > 0) {
      warnings.push({
        severity: 'info',
        message: `Strong meta picks still available: ${unbannedOPs.slice(0, 3).map(c => c.name).join(', ')}`,
        suggestion: 'Consider picking or banning these champions'
      });
    }
  }
  
  return warnings;
}

/**
 * Analyze composition
 */
function analyzeComposition(picks: string[]): CompositionInfo {
  const champs = picks.map(id => getChampionById(id)).filter(Boolean);
  
  const tags = new Set<string>();
  champs.forEach(c => c?.tags.forEach(t => tags.add(t)));
  
  const roles = champs.flatMap(c => c?.roles || []);
  const missingRoles = ALL_ROLES.filter(r => !(roles as Role[]).includes(r));
  
  const damageProfile = {
    physical: champs.filter(c => c?.tags.includes('Fighter') || c?.tags.includes('Marksman') || c?.tags.includes('Assassin')).length,
    magic: champs.filter(c => c?.tags.includes('Mage')).length,
    mixed: champs.filter(c => !c?.tags.includes('Mage') && !c?.tags.includes('Fighter') && !c?.tags.includes('Marksman') && !c?.tags.includes('Assassin')).length
  };
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (tags.has('Tank')) strengths.push('Has frontline');
  if (damageProfile.physical >= 2 && damageProfile.magic >= 1) strengths.push('Balanced damage');
  if (tags.has('Assassin')) strengths.push('Pick potential');
  if (champs.length >= 3 && champs.filter(c => c?.tags.includes('Tank') || c?.tags.includes('Support')).length >= 2) {
    strengths.push('Strong teamfight');
  }
  
  if (!tags.has('Tank')) weaknesses.push('No frontline');
  if (damageProfile.magic === 0 && champs.length >= 3) weaknesses.push('Full AD');
  if (damageProfile.physical === 0 && champs.length >= 3) weaknesses.push('Full AP');
  
  return {
    tags: Array.from(tags),
    missingRoles,
    damageProfile,
    strengths,
    weaknesses
  };
}

// ============ MAIN EXPORT ============

/**
 * Generate comprehensive draft analysis
 */
export function analyzeDraft(
  draftState: DraftState,
  ourTeamData: TeamData | null,
  enemyTeamData: TeamData | null,
  ourSide: 'BLUE' | 'RED'
): DraftAnalysis {
  const currentAction = getCurrentAction(draftState.currentTurn);
  const isOurTurn = currentAction?.side === ourSide;
  
  // Calculate win probability
  const winProbability = calculateWinProbability(draftState, ourTeamData, enemyTeamData, ourSide);
  
  // Generate recommendations (only if it's our turn)
  const recommendations = isOurTurn && currentAction
    ? generateRecommendations(draftState, ourTeamData, enemyTeamData, ourSide, currentAction.type)
    : [];
  
  // Predict enemy picks (only if it's their turn)
  const enemyPredictions = !isOurTurn && currentAction
    ? (currentAction.type === 'BAN'
      ? predictEnemyBans(draftState, ourTeamData, ourSide)
      : predictEnemyPicks(draftState, enemyTeamData, ourSide))
    : [];
  
  // Generate warnings
  const warnings = generateWarnings(draftState, ourTeamData, enemyTeamData, ourSide);
  
  // Analyze compositions
  const ourPicks = ourSide === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const enemyPicks = ourSide === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  
  return {
    currentTurn: draftState.currentTurn,
    phase: getPhaseDescription(draftState.currentTurn),
    currentSide: currentAction?.side || 'BLUE',
    currentAction: currentAction?.type || 'BAN',
    winProbability,
    recommendations,
    enemyPredictions,
    warnings,
    strategyInsights: computeStrategyInsights(draftState, ourTeamData, enemyTeamData, ourSide),
    compositionAnalysis: {
      ourTeam: analyzeComposition(ourPicks),
      enemyTeam: analyzeComposition(enemyPicks)
    }
  };
}

export { getCurrentAction, getPhaseDescription };
