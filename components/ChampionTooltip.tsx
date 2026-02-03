import React from 'react';
import { Champion } from '@/lib/types';

interface ChampionTooltipProps {
  champion: Champion;
  position?: { x: number; y: number };
}

export const ChampionTooltip: React.FC<ChampionTooltipProps> = ({ champion }) => {
  return (
    <div className="w-56 bg-gradient-to-b from-[var(--hextech-metal)] to-[var(--hextech-black)] border border-[var(--gold-4)] shadow-2xl">
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

      {/* Info Section */}
      <div className="p-3 space-y-3">
        {/* Tags/Class */}
        <div>
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

        {/* Roles */}
        <div className="pt-2 border-t border-[var(--gold-5)]/30">
          <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
            Positions
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {champion.roles.map(role => (
              <span 
                key={role} 
                className="text-[9px] px-2 py-0.5 bg-[var(--gold-5)]/30 text-[var(--gold-2)] border border-[var(--gold-4)]/30 font-medium"
              >
                {role}
              </span>
            ))}
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
