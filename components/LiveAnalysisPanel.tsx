'use client';

import React, { useMemo } from 'react';
import { DraftState, Recommendation } from '@/lib/types';
import { CHAMPIONS } from '@/lib/data';
import { getRecommendations, predictEnemyPicks, calculateWinProbability } from '@/lib/recommender';

interface LiveAnalysisPanelProps {
  draftState: DraftState;
  ourSide: 'BLUE' | 'RED';
  className?: string;
}

const getChampion = (id: string) => CHAMPIONS.find(c => c.id === id || c.name === id);

export function LiveAnalysisPanel({ draftState, ourSide, className = '' }: LiveAnalysisPanelProps) {
  // Use local recommender functions instead of backend API
  const recommendations = useMemo(() => 
    getRecommendations(draftState, ourSide), 
    [draftState, ourSide]
  );

  const enemyPredictions = useMemo(() => 
    predictEnemyPicks(draftState), 
    [draftState]
  );

  const winProbability = useMemo(() => 
    calculateWinProbability(draftState), 
    [draftState]
  );

  // Determine draft phase based on turn
  const draftPhase = useMemo(() => {
    const turn = draftState.currentTurn;
    if (turn < 6) return 'Ban Phase 1';
    if (turn < 12) return 'Pick Phase 1';
    if (turn < 16) return 'Ban Phase 2';
    if (turn < 20) return 'Pick Phase 2';
    return 'Draft Complete';
  }, [draftState.currentTurn]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider">
          LIVE ANALYSIS
        </h3>
        <span className="text-[10px] text-[var(--muted)]">Local Mode</span>
      </div>

      {/* Win Probability */}
      <div className="p-3 border border-[var(--gold-5)]/20 bg-[var(--hextech-metal)]/20">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
          Win Probability
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-glow">{winProbability.blue.toFixed(1)}%</span>
              <span className="text-red-glow">{winProbability.red.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[var(--hextech-black)] rounded overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-[var(--blue-4)] to-[var(--blue-2)] transition-all duration-500"
                style={{ width: `${winProbability.blue}%` }}
              />
              <div 
                className="h-full bg-gradient-to-l from-[var(--red-5)] to-[var(--red-3)] transition-all duration-500"
                style={{ width: `${winProbability.red}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
            🎯 Recommended Picks
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, i) => {
              const champ = getChampion(rec.championId);
              return (
                <div 
                  key={rec.championId}
                  className="flex items-center gap-2 p-2 border border-[var(--gold-5)]/20 bg-[var(--hextech-black)]/50 hover:border-[var(--gold-3)] transition-colors"
                >
                  <span className="text-xs font-bold text-[var(--gold-4)] w-4">#{i + 1}</span>
                  {champ?.imageUrl && (
                    <img 
                      src={champ.imageUrl} 
                      alt={champ.name} 
                      className="w-8 h-8 border border-[var(--gold-5)]" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-[var(--font-beaufort)] text-[var(--gold-1)]">
                      {champ?.name || rec.championId}
                    </div>
                    <p className="text-[9px] text-[var(--muted)] truncate">{rec.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[var(--blue-2)]">
                      {(rec.predictedWinRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-[8px] text-[var(--muted)]">Win Rate</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enemy Predictions */}
      {enemyPredictions.length > 0 && (
        <div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
            🔮 Enemy May Pick
          </div>
          <div className="flex gap-2">
            {enemyPredictions.slice(0, 3).map(pred => {
              const champ = getChampion(pred.championId);
              return (
                <div 
                  key={pred.championId}
                  className="flex-1 p-2 border border-[var(--red-5)]/30 bg-[var(--red-6)]/20 text-center"
                >
                  {champ?.imageUrl && (
                    <img 
                      src={champ.imageUrl} 
                      alt={champ.name} 
                      className="w-8 h-8 mx-auto border border-[var(--red-4)]" 
                    />
                  )}
                  <div className="text-[10px] text-[var(--gold-1)] mt-1 truncate">
                    {champ?.name || pred.championId}
                  </div>
                  <div className="text-[9px] text-[var(--red-3)]">
                    {(pred.predictedWinRate * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Draft Phase */}
      <div className="text-center pt-2 border-t border-[var(--gold-5)]/10">
        <span className="text-[10px] text-[var(--muted-dark)]">
          Phase: {draftPhase}
        </span>
      </div>
    </div>
  );
}

export default LiveAnalysisPanel;
