import React from 'react';
import { Check } from 'lucide-react';

interface DraftPhaseIndicatorProps {
  currentTurn: number;
  isFinished: boolean;
}

// Draft phases based on turn number
const getPhaseInfo = (turn: number) => {
  if (turn < 6) {
    return { 
      phase: 'BAN PHASE 1', 
      subPhase: `Ban ${turn + 1}/6`,
      phaseNumber: 1,
      type: 'ban'
    };
  }
  if (turn < 12) {
    return { 
      phase: 'PICK PHASE 1', 
      subPhase: `Pick ${turn - 5}/6`,
      phaseNumber: 2,
      type: 'pick'
    };
  }
  if (turn < 16) {
    return { 
      phase: 'BAN PHASE 2', 
      subPhase: `Ban ${turn - 11}/4`,
      phaseNumber: 3,
      type: 'ban'
    };
  }
  if (turn < 20) {
    return { 
      phase: 'PICK PHASE 2', 
      subPhase: `Pick ${turn - 15}/4`,
      phaseNumber: 4,
      type: 'pick'
    };
  }
  return { 
    phase: 'COMPLETE', 
    subPhase: 'Draft Finished',
    phaseNumber: 5,
    type: 'done'
  };
};

export const DraftPhaseIndicator: React.FC<DraftPhaseIndicatorProps> = ({ currentTurn, isFinished }) => {
  const { phase, subPhase, phaseNumber, type } = getPhaseInfo(currentTurn);
  
  const phases = [
    { label: 'BAN 1', turns: '1-6' },
    { label: 'PICK 1', turns: '7-12' },
    { label: 'BAN 2', turns: '13-16' },
    { label: 'PICK 2', turns: '17-20' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Phase Progress Bar */}
      <div className="flex items-center gap-1">
        {phases.map((p, idx) => {
          const isActive = phaseNumber === idx + 1;
          const isComplete = phaseNumber > idx + 1 || isFinished;
          const isBan = p.label.includes('BAN');
          
          return (
            <React.Fragment key={p.label}>
              {/* Phase Block */}
              <div 
                className={`relative flex-1 h-8 flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? isBan 
                      ? 'bg-[var(--red-5)]/50 border border-[var(--red-4)]' 
                      : 'bg-[var(--blue-5)]/50 border border-[var(--blue-3)]'
                    : isComplete 
                      ? 'bg-[var(--gold-5)]/30 border border-[var(--gold-4)]/50' 
                      : 'bg-[var(--hextech-metal)]/30 border border-[var(--hextech-metal)]'
                  }`}
              >
                {/* Active Glow */}
                {isActive && (
                  <div className={`absolute inset-0 ${isBan ? 'bg-[var(--red-3)]' : 'bg-[var(--blue-2)]'} opacity-10 animate-pulse`} />
                )}
                
                {/* Label */}
                <span className={`text-[9px] font-[var(--font-beaufort)] font-bold tracking-wider relative z-10
                  ${isActive 
                    ? isBan ? 'text-[var(--red-2)]' : 'text-[var(--blue-1)]'
                    : isComplete 
                      ? 'text-[var(--gold-3)]' 
                      : 'text-[var(--muted-dark)]'
                  }`}>
                  {p.label}
                </span>

                {/* Checkmark for complete */}
                {isComplete && (
                  <div className="absolute right-1 top-1">
                    <Check className="w-3 h-3 text-[var(--gold-3)]" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Connector */}
              {idx < phases.length - 1 && (
                <div className={`w-2 h-0.5 ${phaseNumber > idx + 1 ? 'bg-[var(--gold-4)]' : 'bg-[var(--hextech-metal)]'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Phase Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isFinished 
              ? 'bg-[var(--gold-2)]' 
              : type === 'ban' 
                ? 'bg-[var(--red-3)] animate-pulse' 
                : 'bg-[var(--blue-2)] animate-pulse'
          }`} />
          <span className={`text-[11px] font-[var(--font-beaufort)] font-bold tracking-wider
            ${isFinished 
              ? 'text-[var(--gold-2)]' 
              : type === 'ban' 
                ? 'text-[var(--red-2)]' 
                : 'text-[var(--blue-1)]'
            }`}>
            {phase}
          </span>
        </div>
        
        <span className="text-[10px] font-[var(--font-spiegel)] text-[var(--muted)]">
          {subPhase} • Turn {Math.min(currentTurn + 1, 20)}/20
        </span>
      </div>
    </div>
  );
};
