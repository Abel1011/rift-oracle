import React, { useEffect, useState, useCallback } from 'react';

interface DraftTimerProps {
  isActive: boolean;
  onTimeUp?: () => void;
  currentTurn: number;
  duration?: number;
}

export const DraftTimer: React.FC<DraftTimerProps> = ({ 
  isActive, 
  onTimeUp, 
  currentTurn,
  duration = 30 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [currentTurn, duration]);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Handle time up in a separate effect
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onTimeUp?.();
    }
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Timer Circle */}
      <div className="relative w-20 h-20">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--hextech-metal)"
            strokeWidth="6"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isCritical ? 'var(--red-3)' : isLow ? 'var(--gold-3)' : 'var(--blue-2)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: isCritical 
                ? 'drop-shadow(0 0 8px var(--red-3))' 
                : isLow 
                  ? 'drop-shadow(0 0 8px var(--gold-3))' 
                  : 'drop-shadow(0 0 8px var(--blue-2))'
            }}
          />
        </svg>
        
        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-[var(--font-beaufort)] font-bold tracking-wider
            ${isCritical ? 'text-[var(--red-3)] animate-pulse' : isLow ? 'text-[var(--gold-2)]' : 'text-[var(--gold-1)]'}`}>
            {timeLeft}
          </span>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--gold-4)]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--gold-4)]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--gold-4)]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--gold-4)]" />
      </div>

      {/* Label */}
      <span className="text-[9px] font-[var(--font-spiegel)] text-[var(--muted)] uppercase tracking-wider">
        Time Remaining
      </span>
    </div>
  );
};
