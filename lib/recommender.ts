import { Champion, DraftState, Recommendation } from './types';
import { CHAMPIONS } from './data';

export function getRecommendations(state: DraftState, side: 'BLUE' | 'RED'): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const usedChampions = [...state.bluePicks, ...state.blueBans, ...state.redPicks, ...state.redBans];
  
  const availableChampions = CHAMPIONS.filter(c => !usedChampions.includes(c.id));

  for (const champion of availableChampions) {
    let score = champion.winRate * 100;
    let reasoning = `Base winrate is ${Math.round(champion.winRate * 100)}%. `;

    // Simple synergy logic
    const teammates = side === 'BLUE' ? state.bluePicks : state.redPicks;
    const opponents = side === 'BLUE' ? state.redPicks : state.bluePicks;

    // Example synergy: CC chain
    if (teammates.some(id => CHAMPIONS.find(c => c.id === id)?.tags.includes('Tank'))) {
      if (champion.tags.includes('Marksman')) {
        score += 2;
        reasoning += 'Good synergy with frontline. ';
      }
    }

    // Example counter: Anti-Assassin
    if (opponents.some(id => CHAMPIONS.find(c => c.id === id)?.tags.includes('Assassin'))) {
      if (champion.tags.includes('Support') && champion.tags.includes('Tank')) {
        score += 3;
        reasoning += 'Strong counter-engage against assassins. ';
      }
    }

    // Add variety based on champion characteristics (deterministic)
    score += champion.pickRate * 5;

    recommendations.push({
      championId: champion.id,
      predictedWinRate: Math.min(0.65, Math.max(0.35, score / 100)), // Bounded predicted impact
      reasoning: reasoning.trim(),
      score: score
    });
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 4);
}

export function predictEnemyPicks(state: DraftState): Recommendation[] {
  // Logic to predict what the enemy might pick based on their current composition and needs
  const usedChampions = [...state.bluePicks, ...state.blueBans, ...state.redPicks, ...state.redBans];
  const availableChampions = CHAMPIONS.filter(c => !usedChampions.includes(c.id));
  
  // Simulated prediction logic: they tend to pick high winrate champions that fill missing roles
  const predictions: Recommendation[] = [];
  
  for (const champion of availableChampions) {
    let score = champion.pickRate * 100;
    
    // If they need a specific role
    const enemyPicks = state.redPicks; // Assuming we are Blue and predicting Red
    const rolesFilled = enemyPicks.flatMap(id => CHAMPIONS.find(c => c.id === id)?.roles || []);
    
    champion.roles.forEach(role => {
      if (!rolesFilled.includes(role)) {
        score += 5;
      }
    });

    predictions.push({
      championId: champion.id,
      predictedWinRate: champion.winRate,
      reasoning: `High pick rate (${Math.round(champion.pickRate * 100)}%) and fills needed roles.`,
      score: score
    });
  }

  return predictions.sort((a, b) => b.score - a.score).slice(0, 3);
}

export function calculateWinProbability(state: DraftState): { blue: number; red: number } {
  // Very simplified win probability calculation
  let blueScore = 0.5;
  let redScore = 0.5;

  state.bluePicks.forEach(id => {
    const champ = CHAMPIONS.find(c => c.id === id);
    if (champ) blueScore += (champ.winRate - 0.5);
  });

  state.redPicks.forEach(id => {
    const champ = CHAMPIONS.find(c => c.id === id);
    if (champ) redScore += (champ.winRate - 0.5);
  });

  // Normalize
  const total = blueScore + redScore;
  return {
    blue: (blueScore / total) * 100,
    red: (redScore / total) * 100
  };
}
