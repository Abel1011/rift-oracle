import React from 'react';
import { Champion } from '@/lib/types';

interface ChampionTooltipProps {
  champion: Champion;
  position?: { x: number; y: number };
}

export const ChampionTooltip: React.FC<ChampionTooltipProps> = ({ champion }) => {
  const winRateColor = champion.winRate >= 0.52 
    ? 'text-[var(--blue-2)]' 
    : champion.winRate <= 0.48 
      ? 'text-[var(--red-3)]' 
      : 'text-[var(--gold-2)]';

  const getStatBar = (value: number, max: number = 1) => {
    const percentage = (value / max) * 100;
    return (
      <div className="h-1.5 bg-[var(--hextech-metal)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--gold-4)] to-[var(--gold-2)] transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <div className="w-64 bg-gradient-to-b from-[var(--hextech-metal)] to-[var(--hextech-black)] border border-[var(--gold-4)] shadow-2xl">
      {/* Header with Champion Portrait */}
      <div className="relative h-20 overflow-hidden">
        <img 
          src={champion.imageUrl} 
          alt={champion.name}
          className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm scale-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--hextech-black)] to-transparent" />
        
        <div className="relative flex items-end gap-3 p-3 h-full">
          <div className="w-14 h-14 border-2 border-[var(--gold-3)] overflow-hidden flex-shrink-0">
            <img src={champion.imageUrl} alt={champion.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h3 className="font-[var(--font-beaufort)] font-bold text-[var(--gold-1)] text-sm truncate">
              {champion.name}
            </h3>
            <div className="flex gap-1 mt-1">
              {champion.roles.map(role => (
                <span key={role} className="text-[8px] px-1.5 py-0.5 bg-[var(--gold-5)]/50 text-[var(--gold-2)] font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-3 space-y-3">
        {/* Win Rate - Prominent */}
        <div className="flex items-center justify-between p-2 bg-[var(--hextech-black)]/50 border border-[var(--gold-5)]/30">
          <span className="text-[10px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Win Rate
          </span>
          <span className={`text-lg font-[var(--font-beaufort)] font-bold ${winRateColor}`}>
            {(champion.winRate * 100).toFixed(1)}%
          </span>
        </div>

        {/* Other Stats */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase">Pick Rate</span>
              <span className="text-[10px] font-[var(--font-spiegel)] text-[var(--gold-1)]">
                {(champion.pickRate * 100).toFixed(1)}%
              </span>
            </div>
            {getStatBar(champion.pickRate, 0.3)}
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase">Ban Rate</span>
              <span className="text-[10px] font-[var(--font-spiegel)] text-[var(--gold-1)]">
                {(champion.banRate * 100).toFixed(1)}%
              </span>
            </div>
            {getStatBar(champion.banRate, 0.3)}
          </div>
        </div>

        {/* Tags */}
        <div className="pt-2 border-t border-[var(--gold-5)]/30">
          <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Class
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {champion.tags.map(tag => (
              <span 
                key={tag} 
                className="text-[9px] px-2 py-0.5 bg-[var(--blue-5)]/30 text-[var(--blue-2)] border border-[var(--blue-4)]/30 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Tip */}
        <div className="p-2 bg-[var(--gold-5)]/10 border border-[var(--gold-4)]/20">
          <div className="flex items-start gap-2">
            <span className="text-[var(--gold-2)]">💡</span>
            <p className="text-[9px] text-[var(--muted)] leading-relaxed">
              {champion.winRate >= 0.52 
                ? 'Strong meta pick. Consider prioritizing in draft.'
                : champion.winRate <= 0.48 
                  ? 'Situational pick. Best with specific team comps.'
                  : 'Balanced champion. Solid in most situations.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--gold-3)]" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--gold-3)]" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--gold-3)]" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--gold-3)]" />
    </div>
  );
};
