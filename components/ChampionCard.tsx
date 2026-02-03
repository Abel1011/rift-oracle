import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Champion } from '@/lib/types';
import { ChampionTooltip } from './ChampionTooltip';

interface ChampionCardProps {
  champion: Champion;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  showTooltip?: boolean;
}

interface TooltipStyle {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  transform?: string;
}

export const ChampionCard: React.FC<ChampionCardProps> = ({ 
  champion, 
  onClick, 
  disabled, 
  small,
  showTooltip = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = useCallback(() => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const tooltipWidth = 256;
    const tooltipHeight = 300;
    const gap = 8;
    
    const style: TooltipStyle = {};
    
    // Vertical: prefer top, but use bottom if not enough space
    if (rect.top > tooltipHeight + gap) {
      style.top = rect.top - tooltipHeight - gap;
    } else {
      style.top = rect.bottom + gap;
    }
    
    // Horizontal: center by default, adjust if near edges
    const centerX = rect.left + rect.width / 2;
    const leftEdge = centerX - tooltipWidth / 2;
    const rightEdge = centerX + tooltipWidth / 2;
    
    if (leftEdge < 8) {
      // Too close to left edge
      style.left = 8;
    } else if (rightEdge > window.innerWidth - 8) {
      // Too close to right edge
      style.left = window.innerWidth - tooltipWidth - 8;
    } else {
      // Center it
      style.left = centerX - tooltipWidth / 2;
    }
    
    setTooltipStyle(style);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    calculateTooltipPosition();
  }, [calculateTooltipPosition]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group cursor-pointer champion-hover
        ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}
        ${small ? 'w-16 h-16' : 'w-full aspect-square'}`}
    >
      {/* Tooltip - using portal to render at document body level */}
      {showTooltip && !small && !disabled && isHovered && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none animate-fade-in"
          style={{
            top: tooltipStyle.top,
            left: tooltipStyle.left,
          }}
        >
          <ChampionTooltip champion={champion} />
        </div>,
        document.body
      )}

      {/* Outer Hextech Frame */}
      <div className={`absolute -inset-[1px] transition-all duration-300
        ${disabled 
          ? 'bg-[var(--hextech-metal)]' 
          : 'bg-gradient-to-b from-[var(--gold-3)] via-[var(--gold-4)] to-[var(--gold-5)] group-hover:from-[var(--gold-2)] group-hover:via-[var(--gold-3)] group-hover:to-[var(--gold-4)]'
        }`} 
      />
      
      {/* Inner Container */}
      <div className="relative w-full h-full overflow-hidden bg-[var(--hextech-black)]">
        {/* Champion Image */}
        <img
          src={champion.imageUrl}
          alt={champion.name}
          className={`w-full h-full object-cover transition-all duration-500 
            ${disabled ? '' : 'group-hover:scale-110 group-hover:brightness-110'}`}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--hextech-black)] via-transparent to-transparent opacity-80" />
        <div className={`absolute inset-0 bg-gradient-to-t from-[var(--gold-5)]/60 to-transparent opacity-0 transition-opacity duration-300
          ${disabled ? '' : 'group-hover:opacity-100'}`} 
        />
        
        {/* Hover Glow Effect */}
        {!disabled && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--gold-3)]/20 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--gold-4)]/40 to-transparent" />
          </div>
        )}

        {/* Name Tag */}
        {!small && (
          <div className="absolute bottom-0 left-0 right-0 p-2 transition-all duration-300">
            <div className="relative">
              {/* Name Background */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--hextech-black)]/95 to-[var(--hextech-black)]/70 backdrop-blur-sm" />
              
              {/* Name Text */}
              <p className="relative text-[10px] font-[var(--font-beaufort)] font-bold text-center uppercase tracking-wider
                text-[var(--gold-2)] group-hover:text-[var(--gold-1)] transition-colors duration-300 py-1">
                {champion.name}
              </p>
            </div>
          </div>
        )}

        {/* Corner Accents */}
        {!small && !disabled && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[var(--gold-3)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[var(--gold-3)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[var(--gold-3)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[var(--gold-3)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}

        {/* Role Badge */}
        {!small && !disabled && (
          <div className="absolute top-1 right-1 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--gold-4)] blur-sm" />
              <div className="relative px-1.5 py-0.5 bg-gradient-to-b from-[var(--gold-3)] to-[var(--gold-4)] border border-[var(--gold-5)]">
                <span className="text-[8px] font-[var(--font-spiegel)] font-bold text-[var(--hextech-black)] uppercase tracking-wider">
                  {champion.roles[0]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Win Rate Indicator */}
        {!small && !disabled && (
          <div className="absolute top-1 left-1 z-20">
            <div className={`px-1.5 py-0.5 bg-[var(--hextech-black)]/80 border 
              ${champion.winRate >= 0.52 
                ? 'border-[var(--blue-3)]/50' 
                : champion.winRate <= 0.48 
                  ? 'border-[var(--red-4)]/50' 
                  : 'border-[var(--gold-5)]/50'
              }`}>
              <span className={`text-[8px] font-[var(--font-spiegel)] font-bold
                ${champion.winRate >= 0.52 
                  ? 'text-[var(--blue-2)]' 
                  : champion.winRate <= 0.48 
                    ? 'text-[var(--red-3)]' 
                    : 'text-[var(--gold-2)]'
                }`}>
                {Math.round(champion.winRate * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />
      </div>

      {/* Outer Glow on Hover */}
      {!disabled && (
        <div className="absolute -inset-2 bg-[var(--gold-3)]/0 group-hover:bg-[var(--gold-3)]/10 blur-xl transition-all duration-500 -z-10" />
      )}
    </div>
  );
};
