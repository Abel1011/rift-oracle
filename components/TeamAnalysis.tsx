import React from 'react';
import { CHAMPIONS } from '@/lib/data';

interface TeamAnalysisProps {
  championIds: string[];
  side: 'BLUE' | 'RED';
}

export const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ championIds, side }) => {
  // Guard against undefined or empty array
  if (!championIds || championIds.length === 0) return null;
  
  const champions = championIds.map(id => CHAMPIONS.find(c => c.id === id)).filter(Boolean);
  
  // Calculate team metrics
  const avgWinRate = champions.length > 0 
    ? champions.reduce((sum, c) => sum + (c?.winRate || 0), 0) / champions.length 
    : 0.5;

  // Count damage types based on tags
  const damageTypes = {
    physical: 0,
    magic: 0,
    tank: 0
  };

  const classCount: Record<string, number> = {};
  
  champions.forEach(champ => {
    if (!champ) return;
    champ.tags.forEach(tag => {
      classCount[tag] = (classCount[tag] || 0) + 1;
      
      if (['Fighter', 'Assassin', 'Marksman'].includes(tag)) damageTypes.physical++;
      if (['Mage'].includes(tag)) damageTypes.magic++;
      if (['Tank', 'Support'].includes(tag)) damageTypes.tank++;
    });
  });

  // Determine team strengths
  const getTeamStrength = () => {
    if (champions.length < 3) return { label: 'Building...', color: 'var(--muted)' };
    
    const totalDamage = damageTypes.physical + damageTypes.magic;
    const magicRatio = totalDamage > 0 ? damageTypes.magic / totalDamage : 0.5;
    
    if (magicRatio > 0.6) return { label: 'AP Heavy', color: 'var(--blue-2)' };
    if (magicRatio < 0.3) return { label: 'AD Heavy', color: 'var(--red-3)' };
    return { label: 'Balanced', color: 'var(--gold-2)' };
  };

  const teamStrength = getTeamStrength();
  const sideColor = side === 'BLUE' ? 'blue' : 'red';

  return (
    <div className="mt-4 space-y-3 p-3 border-t border-[var(--gold-5)]/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--gold-4)]/30 to-transparent" />
        <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--gold-3)] tracking-[0.2em]">ANALYSIS</span>
        <div className="h-px flex-1 bg-gradient-to-l from-[var(--gold-4)]/30 to-transparent" />
      </div>
      
      {/* Team Strength Indicator */}
      <div className={`p-2 bg-[var(--${sideColor}-6)]/30 border border-[var(--${sideColor}-4)]/30`}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Team Comp
          </span>
          <span 
            className="text-[10px] font-[var(--font-beaufort)] font-bold"
            style={{ color: teamStrength.color }}
          >
            {teamStrength.label}
          </span>
        </div>
      </div>

      {/* Damage Distribution */}
      {champions.length > 0 && (
        <div className="space-y-2">
          <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Damage Mix
          </span>
          
          <div className="flex gap-1 h-3">
            {damageTypes.physical > 0 && (
              <div 
                className="bg-gradient-to-b from-[var(--red-3)] to-[var(--red-5)] transition-all duration-500"
                style={{ flex: damageTypes.physical }}
                title={`Physical: ${damageTypes.physical}`}
              />
            )}
            {damageTypes.magic > 0 && (
              <div 
                className="bg-gradient-to-b from-[var(--blue-2)] to-[var(--blue-4)] transition-all duration-500"
                style={{ flex: damageTypes.magic }}
                title={`Magic: ${damageTypes.magic}`}
              />
            )}
            {damageTypes.tank > 0 && (
              <div 
                className="bg-gradient-to-b from-[var(--gold-3)] to-[var(--gold-5)] transition-all duration-500"
                style={{ flex: damageTypes.tank }}
                title={`Utility: ${damageTypes.tank}`}
              />
            )}
          </div>
          
          <div className="flex justify-between text-[8px] text-[var(--muted-dark)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[var(--red-3)]" /> AD
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[var(--blue-2)]" /> AP
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[var(--gold-3)]" /> Utility
            </span>
          </div>
        </div>
      )}

      {/* Class Breakdown */}
      {Object.keys(classCount).length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Classes
          </span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(classCount)
              .sort((a, b) => b[1] - a[1])
              .map(([tag, count], index) => (
                <span 
                  key={`${tag}-${index}`}
                  className="text-[8px] px-1.5 py-0.5 bg-[var(--hextech-metal)]/50 text-[var(--gold-2)] border border-[var(--gold-5)]/30"
                >
                  {tag} ×{count}
                </span>
              ))
            }
          </div>
        </div>
      )}

      {/* Average Win Rate */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--gold-5)]/20">
        <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase">
          Avg. Champion WR
        </span>
        <span className={`text-[11px] font-[var(--font-beaufort)] font-bold
          ${avgWinRate >= 0.51 ? 'text-[var(--blue-2)]' : avgWinRate <= 0.49 ? 'text-[var(--red-3)]' : 'text-[var(--gold-2)]'}`}>
          {(avgWinRate * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
