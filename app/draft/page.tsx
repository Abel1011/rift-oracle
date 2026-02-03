'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHAMPIONS } from '@/lib/data';
import { DraftState, Role } from '@/lib/types';
import { INITIAL_DRAFT_STATE, getNextAction } from '@/lib/draftLogic';
import { ChampionCard } from '@/components/ChampionCard';
import { DraftTimer } from '@/components/DraftTimer';
import { DraftPhaseIndicator } from '@/components/DraftPhaseIndicator';
import { useDraftSync } from '@/hooks/useDraftSync';
import { useDraftConfig } from '@/lib/context/DraftConfigContext';
import { Diamond, Shield, Sword, RotateCcw, Search, PanelLeftClose, PanelRightClose, Menu, X, ArrowLeftRight, Settings, Brain } from 'lucide-react';

// Champion class tags for filtering
const CHAMPION_TAGS = ['Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'] as const;
type ChampionTag = typeof CHAMPION_TAGS[number];

// Sort options
type SortOption = 'name' | 'winrate' | 'pickrate' | 'banrate';

// Mobile panel type
type MobilePanel = 'none' | 'blue' | 'red';

export default function Home() {
  const router = useRouter();
  const [draftState, setDraftState] = useState<DraftState>(INITIAL_DRAFT_STATE);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [selectedTag, setSelectedTag] = useState<ChampionTag | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now());
  
  // Mobile responsive state
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get selected teams from context
  const { config } = useDraftConfig();
  const blueTeam = config.blueTeam;
  const redTeam = config.redTeam;

  // Redirect to setup if teams aren't configured
  useEffect(() => {
    if (!config.isConfigured) {
      router.replace('/setup');
    }
  }, [config.isConfigured, router]);

  // Sync hook for multi-page sync
  const { publishState } = useDraftSync({
    source: 'draft',
    loadInitialState: false
  });

  // Publish state to other pages whenever draft changes
  useEffect(() => {
    publishState(draftState);
  }, [draftState, publishState]);

  // Reset turn timer when turn changes
  useEffect(() => {
    setTurnStartTime(Date.now());
  }, [draftState.currentTurn]);

  const currentAction = getNextAction(draftState.currentTurn);

  // Enhanced filtering with tags and sorting
  const filteredChampions = useMemo(() => {
    let champions = CHAMPIONS.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || c.roles.includes(selectedRole as Role);
      const matchesTag = selectedTag === 'ALL' || c.tags.includes(selectedTag);
      const isAlreadyUsed = [
        ...draftState.bluePicks, 
        ...draftState.blueBans, 
        ...draftState.redPicks, 
        ...draftState.redBans
      ].includes(c.id);
      
      return matchesSearch && matchesRole && matchesTag && !isAlreadyUsed;
    });

    // Sort champions
    switch (sortBy) {
      case 'winrate':
        champions = [...champions].sort((a, b) => b.winRate - a.winRate);
        break;
      case 'pickrate':
        champions = [...champions].sort((a, b) => b.pickRate - a.pickRate);
        break;
      case 'banrate':
        champions = [...champions].sort((a, b) => b.banRate - a.banRate);
        break;
      default:
        champions = [...champions].sort((a, b) => a.name.localeCompare(b.name));
    }

    return champions;
  }, [searchTerm, selectedRole, selectedTag, sortBy, draftState]);

  const handleChampionClick = useCallback((championId: string) => {
    if (!currentAction || draftState.isFinished) return;

    const now = Date.now();
    const durationMs = now - turnStartTime;

    // Create deep copy to avoid mutating original state
    const newState = {
      ...draftState,
      bluePicks: [...draftState.bluePicks],
      blueBans: [...draftState.blueBans],
      redPicks: [...draftState.redPicks],
      redBans: [...draftState.redBans],
      timings: [...(draftState.timings || [])],
      draftStartTime: draftState.draftStartTime || now,
    };
    
    if (currentAction.type === 'PICK') {
      if (currentAction.side === 'BLUE') newState.bluePicks.push(championId);
      else newState.redPicks.push(championId);
    } else {
      if (currentAction.side === 'BLUE') newState.blueBans.push(championId);
      else newState.redBans.push(championId);
    }

    // Record timing for this action
    newState.timings.push({
      turn: draftState.currentTurn,
      championId,
      side: currentAction.side,
      type: currentAction.type,
      timestamp: now,
      durationMs,
    });

    newState.currentTurn += 1;
    if (newState.currentTurn >= 20) newState.isFinished = true;
    
    setDraftState(newState);
    setSearchTerm('');
  }, [currentAction, draftState, turnStartTime]);

  // Auto-pick random champion when timer runs out
  const handleTimeUp = useCallback(() => {
    if (filteredChampions.length > 0 && !draftState.isFinished) {
      const randomChamp = filteredChampions[Math.floor(Math.random() * filteredChampions.length)];
      handleChampionClick(randomChamp.id);
    }
  }, [filteredChampions, draftState.isFinished, handleChampionClick]);

  const resetDraft = useCallback(() => {
    // Create fresh state with new array instances to avoid mutation issues
    setDraftState({
      bluePicks: [],
      blueBans: [],
      redPicks: [],
      redBans: [],
      currentTurn: 0,
      isFinished: false,
      timings: [],
      draftStartTime: undefined,
    });
    setTurnStartTime(Date.now());
  }, []);

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      TOP: '⚔️',
      JUNGLE: '🌲',
      MID: '🎯',
      ADC: '🏹',
      SUPPORT: '🛡️'
    };
    return icons[role] || '⭐';
  };

  // Show loading while redirecting to setup
  if (!config.isConfigured) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--hextech-black)]">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[var(--gold-3)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--gold-3)] font-[var(--font-beaufort)] tracking-wider">
            Redirecting to Setup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--hextech-black)] overflow-hidden">
      {/* ===== HEADER - RESPONSIVE ===== */}
      <header className="relative h-14 md:h-16 lg:h-20 flex-shrink-0 border-b border-[var(--gold-5)] bg-gradient-to-b from-[var(--hextech-metal)] to-[var(--hextech-black)] flex items-center px-2 sm:px-3 md:px-4 lg:px-6 z-50">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-3)] to-transparent" />
        
        {/* Left Section - Logo & Blue Team Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Mobile menu button for blue team */}
          <button 
            onClick={() => setMobilePanel(mobilePanel === 'blue' ? 'none' : 'blue')}
            className={`lg:hidden p-1.5 sm:p-2 rounded border transition-all duration-300
              ${currentAction?.side === 'BLUE' && !draftState.isFinished
                ? 'border-[var(--blue-2)] bg-[var(--blue-3)]/30 text-[var(--blue-1)] animate-pulse shadow-[0_0_15px_rgba(11,198,227,0.5)]'
                : 'border-[var(--blue-3)]/50 text-[var(--blue-2)] hover:bg-[var(--blue-5)]/30'
              }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {/* Logo - Hidden on mobile and tablet */}
          <div className="relative hidden lg:block">
            <div className="w-10 h-10 lg:w-12 lg:h-12 relative flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[var(--gold-3)] rotate-45 bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent" />
              <div className="absolute inset-1 border border-[var(--gold-4)] rotate-45" />
              <Brain className="relative w-5 h-5 lg:w-6 lg:h-6 text-[var(--gold-2)]" />
            </div>
            <div className="absolute inset-0 blur-xl bg-[var(--gold-3)]/20 -z-10" />
          </div>
          
          {/* Title */}
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-sm md:text-base lg:text-xl font-[var(--font-beaufort)] font-bold tracking-wider">
              <span className="text-gold-glow">RIFT</span>
              <span className="text-[var(--gold-1)] ml-1 hidden sm:inline">ORACLE</span>
            </h1>
            <div className="hidden lg:flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-2)] blink" />
              <span className="text-[10px] text-[var(--muted)] font-[var(--font-spiegel)] font-medium tracking-[0.2em] uppercase">
                Neural Strategy Engine v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Title */}
        <div className="flex-1 flex justify-center px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--blue-2)]" />
            <span className="text-xs md:text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-2)] tracking-wider">
              {blueTeam?.nameShortened || 'BLU'}
            </span>
            <span className="text-[var(--muted)] mx-2">vs</span>
            <span className="text-xs md:text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-2)] tracking-wider">
              {redTeam?.nameShortened || 'RED'}
            </span>
            <Sword className="w-4 h-4 text-[var(--red-3)]" />
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Change Teams Button */}
          <button 
            onClick={() => router.push('/setup')}
            className="hextech-button flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
            title="Change Teams"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline text-[10px] lg:text-xs">Teams</span>
          </button>
          
          {/* Reset Button */}
          <button 
            onClick={resetDraft}
            className="hextech-button flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2"
            title="Reset Draft"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline text-[10px] lg:text-xs">Reset</span>
          </button>
          
          {/* Mobile menu button for red team */}
          <button 
            onClick={() => setMobilePanel(mobilePanel === 'red' ? 'none' : 'red')}
            className={`lg:hidden p-1.5 sm:p-2 rounded border transition-all duration-300
              ${currentAction?.side === 'RED' && !draftState.isFinished
                ? 'border-[var(--red-3)] bg-[var(--red-4)]/30 text-[var(--red-1)] animate-pulse shadow-[0_0_15px_rgba(238,90,75,0.5)]'
                : 'border-[var(--red-4)]/50 text-[var(--red-3)] hover:bg-[var(--red-5)]/30'
              }`}
          >
            <Sword className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT - RESPONSIVE LAYOUT ===== */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Mobile Overlay */}
        {mobilePanel !== 'none' && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobilePanel('none')}
          />
        )}
        
        {/* ===== LEFT SIDE: BLUE TEAM - Responsive Sidebar ===== */}
        <aside className={`
          ${mobilePanel === 'blue' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-72 lg:w-80 flex-shrink-0 flex flex-col border-r 
          bg-[var(--hextech-black)] lg:bg-transparent
          lg:bg-gradient-to-r lg:from-[var(--blue-6)]/60 lg:to-transparent 
          blue-side-glow transition-all duration-300
          ${currentAction?.side === 'BLUE' && !draftState.isFinished
            ? 'border-[var(--blue-2)] shadow-[inset_0_0_30px_rgba(11,198,227,0.2)]'
            : 'border-[var(--gold-5)]/30'
          }`}>
          
          {/* Mobile background gradient overlay */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-r from-[var(--blue-6)] to-[var(--hextech-black)] -z-10" />
          
          {/* Mobile close button */}
          <button 
            onClick={() => setMobilePanel('none')}
            className="lg:hidden absolute top-2 right-2 p-2 text-[var(--blue-2)] hover:bg-[var(--blue-5)]/30 rounded z-10"
          >
            <X className="w-5 h-5" />
          </button>
          {/* Team Header - Enhanced */}
          <div className={`flex-shrink-0 p-4 border-b relative overflow-hidden transition-all duration-500
            ${currentAction?.side === 'BLUE' && !draftState.isFinished
              ? 'bg-gradient-to-b from-[var(--blue-3)]/30 to-[var(--blue-5)]/10 border-[var(--blue-2)]/50'
              : 'bg-gradient-to-b from-[var(--blue-5)]/20 to-transparent border-[var(--blue-4)]/30'
            }`}>
            {/* Active Turn Indicator */}
            {currentAction?.side === 'BLUE' && !draftState.isFinished && (
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-2)]/10 to-transparent animate-pulse" />
            )}
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--blue-3)]/50" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[var(--blue-4)]/30" />
            
            <div className="flex items-center gap-4 relative">
              {/* Team Logo with glow */}
              <div className="relative">
                {blueTeam?.logoUrl ? (
                  <div className="w-14 h-14 rounded-lg border-2 border-[var(--blue-3)] bg-[var(--blue-5)]/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(11,198,227,0.3)]">
                    <img 
                      src={blueTeam.logoUrl} 
                      alt={blueTeam.name} 
                      className="w-11 h-11 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[var(--blue-2)] text-lg font-bold">${blueTeam.nameShortened || 'BLU'}</span>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg border-2 border-[var(--blue-3)] bg-[var(--blue-5)]/50 flex items-center justify-center shadow-[0_0_20px_rgba(11,198,227,0.3)]">
                    <span className="text-[var(--blue-2)] text-lg font-bold">{blueTeam?.nameShortened || 'BLU'}</span>
                  </div>
                )}
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-[var(--blue-3)]/20 rounded-lg blur-md -z-10" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5" />
                  <span className="text-[10px] text-[var(--blue-3)] font-[var(--font-spiegel)] font-bold tracking-[0.15em] uppercase">Blue Side</span>
                  {currentAction?.side === 'BLUE' && !draftState.isFinished && (
                    <span className="hidden lg:inline ml-auto px-2 py-0.5 bg-[var(--blue-2)] text-[var(--hextech-black)] text-[9px] font-bold rounded animate-pulse">
                      YOUR TURN
                    </span>
                  )}
                </div>
                <h2 className={`text-lg font-[var(--font-beaufort)] font-bold tracking-wide truncate transition-all duration-300
                  ${currentAction?.side === 'BLUE' && !draftState.isFinished ? 'text-[var(--blue-1)] scale-105 origin-left' : 'text-blue-glow'}`}>
                  {blueTeam?.name || 'BLUE TEAM'}
                </h2>
                <p className="text-[10px] text-[var(--blue-4)] font-medium flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full bg-[var(--blue-2)] ${currentAction?.side === 'BLUE' ? 'animate-ping' : 'animate-pulse'}`} />
                  {currentAction?.side === 'BLUE' && !draftState.isFinished ? `Select ${currentAction.type}` : 'First Pick Advantage'}
                </p>
                {/* Mobile YOUR TURN badge - positioned below to avoid X button */}
                {currentAction?.side === 'BLUE' && !draftState.isFinished && (
                  <span className="lg:hidden mt-2 inline-block px-3 py-1 bg-[var(--blue-2)] text-[var(--hextech-black)] text-[10px] font-bold rounded animate-pulse">
                    YOUR TURN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {/* Picks Section */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-[var(--blue-3)]/50 to-transparent" />
                <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--blue-2)] tracking-[0.2em]">PICKS</span>
                <div className="h-px flex-1 bg-gradient-to-l from-[var(--blue-3)]/50 to-transparent" />
              </div>
              
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3, 4].map(i => {
                  const champId = draftState.bluePicks[i];
                  const champ = champId ? CHAMPIONS.find(c => c.id === champId) : null;
                  const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
                  
                  return (
                    <div 
                      key={`blue-p-${i}`} 
                      className={`relative h-[72px] overflow-hidden transition-all duration-500 group rounded-sm
                        ${champ 
                          ? 'hextech-border-blue bg-gradient-to-r from-[var(--blue-5)]/80 to-[var(--blue-6)]/50' 
                          : 'border border-[var(--blue-4)]/30 bg-[var(--hextech-black)]/50'
                        }
                        ${!champ && currentAction?.side === 'BLUE' && currentAction?.type === 'PICK' && draftState.bluePicks.length === i
                          ? 'border-[var(--blue-2)] pulse-glow text-[var(--blue-2)]'
                          : ''
                        }`}
                    >
                      {champ ? (
                        <>
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <img 
                              src={champ.imageUrl} 
                              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-150"
                              alt="" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-6)] via-transparent to-transparent" />
                          </div>
                        
                        {/* Champion Portrait */}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-14 h-14 border border-[var(--blue-3)] overflow-hidden">
                          <img src={champ.imageUrl} className="w-full h-full object-cover" alt={champ.name} />
                          <div className="absolute inset-0 border border-white/10" />
                        </div>
                        
                        {/* Info */}
                        <div className="relative h-full pl-20 pr-3 flex flex-col justify-center">
                          <span className="text-[8px] font-[var(--font-spiegel)] font-bold text-[var(--blue-2)] uppercase tracking-wider">
                            {roles[i]}
                          </span>
                          <span className="font-[var(--font-beaufort)] text-sm font-bold text-[var(--gold-1)] truncate">
                            {champ.name}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {champ.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-[var(--blue-4)]/50 text-[var(--blue-1)] rounded-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center gap-3">
                        <span className="text-[var(--muted-dark)] text-lg">{getRoleIcon(roles[i])}</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[var(--muted-dark)] font-[var(--font-beaufort)] tracking-wider">{roles[i]}</span>
                          <span className="text-[10px] text-[var(--muted-dark)]/50 font-[var(--font-spiegel)] italic">Awaiting pick...</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

              {/* Bans Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--red-4)]/30 to-transparent" />
                  <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--muted)] tracking-[0.2em]">BANS</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-[var(--red-4)]/30 to-transparent" />
                </div>
                
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(i => {
                    const champId = draftState.blueBans[i];
                    const champ = champId ? CHAMPIONS.find(c => c.id === champId) : null;
                    const isActive = currentAction?.side === 'BLUE' && currentAction?.type === 'BAN' && draftState.blueBans.length === i;
                    
                    return (
                      <div 
                        key={`blue-b-${i}`} 
                        className={`w-11 h-11 border relative overflow-hidden rounded-sm
                          ${champ 
                            ? 'border-[var(--red-5)]/50 bg-[var(--red-6)]/30' 
                            : 'border-[var(--gold-5)]/30 bg-[var(--hextech-black)]/50'
                          }
                          ${isActive ? 'border-[var(--gold-3)] pulse-glow text-[var(--gold-3)]' : ''}`}
                      >
                        {champ ? (
                          <>
                            <img src={champ.imageUrl} className="w-full h-full object-cover grayscale opacity-60" alt="" />
                            <div className="absolute inset-0 bg-[var(--red-5)]/30" />
                            {/* Ban X */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-[var(--red-3)] rotate-45 absolute" />
                              <div className="w-full h-0.5 bg-[var(--red-3)] -rotate-45 absolute" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[var(--muted-dark)]/30 text-xs">✕</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== CENTER: CHAMPION GRID ===== */}
        <section className="flex-1 flex flex-col bg-[var(--hextech-black)] min-w-0">
          {/* Draft Phase Indicator - Sticky */}
          <div className="flex-shrink-0 hidden sm:block">
            <DraftPhaseIndicator currentTurn={draftState.currentTurn} isFinished={draftState.isFinished} />
          </div>
          
          {/* Action Bar - Responsive */}
          <div className="flex-shrink-0 p-2 md:p-4 border-b border-[var(--gold-5)]/20 bg-gradient-to-b from-[var(--hextech-metal)]/50 to-transparent">
            {/* Mobile: Simplified action bar */}
            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
              {/* Timer + Current Phase */}
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                {!draftState.isFinished && currentAction && (
                  <>
                    {/* Draft Timer - smaller on mobile */}
                    {timerEnabled && (
                      <div className="scale-75 md:scale-100 origin-left">
                        <DraftTimer 
                          currentTurn={draftState.currentTurn}
                          onTimeUp={handleTimeUp}
                          isActive={!draftState.isFinished}
                        />
                      </div>
                    )}
                    
                    {/* Current Action Indicator - Compact on mobile */}
                    <div className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 border rounded
                      ${currentAction.side === 'BLUE' 
                        ? 'border-[var(--blue-3)] bg-[var(--blue-6)]/50 text-[var(--blue-2)]' 
                        : 'border-[var(--red-4)] bg-[var(--red-6)]/50 text-[var(--red-3)]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full blink ${currentAction.side === 'BLUE' ? 'bg-[var(--blue-2)]' : 'bg-[var(--red-3)]'}`} />
                      <span className="text-[10px] md:text-[11px] font-[var(--font-beaufort)] font-bold tracking-wider uppercase">
                        {currentAction.side} {currentAction.type}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-[var(--font-spiegel)] text-[var(--muted)] hidden sm:inline">
                        Turn {draftState.currentTurn + 1}/20
                      </span>
                    </div>
                    
                    {/* Timer Toggle - Hidden on very small screens */}
                    <button 
                      onClick={() => setTimerEnabled(!timerEnabled)}
                      className={`hidden sm:block px-3 py-1.5 text-[10px] font-[var(--font-spiegel)] rounded border transition-all
                        ${timerEnabled 
                          ? 'border-[var(--gold-4)] bg-[var(--gold-5)]/20 text-[var(--gold-2)]' 
                          : 'border-[var(--muted-dark)] bg-transparent text-[var(--muted)]'
                        }`}
                    >
                      {timerEnabled ? '⏱️ ON' : '⏱️ OFF'}
                    </button>
                    
                    {/* Mobile: Toggle filters button */}
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="md:hidden px-2 py-1.5 text-[10px] font-[var(--font-spiegel)] rounded border border-[var(--gold-5)]/30 text-[var(--muted)]"
                    >
                      {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                  </>
                )}
              </div>

              {/* Search & Filters - Collapsible on mobile */}
              <div className={`${showFilters ? 'flex' : 'hidden'} md:flex gap-2 items-center flex-wrap justify-end`}>
                {/* Search Input */}
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold-4)] z-10" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="hextech-input w-full md:w-40 lg:w-52"
                    style={{ paddingLeft: '36px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Role Filter */}
                <select 
                  className="hextech-select w-24 md:w-28 lg:w-32 text-xs md:text-sm"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role | 'ALL')}
                >
                  <option value="ALL">All Roles</option>
                  <option value="TOP">⚔️ Top</option>
                  <option value="JUNGLE">🌲 Jungle</option>
                  <option value="MID">🎯 Mid</option>
                  <option value="ADC">🏹 ADC</option>
                  <option value="SUPPORT">🛡️ Support</option>
                </select>
                
                {/* Class/Tag Filter - hidden on small screens */}
                <select 
                  className="hidden sm:block hextech-select w-24 md:w-28 lg:w-32 text-xs md:text-sm"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value as ChampionTag | 'ALL')}
                >
                  <option value="ALL">All Classes</option>
                  {CHAMPION_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                
                {/* Sort Options - hidden on small screens */}
                <select 
                  className="hidden lg:block hextech-select w-32 text-xs md:text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="name">Sort: A-Z</option>
                  <option value="winrate">Sort: Win Rate</option>
                  <option value="pickrate">Sort: Pick Rate</option>
                  <option value="banrate">Sort: Ban Rate</option>
                </select>
              </div>
            </div>
            
            {/* Quick Filter Pills for Classes - Scrollable on mobile */}
            <div className="flex gap-2 mt-2 md:mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedTag('ALL')}
                className={`px-3 py-1 text-[10px] font-[var(--font-beaufort)] tracking-wider uppercase rounded-full border transition-all
                  ${selectedTag === 'ALL' 
                    ? 'border-[var(--gold-3)] bg-[var(--gold-5)]/30 text-[var(--gold-2)]' 
                    : 'border-[var(--gold-5)]/30 text-[var(--muted)] hover:border-[var(--gold-4)] hover:text-[var(--gold-3)]'
                  }`}
              >
                All
              </button>
              {CHAMPION_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? 'ALL' : tag)}
                  className={`flex-shrink-0 px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-[var(--font-beaufort)] tracking-wider uppercase rounded-full border transition-all
                    ${selectedTag === tag 
                      ? 'border-[var(--gold-3)] bg-[var(--gold-5)]/30 text-[var(--gold-2)]' 
                      : 'border-[var(--gold-5)]/30 text-[var(--muted)] hover:border-[var(--gold-4)] hover:text-[var(--gold-3)]'
                    }`}
                >
                  {tag}
                </button>
              ))}
              
              {/* Show count of filtered champions */}
              <span className="hidden md:block ml-auto text-[10px] text-[var(--muted)] font-[var(--font-spiegel)] self-center flex-shrink-0">
                {filteredChampions.length} champions
              </span>
            </div>
          </div>

          {/* Champion Grid - Responsive columns */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar">
            {!draftState.isFinished ? (
              <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 min-[112rem]:grid-cols-10 gap-2 md:gap-4">
                {filteredChampions.map((champion, index) => (
                  <div 
                    key={champion.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 10, 500)}ms` }}
                  >
                    <ChampionCard
                      champion={champion}
                      onClick={() => handleChampionClick(champion.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Draft Complete Screen */
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="relative mb-6 md:mb-8">
                  {/* Hextech diamond */}
                  <div className="w-20 h-20 md:w-28 md:h-28 border-2 border-[var(--gold-3)] rotate-45 flex items-center justify-center bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent magic-glow">
                    <div className="rotate-[-45deg] text-gold-glow font-[var(--font-beaufort)] font-black text-xl md:text-2xl tracking-wider">
                      GG
                    </div>
                  </div>
                  <div className="absolute inset-0 blur-2xl bg-[var(--gold-3)]/20 -z-10" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-[var(--font-beaufort)] font-black text-gold-glow tracking-wider mb-3 md:mb-4">
                  DRAFT COMPLETE
                </h2>
                <p className="text-sm md:text-base text-[var(--muted)] font-[var(--font-spiegel)] max-w-md mb-6 md:mb-8 leading-relaxed">
                  All picks and bans have been locked. Review the final team compositions.
                </p>
                
                <button 
                  onClick={resetDraft}
                  className="hextech-button px-6 md:px-10 py-3 md:py-4 text-xs md:text-sm"
                >
                  <span className="flex items-center gap-2 md:gap-3">
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    NEW DRAFT
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ===== RIGHT SIDE: RED TEAM + RECOMMENDATIONS - Responsive ===== */}
        <aside className={`
          ${mobilePanel === 'red' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto
          w-72 lg:w-80 flex-shrink-0 flex flex-col border-l 
          bg-[var(--hextech-black)] lg:bg-transparent
          transition-all duration-300
          ${currentAction?.side === 'RED' && !draftState.isFinished
            ? 'border-[var(--red-3)] shadow-[inset_0_0_30px_rgba(238,90,75,0.2)]'
            : 'border-[var(--gold-5)]/30'
          }`}>
          
          {/* Mobile background gradient overlay */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-l from-[var(--red-6)] to-[var(--hextech-black)] -z-10" />
          
          {/* Mobile close button */}
          <button 
            onClick={() => setMobilePanel('none')}
            className="lg:hidden absolute top-2 left-2 p-2 text-[var(--red-3)] hover:bg-[var(--red-5)]/30 rounded z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Red Team Section */}
          <div className="flex-1 flex flex-col lg:bg-gradient-to-l lg:from-[var(--red-6)]/60 lg:to-transparent red-side-glow overflow-hidden min-h-0">
            {/* Team Header - Enhanced */}
            <div className={`flex-shrink-0 p-3 lg:p-4 border-b relative overflow-hidden transition-all duration-500
              ${currentAction?.side === 'RED' && !draftState.isFinished
                ? 'bg-gradient-to-b from-[var(--red-3)]/30 to-[var(--red-5)]/10 border-[var(--red-3)]/50'
                : 'bg-gradient-to-b from-[var(--red-5)]/20 to-transparent border-[var(--red-5)]/30'
              }`}>
              {/* Active Turn Indicator */}
              {currentAction?.side === 'RED' && !draftState.isFinished && (
                <div className="absolute inset-0 bg-gradient-to-l from-[var(--red-3)]/10 to-transparent animate-pulse" />
              )}
              {/* Decorative corner accents */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[var(--red-4)]/50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[var(--red-5)]/30" />
              
              <div className="flex items-center justify-end gap-3 lg:gap-4 relative">
                <div className="text-right flex-1 min-w-0">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {currentAction?.side === 'RED' && !draftState.isFinished && (
                      <span className="hidden lg:inline mr-auto px-2 py-0.5 bg-[var(--red-3)] text-[var(--hextech-black)] text-[9px] font-bold rounded animate-pulse">
                        THEIR TURN
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--red-4)] font-[var(--font-spiegel)] font-bold tracking-[0.15em] uppercase">Red Side</span>
                    <Sword className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <h2 className={`text-base lg:text-lg font-[var(--font-beaufort)] font-bold tracking-wide truncate transition-all duration-300
                    ${currentAction?.side === 'RED' && !draftState.isFinished ? 'text-[var(--red-1)] scale-105 origin-right' : 'text-red-glow'}`}>
                    {redTeam?.name || 'RED TEAM'}
                  </h2>
                  <p className="text-[10px] text-[var(--red-5)] font-medium flex items-center justify-end gap-1">
                    {currentAction?.side === 'RED' && !draftState.isFinished ? `Select ${currentAction.type}` : 'Counter Pick Advantage'}
                    <span className={`w-1.5 h-1.5 rounded-full bg-[var(--red-3)] ${currentAction?.side === 'RED' ? 'animate-ping' : 'animate-pulse'}`} />
                  </p>
                  {/* Mobile THEIR TURN badge - positioned below to avoid X button */}
                  {currentAction?.side === 'RED' && !draftState.isFinished && (
                    <span className="lg:hidden mt-2 inline-block px-3 py-1 bg-[var(--red-3)] text-[var(--hextech-black)] text-[10px] font-bold rounded animate-pulse">
                      THEIR TURN
                    </span>
                  )}
                </div>
                
                {/* Team Logo with glow */}
                <div className="relative">
                  {redTeam?.logoUrl ? (
                    <div className="w-14 h-14 rounded-lg border-2 border-[var(--red-4)] bg-[var(--red-5)]/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(238,90,75,0.3)]">
                      <img 
                        src={redTeam.logoUrl} 
                        alt={redTeam.name} 
                        className="w-11 h-11 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[var(--red-3)] text-lg font-bold">${redTeam.nameShortened || 'RED'}</span>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg border-2 border-[var(--red-4)] bg-[var(--red-5)]/50 flex items-center justify-center shadow-[0_0_20px_rgba(238,90,75,0.3)]">
                      <span className="text-[var(--red-3)] text-lg font-bold">{redTeam?.nameShortened || 'RED'}</span>
                    </div>
                  )}
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-[var(--red-4)]/20 rounded-lg blur-md -z-10" />
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {/* Picks */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--red-4)]/50" />
                  <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--red-3)] tracking-[0.2em]">PICKS</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--red-4)]/50" />
                </div>
                
                <div className="flex flex-col gap-3">
                  {[0, 1, 2, 3, 4].map(i => {
                    const champId = draftState.redPicks[i];
                    const champ = champId ? CHAMPIONS.find(c => c.id === champId) : null;
                    const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
                  
                    return (
                      <div 
                        key={`red-p-${i}`} 
                        className={`relative h-[72px] overflow-hidden transition-all duration-500 group rounded-sm
                          ${champ 
                            ? 'hextech-border-red bg-gradient-to-l from-[var(--red-5)]/80 to-[var(--red-6)]/50' 
                            : 'border border-[var(--red-5)]/30 bg-[var(--hextech-black)]/50'
                          }
                          ${!champ && currentAction?.side === 'RED' && currentAction?.type === 'PICK' && draftState.redPicks.length === i
                            ? 'border-[var(--red-3)] pulse-glow text-[var(--red-3)]'
                            : ''
                          }`}
                      >
                        {champ ? (
                          <>
                            <div className="absolute inset-0">
                              <img src={champ.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-150" alt="" />
                              <div className="absolute inset-0 bg-gradient-to-l from-[var(--red-6)] via-transparent to-transparent" />
                            </div>
                            
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 border border-[var(--red-4)] overflow-hidden">
                              <img src={champ.imageUrl} className="w-full h-full object-cover" alt={champ.name} />
                              <div className="absolute inset-0 border border-white/10" />
                            </div>
                            
                            <div className="relative h-full pr-20 pl-3 flex flex-col justify-center items-end">
                              <span className="text-[8px] font-[var(--font-spiegel)] font-bold text-[var(--red-3)] uppercase tracking-wider">
                                {roles[i]}
                              </span>
                              <span className="font-[var(--font-beaufort)] text-sm font-bold text-[var(--gold-1)] truncate">
                                {champ.name}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {champ.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-[var(--red-5)]/50 text-[var(--red-1)] rounded-sm">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] text-[var(--muted-dark)] font-[var(--font-beaufort)] tracking-wider">{roles[i]}</span>
                              <span className="text-[10px] text-[var(--muted-dark)]/50 font-[var(--font-spiegel)] italic">Awaiting pick...</span>
                            </div>
                            <span className="text-[var(--muted-dark)] text-lg">{getRoleIcon(roles[i])}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bans */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--red-4)]/30" />
                    <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--muted)] tracking-[0.2em]">BANS</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--red-4)]/30" />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    {[0, 1, 2, 3, 4].map(i => {
                      const champId = draftState.redBans[i];
                      const champ = champId ? CHAMPIONS.find(c => c.id === champId) : null;
                      const isActive = currentAction?.side === 'RED' && currentAction?.type === 'BAN' && draftState.redBans.length === i;
                      
                      return (
                        <div 
                          key={`red-b-${i}`} 
                          className={`w-11 h-11 border relative overflow-hidden rounded-sm
                            ${champ 
                              ? 'border-[var(--red-5)]/50 bg-[var(--red-6)]/30' 
                              : 'border-[var(--gold-5)]/30 bg-[var(--hextech-black)]/50'
                            }
                            ${isActive ? 'border-[var(--gold-3)] pulse-glow text-[var(--gold-3)]' : ''}`}
                        >
                          {champ ? (
                            <>
                              <img src={champ.imageUrl} className="w-full h-full object-cover grayscale opacity-60" alt="" />
                              <div className="absolute inset-0 bg-[var(--red-5)]/30" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-0.5 bg-[var(--red-3)] rotate-45 absolute" />
                                <div className="w-full h-0.5 bg-[var(--red-3)] -rotate-45 absolute" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[var(--muted-dark)]/30 text-xs">✕</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ===== FOOTER - STICKY ===== */}
      <footer className="h-8 flex-shrink-0 border-t border-[var(--gold-5)]/30 bg-[var(--hextech-metal)]/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 text-[10px] font-[var(--font-spiegel)] text-[var(--muted-dark)] tracking-wider">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-3)]" />
            Region: LCS
          </span>
          <span>|</span>
          <span>Patch: 14.1</span>
          <span>|</span>
          <span>Data: GRID Esports</span>
        </div>
        <div className="text-[10px] font-[var(--font-beaufort)] text-[var(--gold-4)] tracking-wider">
          RIFT ORACLE © 2026 Cloud9 x JetBrains
        </div>
      </footer>
    </div>
  );
}
