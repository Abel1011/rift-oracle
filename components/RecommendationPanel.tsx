import React from 'react';
import { Recommendation } from '@/lib/types';
import { CHAMPIONS } from '@/lib/data';
import { TrendingUp, Target, Lightbulb } from 'lucide-react';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  predictions: Recommendation[];
  winProbability: { blue: number; red: number };
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ recommendations, predictions }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[var(--hextech-metal)]/80 to-[var(--hextech-black)]">
      {/* Panel Header */}
      <div className="relative px-4 py-3 border-b border-[var(--gold-5)]/30">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold-3)]/50 to-transparent" />
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-[var(--gold-3)] rotate-45" />
          <h3 className="text-[11px] font-[var(--font-beaufort)] font-bold text-[var(--gold-2)] tracking-[0.2em] uppercase">
            AI Analysis
          </h3>
          <div className="w-1 h-1 bg-[var(--gold-3)] rotate-45" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        
        {/* Optimal Picks Section */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--blue-2)]"><TrendingUp className="w-4 h-4" /></span>
            <h4 className="text-[10px] font-[var(--font-beaufort)] font-bold text-blue-glow tracking-[0.15em] uppercase">
              Optimal Selections
            </h4>
          </div>
          
          <div className="space-y-2">
            {recommendations.slice(0, 4).map((rec, index) => {
              const champion = CHAMPIONS.find(c => c.id === rec.championId);
              if (!champion) return null;
              
              const winDiff = Math.round((rec.predictedWinRate - 0.5) * 100);
              
              return (
                <div 
                  key={rec.championId} 
                  className="group relative overflow-hidden transition-all duration-300 hover:translate-x-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-6)]/60 to-[var(--hextech-black)]/80 border border-[var(--blue-4)]/30 group-hover:border-[var(--blue-3)]/50 transition-colors" />
                  
                  {/* Left Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--blue-2)] to-[var(--blue-4)]" />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-3 p-2.5 pl-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <span className="text-[10px] font-[var(--font-beaufort)] font-bold text-[var(--gold-3)]">
                        #{index + 1}
                      </span>
                    </div>
                    
                    {/* Champion Portrait */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="absolute inset-0 border border-[var(--blue-3)]/50 group-hover:border-[var(--blue-2)] transition-colors" />
                      <img 
                        src={champion.imageUrl} 
                        alt={champion.name} 
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all" 
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-[var(--font-beaufort)] text-xs font-bold text-[var(--gold-1)] truncate">
                          {champion.name}
                        </h5>
                        <span className={`text-[10px] font-[var(--font-spiegel)] font-bold px-1.5 py-0.5 rounded-sm
                          ${winDiff > 0 
                            ? 'text-[var(--blue-1)] bg-[var(--blue-4)]/50' 
                            : 'text-[var(--red-3)] bg-[var(--red-5)]/50'
                          }`}>
                          {winDiff > 0 ? '+' : ''}{winDiff}%
                        </span>
                      </div>
                      <p className="text-[9px] text-[var(--muted)] font-[var(--font-spiegel)] leading-tight mt-0.5 line-clamp-2">
                        {rec.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Enemy Predictions Section */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--red-3)]"><Target className="w-4 h-4" /></span>
            <h4 className="text-[10px] font-[var(--font-beaufort)] font-bold text-red-glow tracking-[0.15em] uppercase">
              Enemy Predictions
            </h4>
          </div>
          
          <div className="space-y-1.5">
            {predictions.slice(0, 4).map((rec, index) => {
              const champion = CHAMPIONS.find(c => c.id === rec.championId);
              if (!champion) return null;
              
              return (
                <div 
                  key={`pred-${rec.championId}`} 
                  className="flex items-center gap-2.5 p-2 bg-[var(--red-6)]/20 border border-[var(--red-5)]/20 hover:border-[var(--red-4)]/40 transition-colors"
                >
                  {/* Champion Mini Portrait */}
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--red-4)]/30 flex-shrink-0">
                    <img 
                      src={champion.imageUrl} 
                      alt={champion.name} 
                      className="w-full h-full object-cover opacity-70" 
                    />
                  </div>
                  
                  {/* Name and Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-[var(--font-spiegel)] font-medium text-[var(--gold-1)] truncate">
                        {champion.name}
                      </span>
                      <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--red-3)]">
                        {rec.score}%
                      </span>
                    </div>
                    
                    {/* Probability Bar */}
                    <div className="h-1 bg-[var(--hextech-metal)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--red-4)] to-[var(--red-3)] transition-all duration-500"
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Strategic Insight Card */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="relative p-3 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-5)]/20 to-transparent border border-[var(--gold-4)]/30" />
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--gold-3)]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--gold-3)]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--gold-3)]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--gold-3)]" />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[var(--gold-2)]"><Lightbulb className="w-4 h-4" /></span>
                <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-gold-glow tracking-[0.15em] uppercase">
                  Strategic Insight
                </span>
              </div>
              
              <p className="text-[10px] text-[var(--muted)] font-[var(--font-spiegel)] leading-relaxed">
                Team synergy is currently <span className="text-[var(--blue-2)] font-semibold">Optimal</span>. 
                Consider securing engage tools to capitalize on your composition's teamfight potential.
              </p>
              
              {/* Mini Stats */}
              <div className="flex gap-4 mt-3 pt-2 border-t border-[var(--gold-5)]/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--blue-3)]" />
                  <span className="text-[9px] text-[var(--muted-dark)]">Teamfight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--gold-3)]" />
                  <span className="text-[9px] text-[var(--muted-dark)]">Scaling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--red-3)]/50" />
                  <span className="text-[9px] text-[var(--muted-dark)]">Early Game</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-2 border-t border-[var(--gold-5)]/20 bg-[var(--hextech-black)]/50">
        <div className="flex items-center justify-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--gold-4)] blink" />
          <span className="text-[8px] text-[var(--muted-dark)] font-[var(--font-spiegel)] tracking-wider uppercase">
            Powered by Neural Strategy Engine
          </span>
        </div>
      </div>
    </div>
  );
};
