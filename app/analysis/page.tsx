'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CHAMPIONS } from '@/lib/data';
import { DraftState, Champion } from '@/lib/types';
import { INITIAL_DRAFT_STATE } from '@/lib/draftLogic';
import { useDraftSync } from '@/hooks/useDraftSync';
import { useDraftConfig } from '@/lib/context/DraftConfigContext';
import { useTeamData, type TeamData, type MatchResult } from '@/hooks/useTeamData';
import { useDraftAnalysis, type DraftAnalysis } from '@/hooks/useDraftAnalysis';
import { useHeadToHead } from '@/hooks/useAnalytics';
import { 
  Shield, 
  Swords, 
  Users, 
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Zap,
  Eye,
  Crown,
  Sparkles,
  Brain,
  Lightbulb,
  Check,
  Info,
  Ban,
  Target,
  TrendingUp,
  Flame,
  Crosshair,
  Star,
  History,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Mountain,
  Droplet,
  Cloud,
  FlaskConical,
  Hexagon,
  Castle,
  CircleDot,
  Skull,
  X
} from 'lucide-react';

type AnalysisTab = 'draft' | 'history' | 'h2h' | 'prematch';

const getChampion = (id: string): Champion | undefined => CHAMPIONS.find(c => c.id === id);
const getChampionByName = (name: string): Champion | undefined => 
  CHAMPIONS.find(c => c.name.toLowerCase() === name.toLowerCase());

interface StarProps { size: number; left: number; top: number; duration: number; delay: number; opacity: number; }
const StarField = ({ size, left, top, duration, delay, opacity }: StarProps) => (
  <div 
    className="absolute rounded-full bg-[var(--gold-3)] star-drift"
    style={{ width: size, height: size, left: `${left}%`, top: `${top}%`, opacity, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
  />
);
const generateStars = (count: number): StarProps[] => Array.from({ length: count }, () => ({
  size: Math.random() * 2 + 0.5, left: Math.random() * 120, top: Math.random() * 100,
  duration: 20 + Math.random() * 30, delay: Math.random() * -30, opacity: Math.random() * 0.3 + 0.1,
}));

export default function AnalysisPage() {
  const [draftState, setDraftState] = useState<DraftState>(INITIAL_DRAFT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const [assistFor, setAssistFor] = useState<'BLUE' | 'RED'>('BLUE');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('draft');
  const stars = useMemo(() => generateStars(25), []);
  
  const { config, isHydrated } = useDraftConfig();
  
  const blueTeam = useTeamData({ teamId: config.blueTeam?.id || null, enabled: isHydrated && !!config.blueTeam?.id, autoLoad: true });
  const redTeam = useTeamData({ teamId: config.redTeam?.id || null, enabled: isHydrated && !!config.redTeam?.id, autoLoad: true });

  // Head-to-head data
  const headToHead = useHeadToHead({
    team1Id: config.blueTeam?.id || null,
    team2Id: config.redTeam?.id || null,
    enabled: isHydrated && !!(config.blueTeam?.id && config.redTeam?.id)
  });

  const draftAnalysis = useDraftAnalysis({
    draftState, assistForTeamId: assistFor === 'BLUE' ? config.blueTeam?.id || null : config.redTeam?.id || null,
    assistForSide: assistFor, blueTeamId: config.blueTeam?.id || null, redTeamId: config.redTeam?.id || null,
    enabled: isHydrated && (!!config.blueTeam?.id || !!config.redTeam?.id), debounceMs: 200
  });

  const analyticsLoading = blueTeam.loading || redTeam.loading;
  const refetch = useCallback(() => { blueTeam.refetch(); redTeam.refetch(); draftAnalysis.refetch(); headToHead.refetch(); }, [blueTeam, redTeam, draftAnalysis, headToHead]);

  const handleStateReceived = useCallback((state: DraftState) => { setDraftState(state); setIsConnected(true); }, []);
  const { getCurrentState } = useDraftSync({ source: 'analysis', onStateReceived: handleStateReceived, loadInitialState: true });
  useEffect(() => { const state = getCurrentState(); if (state) { setDraftState(state); setIsConnected(true); } }, [getCurrentState]);

  const assistedTeam = assistFor === 'BLUE' ? config.blueTeam : config.redTeam;
  const assistedTeamData = assistFor === 'BLUE' ? blueTeam.data : redTeam.data;
  const enemyTeam = assistFor === 'BLUE' ? config.redTeam : config.blueTeam;
  const enemyTeamData = assistFor === 'BLUE' ? redTeam.data : blueTeam.data;
  const ourPicks = assistFor === 'BLUE' ? draftState.bluePicks : draftState.redPicks;
  const ourBans = assistFor === 'BLUE' ? draftState.blueBans : draftState.redBans;
  const enemyPicks = assistFor === 'BLUE' ? draftState.redPicks : draftState.bluePicks;
  const enemyBans = assistFor === 'BLUE' ? draftState.redBans : draftState.blueBans;
  const analysis = draftAnalysis.analysis;
  const isOurTurn = analysis?.currentSide === assistFor;

  return (
    <div className="min-h-screen bg-[var(--hextech-black)] text-[var(--gold-1)] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold-3)] opacity-[0.03] blur-[150px] rounded-full" />
        <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[600px] blur-[100px] rounded-full -translate-x-1/2 transition-opacity duration-700 ${assistFor === 'BLUE' ? 'bg-[var(--blue-4)] opacity-[0.1]' : 'bg-[var(--blue-4)] opacity-[0.03]'}`} />
        <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[600px] blur-[100px] rounded-full translate-x-1/2 transition-opacity duration-700 ${assistFor === 'RED' ? 'bg-[var(--red-4)] opacity-[0.1]' : 'bg-[var(--red-4)] opacity-[0.03]'}`} />
        <div className="absolute inset-0">{stars.map((star, i) => <StarField key={i} {...star} />)}</div>
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: `linear-gradient(var(--gold-4) 1px, transparent 1px), linear-gradient(90deg, var(--gold-4) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      {/* Header */}
      <header className="relative h-16 md:h-20 flex-shrink-0 border-b border-[var(--gold-5)] bg-gradient-to-b from-[var(--hextech-metal)] to-transparent z-20">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-3)] to-transparent" />
        <div className="h-full max-w-[1800px] mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-[var(--gold-3)] rotate-45 bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent" />
                <div className="absolute inset-1 border border-[var(--gold-4)] rotate-45" />
                <Brain className="relative w-5 h-5 md:w-6 md:h-6 text-[var(--gold-2)]" />
              </div>
              <div className="absolute inset-0 blur-xl bg-[var(--gold-3)]/20 -z-10" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-[var(--font-beaufort)] font-bold tracking-wider">
                <span className="text-gold-glow">RIFT</span>
                <span className="text-[var(--gold-1)] ml-2">ORACLE</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[var(--blue-2)] blink' : 'bg-[var(--red-3)]'}`} />
                <span className="text-[9px] md:text-[10px] text-[var(--muted)] font-[var(--font-spiegel)] tracking-[0.15em] uppercase">
                  {isConnected ? 'LIVE SYNC' : 'WAITING FOR DRAFT'}
                </span>
              </div>
            </div>
          </div>

          {/* Team Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider mr-2 hidden md:block">Assist:</span>
            <div className="hextech-border overflow-hidden flex">
              <button onClick={() => setAssistFor('BLUE')} className={`px-3 md:px-5 py-2 text-[10px] md:text-[11px] font-[var(--font-beaufort)] font-bold tracking-wider transition-all flex items-center gap-2 ${assistFor === 'BLUE' ? 'bg-[var(--blue-5)] text-[var(--blue-1)]' : 'text-[var(--blue-3)] hover:bg-[var(--blue-6)]/50'}`}>
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{config.blueTeam?.nameShortened || 'BLUE'}</span>
              </button>
              <div className="w-px bg-[var(--gold-5)]" />
              <button onClick={() => setAssistFor('RED')} className={`px-3 md:px-5 py-2 text-[10px] md:text-[11px] font-[var(--font-beaufort)] font-bold tracking-wider transition-all flex items-center gap-2 ${assistFor === 'RED' ? 'bg-[var(--red-6)] text-[var(--red-1)]' : 'text-[var(--red-3)] hover:bg-[var(--red-6)]/50'}`}>
                <Swords className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{config.redTeam?.nameShortened || 'RED'}</span>
              </button>
            </div>
          </div>
          
          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button onClick={refetch} disabled={analyticsLoading || draftAnalysis.loading} className="hextech-button flex items-center gap-2 px-3 py-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${(analyticsLoading || draftAnalysis.loading) ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-[10px]">REFRESH</span>
            </button>
            <div className="hextech-border px-3 py-1.5 hidden lg:flex items-center gap-2">
              <span className="text-lg">☁️</span>
              <span className="text-[9px] text-[var(--gold-2)] font-bold tracking-wider">C9 x JETBRAINS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto z-10">
        {!isHydrated && (
          <div className="flex items-center justify-center py-20 gap-3 text-[var(--gold-3)]">
            <Loader2 className="w-8 h-8 animate-spin" /><span className="text-lg font-[var(--font-beaufort)]">Initializing...</span>
          </div>
        )}
        
        {isHydrated && (!config.blueTeam || !config.redTeam) && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="hextech-border p-8 max-w-lg text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-2 border-[var(--gold-3)] rotate-45 flex items-center justify-center bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent">
                <Users className="w-10 h-10 rotate-[-45deg] text-[var(--gold-2)]" />
              </div>
              <h2 className="text-2xl font-[var(--font-beaufort)] font-bold text-gold-glow mb-3">Teams Required</h2>
              <p className="text-sm text-[var(--muted)] mb-4">Configure both Blue and Red teams to activate Rift Oracle intelligence.</p>
              <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                <div className={`flex items-center gap-2 px-3 py-2 rounded ${config.blueTeam ? 'bg-[var(--blue-5)]/30 border border-[var(--blue-3)]/50' : 'bg-[var(--hextech-metal)]/30 border border-[var(--muted-dark)]'}`}>
                  <Shield className={`w-4 h-4 ${config.blueTeam ? 'text-[var(--blue-2)]' : 'text-[var(--muted)]'}`} />
                  <span className={config.blueTeam ? 'text-[var(--blue-2)]' : 'text-[var(--muted)]'}>
                    {config.blueTeam ? config.blueTeam.nameShortened || config.blueTeam.name : 'Not Selected'}
                  </span>
                  {config.blueTeam && <Check className="w-4 h-4 text-green-400" />}
                </div>
                <span className="text-[var(--muted)]">vs</span>
                <div className={`flex items-center gap-2 px-3 py-2 rounded ${config.redTeam ? 'bg-[var(--red-5)]/30 border border-[var(--red-4)]/50' : 'bg-[var(--hextech-metal)]/30 border border-[var(--muted-dark)]'}`}>
                  <Swords className={`w-4 h-4 ${config.redTeam ? 'text-[var(--red-3)]' : 'text-[var(--muted)]'}`} />
                  <span className={config.redTeam ? 'text-[var(--red-3)]' : 'text-[var(--muted)]'}>
                    {config.redTeam ? config.redTeam.nameShortened || config.redTeam.name : 'Not Selected'}
                  </span>
                  {config.redTeam && <Check className="w-4 h-4 text-green-400" />}
                </div>
              </div>
              <a href="/setup" className="hextech-button inline-flex items-center gap-2 px-6 py-3">
                <Target className="w-4 h-4" /><span className="font-bold tracking-wider">GO TO SETUP</span>
              </a>
            </div>
          </div>
        )}

        {isHydrated && config.blueTeam && config.redTeam && (
          <div className="max-w-[1800px] mx-auto p-4 md:p-6">
            {/* Assist Banner */}
            <div className={`relative mb-6 ${assistFor === 'BLUE' ? 'hextech-border-blue' : 'hextech-border-red'} overflow-hidden`}>
              <div className={`absolute inset-0 ${assistFor === 'BLUE' ? 'bg-gradient-to-r from-[var(--blue-6)] via-[var(--blue-7)]/80 to-transparent' : 'bg-gradient-to-r from-[var(--red-6)] via-[var(--hextech-black)]/80 to-transparent'}`} />
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[var(--gold-4)]/30" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[var(--gold-4)]/30" />
              
              <div className="relative p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  {assistedTeam?.logoUrl ? (
                    <div className="relative w-16 h-16 md:w-20 md:h-20">
                      <img src={assistedTeam.logoUrl} alt={assistedTeam.name} className="w-full h-full object-contain" />
                      <div className={`absolute inset-0 blur-xl ${assistFor === 'BLUE' ? 'bg-[var(--blue-3)]' : 'bg-[var(--red-4)]'} opacity-20 -z-10`} />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${assistFor === 'BLUE' ? 'hextech-border-blue bg-[var(--blue-6)]/50' : 'hextech-border-red bg-[var(--red-6)]/50'}`}>
                      {assistFor === 'BLUE' ? <Shield className="w-10 h-10 text-[var(--blue-2)]" /> : <Swords className="w-10 h-10 text-[var(--red-3)]" />}
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[var(--gold-3)]" />AI ASSISTANT FOR
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-[var(--font-beaufort)] font-black tracking-wide ${assistFor === 'BLUE' ? 'text-blue-glow' : 'text-red-glow'}`}>
                      {assistedTeam?.name || (assistFor === 'BLUE' ? 'Blue Side' : 'Red Side')}
                    </h2>
                  </div>
                </div>
                
                {analysis && analysis.winProbability && typeof analysis.winProbability.ourTeam === 'number' && (
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="text-center">
                      <div className={`text-4xl md:text-5xl font-[var(--font-beaufort)] font-black tabular-nums ${analysis.winProbability.ourTeam >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
                        {analysis.winProbability.ourTeam.toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Win Probability</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-40 h-2 bg-[var(--hextech-black)] border border-[var(--gold-5)]/30 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 h-full transition-all duration-700 ${assistFor === 'BLUE' ? 'bg-[var(--blue-3)]' : 'bg-[var(--red-4)]'}`} style={{ width: `${analysis.winProbability.ourTeam}%` }} />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--gold-4)] -translate-x-1/2" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-[var(--font-beaufort)] font-black text-[var(--gold-2)] tabular-nums">
                    {draftState.currentTurn}<span className="text-[var(--gold-5)]">/20</span>
                  </div>
                  <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Draft Turn</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="mb-6 hextech-border overflow-hidden">
              <div className="flex bg-[var(--hextech-metal)]/30">
                {[
                  { id: 'draft' as AnalysisTab, label: 'LIVE DRAFT', icon: Zap, color: 'gold' },
                  { id: 'prematch' as AnalysisTab, label: `SCOUT ${enemyTeam?.nameShortened || 'ENEMY'}`, icon: Eye, color: 'red' },
                  { id: 'history' as AnalysisTab, label: `${assistedTeam?.nameShortened || 'TEAM'} STATS`, icon: History, color: assistFor === 'BLUE' ? 'blue' : 'red' },
                  { id: 'h2h' as AnalysisTab, label: 'HEAD TO HEAD', icon: Trophy, color: 'gold' },
                ].map((tab, idx) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-4 transition-all duration-300 group ${
                      idx > 0 ? 'border-l border-[var(--gold-5)]/20' : ''
                    } ${
                      activeTab === tab.id
                        ? tab.color === 'blue' 
                          ? 'bg-[var(--blue-6)]/50 text-[var(--blue-1)]' 
                          : tab.color === 'red'
                            ? 'bg-[var(--red-6)]/50 text-[var(--red-1)]'
                            : 'bg-[var(--gold-5)]/20 text-[var(--gold-1)]'
                        : 'text-[var(--muted)] hover:text-[var(--gold-1)] hover:bg-[var(--gold-5)]/10'
                    }`}
                  >
                    {/* Active indicator line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-300 ${
                      activeTab === tab.id 
                        ? tab.color === 'blue' 
                          ? 'bg-gradient-to-r from-transparent via-[var(--blue-2)] to-transparent opacity-100' 
                          : tab.color === 'red'
                            ? 'bg-gradient-to-r from-transparent via-[var(--red-3)] to-transparent opacity-100'
                            : 'bg-gradient-to-r from-transparent via-[var(--gold-2)] to-transparent opacity-100'
                        : 'opacity-0'
                    }`} />
                    {/* Top glow for active */}
                    <div className={`absolute top-0 left-1/4 right-1/4 h-px transition-opacity duration-300 ${
                      activeTab === tab.id 
                        ? tab.color === 'blue' 
                          ? 'bg-[var(--blue-2)] opacity-50' 
                          : tab.color === 'red'
                            ? 'bg-[var(--red-3)] opacity-50'
                            : 'bg-[var(--gold-2)] opacity-50'
                        : 'opacity-0'
                    }`} />
                    <tab.icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="text-[10px] md:text-[11px] font-[var(--font-beaufort)] font-bold tracking-wider">{tab.label}</span>
                    {tab.id === 'draft' && isConnected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--blue-2)] blink ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Tab Content */}
            {activeTab === 'draft' && (
              <>
            {/* Phase Indicator */}
            {analysis && !draftState.isFinished && (
              <div className={`mb-6 p-4 transition-all duration-300 ${isOurTurn ? (assistFor === 'BLUE' ? 'hextech-border-blue bg-[var(--blue-6)]/30' : 'hextech-border-red bg-[var(--red-6)]/30') : 'hextech-border bg-[var(--hextech-metal)]/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center ${isOurTurn ? (assistFor === 'BLUE' ? 'bg-[var(--blue-4)]' : 'bg-[var(--red-5)]') : 'bg-[var(--hextech-metal)]'}`}>
                      {analysis.currentAction === 'BAN' ? <Ban className="w-5 h-5 text-white" /> : <Crosshair className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{analysis.phase}</div>
                      <div className={`text-xl font-[var(--font-beaufort)] font-bold ${analysis.currentSide === 'BLUE' ? 'text-blue-glow' : 'text-red-glow'}`}>
                        {analysis.currentSide} {analysis.currentAction}
                      </div>
                    </div>
                  </div>
                  {isOurTurn ? (
                    <div className={`px-5 py-2 font-[var(--font-beaufort)] font-bold text-sm tracking-wider ${assistFor === 'BLUE' ? 'bg-[var(--blue-3)] text-[var(--hextech-black)]' : 'bg-[var(--red-4)] text-white'}`}>
                      ⚡ YOUR TURN
                    </div>
                  ) : (
                    <div className="px-5 py-2 text-[var(--muted)] text-sm font-[var(--font-beaufort)] border border-[var(--gold-5)]/30">
                      Waiting for {analysis.currentSide === 'BLUE' ? config.blueTeam?.nameShortened || 'Blue' : config.redTeam?.nameShortened || 'Red'}...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3"><CompositionPanel title="OUR DRAFT" picks={ourPicks} bans={ourBans} side={assistFor} teamData={assistedTeamData} teamName={assistedTeam?.nameShortened || assistedTeam?.name} composition={analysis?.compositionAnalysis.ourTeam} /></div>
              <div className="lg:col-span-6 space-y-6">
                {isOurTurn && analysis && analysis.recommendations.length > 0 && <RecommendationsPanel recommendations={analysis.recommendations} actionType={analysis.currentAction} side={assistFor} />}
                {!isOurTurn && !draftState.isFinished && analysis && analysis.enemyPredictions.length > 0 && <PredictionsPanel predictions={analysis.enemyPredictions} enemyTeam={enemyTeam} actionType={analysis.currentAction} />}
                {analysis && analysis.warnings.length > 0 && <WarningsPanel warnings={analysis.warnings} />}
                {draftAnalysis.loading && (
                  <div className="hextech-border p-12 flex flex-col items-center justify-center gap-4">
                    <Brain className="w-12 h-12 text-[var(--gold-3)] animate-pulse" />
                    <span className="text-[var(--gold-3)] font-[var(--font-beaufort)] tracking-wider">Analyzing draft state...</span>
                  </div>
                )}
                {draftState.isFinished && <DraftCompletePanel analysis={analysis} assistFor={assistFor} assistedTeam={assistedTeam} draftState={draftState} blueTeam={config.blueTeam} redTeam={config.redTeam} />}
                {!draftState.isFinished && !draftAnalysis.loading && !analysis && (
                  <div className="hextech-border p-12 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-[var(--gold-4)] opacity-50" />
                    <h3 className="text-lg font-[var(--font-beaufort)] text-[var(--gold-3)] mb-2">Ready for Analysis</h3>
                    <p className="text-sm text-[var(--muted)]">Start the draft in the Draft page to see AI recommendations.</p>
                  </div>
                )}
              </div>
              <div className="lg:col-span-3"><CompositionPanel title="ENEMY DRAFT" picks={enemyPicks} bans={enemyBans} side={assistFor === 'BLUE' ? 'RED' : 'BLUE'} teamData={enemyTeamData} teamName={enemyTeam?.nameShortened || enemyTeam?.name} composition={analysis?.compositionAnalysis.enemyTeam} isEnemy /></div>
            </div>

            {/* Game Plan (Full Width) */}
            {analysis?.strategyInsights && (
              <div className="mt-6">
                <GamePlanPanel
                  insights={analysis.strategyInsights}
                  ourTeam={assistedTeam}
                  enemyTeam={enemyTeam}
                  side={assistFor}
                />
              </div>
            )}
              </>
            )}

            {activeTab === 'history' && (
              <TeamHistoryTab 
                teamData={assistedTeamData}
                teamConfig={assistedTeam}
                side={assistFor}
                loading={assistFor === 'BLUE' ? blueTeam.loading : redTeam.loading}
              />
            )}

            {activeTab === 'h2h' && (
              <HeadToHeadTab
                headToHead={headToHead.data}
                blueTeam={config.blueTeam}
                redTeam={config.redTeam}
                loading={headToHead.loading}
              />
            )}

            {activeTab === 'prematch' && (
              <PreMatchInfoTab
                teamData={enemyTeamData}
                teamConfig={enemyTeam}
                loading={assistFor === 'BLUE' ? redTeam.loading : blueTeam.loading}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative h-10 flex-shrink-0 border-t border-[var(--gold-5)]/30 bg-gradient-to-t from-[var(--hextech-metal)]/50 to-transparent z-10 px-6 flex items-center justify-between">
        <div className="text-[9px] text-[var(--muted-dark)] flex items-center gap-2">
          <Brain className="w-3 h-3" />RIFT ORACLE • Powered by <span className="text-[var(--gold-4)]">GRID Esports Data</span>
        </div>
        <div className="text-[9px] text-[var(--gold-4)]">Cloud9 x JetBrains Hackathon 2026</div>
      </footer>
    </div>
  );
}

function WarningsPanel({ warnings }: { warnings: DraftAnalysis['warnings'] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="space-y-2">
      {warnings.map((warning, i) => (
        <div key={i} className={`p-4 flex items-start gap-4 ${warning.severity === 'critical' ? 'hextech-border-red bg-[var(--red-6)]/40' : warning.severity === 'warning' ? 'hextech-border bg-[var(--gold-5)]/20' : 'hextech-border-blue bg-[var(--blue-6)]/30'}`}>
          <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${warning.severity === 'critical' ? 'bg-[var(--red-5)]' : warning.severity === 'warning' ? 'bg-[var(--gold-4)]' : 'bg-[var(--blue-4)]'}`}>
            {warning.severity === 'critical' || warning.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-white" /> : <Info className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <div className={`font-[var(--font-beaufort)] font-bold ${warning.severity === 'critical' ? 'text-[var(--red-3)]' : 'text-[var(--gold-1)]'}`}>{warning.message}</div>
            {warning.suggestion && <div className="text-xs text-[var(--muted)] mt-1 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-[var(--gold-4)]" />{warning.suggestion}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function GamePlanPanel({
  insights,
  ourTeam,
  enemyTeam,
  side,
}: {
  insights: NonNullable<DraftAnalysis['strategyInsights']>;
  ourTeam: { name: string; nameShortened?: string; logoUrl?: string } | null;
  enemyTeam: { name: string; nameShortened?: string; logoUrl?: string } | null;
  side: 'BLUE' | 'RED';
}) {
  const edge = insights.earlyGame.edge;
  const edgeColor = edge >= 12 ? 'text-[var(--blue-2)]' : edge <= -12 ? 'text-[var(--red-3)]' : 'text-[var(--gold-2)]';
  const borderClass = side === 'BLUE' ? 'hextech-border-blue' : 'hextech-border-red';
  const titleTeam = ourTeam?.nameShortened || ourTeam?.name || 'Our team';
  const titleEnemy = enemyTeam?.nameShortened || enemyTeam?.name || 'Enemy';

  return (
    <div className={`${borderClass} overflow-hidden`}>
      <div className={`px-5 py-3 border-b ${side === 'BLUE' ? 'border-[var(--blue-4)]/30 bg-[var(--blue-6)]/20' : 'border-[var(--red-4)]/30 bg-[var(--red-6)]/20'}`}>
        <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--gold-3)]" />GAME PLAN
          <span className="text-[9px] text-[var(--muted)] font-[var(--font-spiegel)] tracking-[0.15em] uppercase ml-2">{titleTeam} vs {titleEnemy}</span>
        </h3>
      </div>

      <div className="p-4 bg-gradient-to-b from-transparent to-[var(--hextech-black)]/50">
        {/* Early Edge */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[var(--gold-3)]" />
              <div className="text-xs font-[var(--font-beaufort)] font-bold tracking-wider text-[var(--gold-2)]">EARLY GAME</div>
              <div className={`text-[10px] font-[var(--font-spiegel)] tracking-[0.15em] uppercase ${edgeColor}`}>{insights.earlyGame.label}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[var(--muted)] uppercase tracking-[0.2em]">EDGE</span>
              <div className={`text-sm font-[var(--font-beaufort)] font-black tabular-nums ${edgeColor}`}>{edge.toFixed(0)}</div>
            </div>
          </div>

          <div className="mt-2 h-2 bg-[var(--hextech-black)] border border-[var(--gold-5)]/30 relative overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--gold-4)]/80" />
            <div
              className={`absolute top-0 bottom-0 transition-all duration-700 ${edge >= 0 ? 'bg-[var(--blue-3)]' : 'bg-[var(--red-4)]'}`}
              style={{
                left: edge >= 0 ? '50%' : `${50 + edge / 2}%`,
                width: `${Math.abs(edge) / 2}%`,
              }}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {insights.earlyGame.details.map((d) => (
              <div key={d.key} className="hextech-border p-3 bg-[var(--hextech-metal)]/20">
                <div className="text-[9px] text-[var(--muted)] uppercase tracking-[0.2em]">{d.key}</div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-[var(--blue-2)] font-[var(--font-beaufort)] font-bold tabular-nums">{d.our.toFixed(0)}{d.unit}</span>
                  <span className="text-[var(--muted)]">vs</span>
                  <span className="text-[var(--red-3)] font-[var(--font-beaufort)] font-bold tabular-nums">{d.enemy.toFixed(0)}{d.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {insights.earlyGame.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              {insights.earlyGame.recommendations.slice(0, 2).map((r, i) => (
                <div key={i} className="text-xs text-[var(--gold-1)] flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--gold-3)] flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objectives + Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="hextech-border p-4 bg-[var(--hextech-metal)]/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-[var(--gold-3)]" />
              <div className="text-xs font-[var(--font-beaufort)] font-bold tracking-wider text-[var(--gold-2)]">OBJECTIVES</div>
              <div className="ml-auto text-[10px] text-[var(--muted)] uppercase tracking-[0.2em]">{insights.objectives.focus}</div>
            </div>
            <div className="space-y-2">
              {insights.objectives.details.map((d) => (
                <div key={d.key} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)]">{d.key}</span>
                  <span className="tabular-nums">
                    <span className="text-[var(--blue-2)] font-[var(--font-beaufort)] font-bold">{d.our.toFixed(1)}</span>
                    <span className="text-[var(--muted)] mx-1">/</span>
                    <span className="text-[var(--red-3)] font-[var(--font-beaufort)] font-bold">{d.enemy.toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>
            {insights.objectives.recommendations.length > 0 && (
              <div className="mt-3 text-xs text-[var(--gold-1)] flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-[var(--gold-3)] flex-shrink-0 mt-0.5" />
                <span>{insights.objectives.recommendations[0]}</span>
              </div>
            )}
          </div>

          <div className="hextech-border p-4 bg-[var(--hextech-metal)]/20">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[var(--gold-3)]" />
              <div className="text-xs font-[var(--font-beaufort)] font-bold tracking-wider text-[var(--gold-2)]">TEMPO</div>
              <div className="ml-auto text-[10px] text-[var(--muted)] uppercase tracking-[0.2em]">{insights.tempo.style}</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Avg Duration</span>
                <span className="tabular-nums">
                  <span className="text-[var(--blue-2)] font-[var(--font-beaufort)] font-bold">{insights.tempo.ourAvgDuration.toFixed(1)}m</span>
                  <span className="text-[var(--muted)] mx-1">vs</span>
                  <span className="text-[var(--red-3)] font-[var(--font-beaufort)] font-bold">{insights.tempo.enemyAvgDuration.toFixed(1)}m</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Avg Gold Diff</span>
                <span className="tabular-nums">
                  <span className="text-[var(--blue-2)] font-[var(--font-beaufort)] font-bold">{insights.macroEdge.avgGoldDiff.our.toFixed(0)}</span>
                  <span className="text-[var(--muted)] mx-1">/</span>
                  <span className="text-[var(--red-3)] font-[var(--font-beaufort)] font-bold">{insights.macroEdge.avgGoldDiff.enemy.toFixed(0)}</span>
                </span>
              </div>
            </div>
            {insights.tempo.recommendations.length > 0 && (
              <div className="mt-3 text-xs text-[var(--gold-1)] flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--gold-3)] flex-shrink-0 mt-0.5" />
                <span>{insights.tempo.recommendations[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsPanel({ recommendations, actionType, side }: { recommendations: DraftAnalysis['recommendations']; actionType: 'PICK' | 'BAN'; side: 'BLUE' | 'RED'; }) {
  const isBan = actionType === 'BAN';
  return (
    <div className={`${isBan ? 'hextech-border-red' : side === 'BLUE' ? 'hextech-border-blue' : 'hextech-border-red'} overflow-hidden`}>
      <div className={`px-5 py-3 border-b ${isBan ? 'border-[var(--red-5)]/30 bg-[var(--red-6)]/30' : side === 'BLUE' ? 'border-[var(--blue-4)]/30 bg-[var(--blue-6)]/30' : 'border-[var(--red-4)]/30 bg-[var(--red-6)]/30'}`}>
        <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
          {isBan ? <Ban className="w-4 h-4 text-[var(--red-3)]" /> : <Sparkles className="w-4 h-4" />}RECOMMENDED {actionType}S
        </h3>
      </div>
      <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-[var(--hextech-black)]/50">
        {recommendations.slice(0, 5).map((rec, i) => {
          const champ = getChampionByName(rec.championName);
          const isTop = i === 0;
          return (
            <div key={rec.championId} className={`relative p-4 transition-all hover:scale-[1.005] ${isTop ? 'hextech-border bg-gradient-to-r from-[var(--gold-5)]/10 to-transparent' : 'border border-[var(--gold-5)]/20 bg-[var(--hextech-black)]/50 hover:border-[var(--gold-4)]/40'}`}>
              <div className={`absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${isTop ? 'bg-[var(--gold-3)] text-[var(--hextech-black)]' : 'bg-[var(--hextech-metal)] text-[var(--gold-3)] border border-[var(--gold-5)]'}`}>{i + 1}</div>
              <div className="flex items-start gap-4 pl-4">
                <div className="relative flex-shrink-0">
                  {champ ? <img src={champ.imageUrl} alt={rec.championName} className={`w-16 h-16 border-2 ${isBan ? 'border-[var(--red-4)] grayscale-[30%]' : 'border-[var(--gold-4)]'}`} /> : <div className="w-16 h-16 bg-[var(--hextech-metal)] border-2 border-[var(--gold-4)] flex items-center justify-center text-2xl">?</div>}
                  {isTop && <Star className="absolute -top-1 -right-1 w-5 h-5 text-[var(--gold-2)] fill-[var(--gold-3)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">{rec.championName}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-4 h-4 ${rec.predictedWinRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`} />
                      <span className={`text-xl font-[var(--font-beaufort)] font-black tabular-nums ${rec.predictedWinRate >= 55 ? 'text-[var(--blue-2)]' : rec.predictedWinRate >= 50 ? 'text-[var(--gold-2)]' : 'text-[var(--red-3)]'}`}>{rec.predictedWinRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {rec.tags.map((tag, tagIndex) => (
                      <span key={`${tag}-${tagIndex}`} className={`text-[9px] px-2 py-0.5 font-bold tracking-wider ${tag === 'SIGNATURE' ? 'bg-[var(--gold-4)] text-[var(--hextech-black)]' : tag === 'HIGH_WINRATE' ? 'bg-[var(--blue-4)] text-white' : tag === 'COUNTER' ? 'bg-[var(--red-5)] text-white' : tag === 'SYNERGY' ? 'bg-green-600 text-white' : tag === 'DENY' ? 'bg-[var(--red-4)] text-white' : tag === 'FLEX' ? 'bg-purple-500 text-white' : 'bg-[var(--hextech-metal)] text-[var(--gold-3)]'}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, j) => (
                      <div key={j} className="text-[11px] text-[var(--muted)] flex items-start gap-1.5"><Check className="w-3 h-3 text-[var(--gold-4)] flex-shrink-0 mt-0.5" /><span>{reason}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PredictionsPanel({ predictions, enemyTeam, actionType }: { predictions: DraftAnalysis['enemyPredictions']; enemyTeam: { name: string; nameShortened?: string; logoUrl?: string } | null; actionType: 'PICK' | 'BAN'; }) {
  return (
    <div className="hextech-border-red overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--red-5)]/30 bg-[var(--red-6)]/20">
        <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-red-glow tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4" />PREDICTED {enemyTeam?.nameShortened || 'ENEMY'} {actionType}S
        </h3>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-gradient-to-b from-transparent to-[var(--hextech-black)]/50">
        {predictions.slice(0, 5).map((pred) => {
          const champ = getChampionByName(pred.championName);
          return (
            <div key={pred.championId} className="p-3 bg-[var(--hextech-black)]/50 border border-[var(--red-5)]/30 text-center hover:border-[var(--red-4)] transition-colors">
              {champ ? <img src={champ.imageUrl} alt={pred.championName} className="w-14 h-14 mx-auto border border-[var(--red-4)]" /> : <div className="w-14 h-14 mx-auto bg-[var(--hextech-metal)] border border-[var(--red-4)]" />}
              <div className="mt-2 text-xs font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{pred.championName}</div>
              <div className="text-xl font-[var(--font-beaufort)] font-bold text-[var(--red-3)]">{pred.probability.toFixed(0)}%</div>
              <div className="text-[8px] text-[var(--muted)] mt-1 line-clamp-2 h-6">{pred.reasons[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompositionPanel({ title, picks, bans, side, teamData, teamName, composition, isEnemy = false }: { title: string; picks: string[]; bans: string[]; side: 'BLUE' | 'RED'; teamData: TeamData | null; teamName?: string; composition?: DraftAnalysis['compositionAnalysis']['ourTeam']; isEnemy?: boolean; }) {
  const isBlue = side === 'BLUE';
  const borderClass = isBlue ? 'hextech-border-blue' : 'hextech-border-red';
  const bgClass = isBlue ? 'bg-[var(--blue-6)]/30' : 'bg-[var(--red-6)]/30';
  const glowClass = isBlue ? 'text-blue-glow' : 'text-red-glow';
  const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const roleColors: Record<string, string> = {
    TOP: 'text-[var(--blue-2)]',
    JUNGLE: 'text-green-400',
    MID: 'text-[var(--gold-3)]',
    ADC: 'text-[var(--red-3)]',
    SUPPORT: 'text-purple-400'
  };

  return (
    <div className={`${borderClass} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isBlue ? 'border-[var(--blue-4)]/30' : 'border-[var(--red-4)]/30'} ${bgClass}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-[var(--font-beaufort)] font-bold ${glowClass} tracking-wider`}>{title}</h3>
          {teamName && <span className="text-[10px] text-[var(--muted)]">{teamName}</span>}
        </div>
      </div>
      
      {/* PICKS Section - styled like draft page */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-px flex-1 bg-gradient-to-r ${isBlue ? 'from-[var(--blue-3)]/50' : 'from-[var(--red-4)]/50'} to-transparent`} />
          <span className={`text-[9px] font-[var(--font-beaufort)] font-bold ${isBlue ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'} tracking-[0.2em]`}>PICKS</span>
          <div className={`h-px flex-1 bg-gradient-to-l ${isBlue ? 'from-[var(--blue-3)]/50' : 'from-[var(--red-4)]/50'} to-transparent`} />
        </div>
        
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map(i => {
            const champId = picks[i];
            const champ = champId ? getChampion(champId) : null;
            const teamPick = champ && teamData?.mostPicked?.find(p => p.name.toLowerCase() === champ.name.toLowerCase());
            const role = roles[i];
            
            return (
              <div 
                key={`pick-${i}`} 
                className={`relative h-[68px] overflow-hidden transition-all duration-500 rounded-sm
                  ${champ 
                    ? isBlue 
                      ? 'hextech-border-blue bg-gradient-to-r from-[var(--blue-5)]/80 to-[var(--blue-6)]/50' 
                      : 'hextech-border-red bg-gradient-to-r from-[var(--red-5)]/80 to-[var(--red-6)]/50'
                    : `border border-dashed ${isBlue ? 'border-[var(--blue-4)]/30' : 'border-[var(--red-4)]/30'} bg-[var(--hextech-black)]/50`
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
                      <div className={`absolute inset-0 bg-gradient-to-r ${isBlue ? 'from-[var(--blue-6)]' : 'from-[var(--red-6)]'} via-transparent to-transparent`} />
                    </div>
                    
                    {/* Champion Portrait */}
                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 border ${isBlue ? 'border-[var(--blue-3)]' : 'border-[var(--red-4)]'} overflow-hidden`}>
                      <img src={champ.imageUrl} className="w-full h-full object-cover" alt={champ.name} />
                      <div className="absolute inset-0 border border-white/10" />
                    </div>
                    
                    {/* Info */}
                    <div className="relative h-full pl-[60px] pr-2 flex flex-col justify-center">
                      <span className={`text-[8px] font-[var(--font-spiegel)] font-bold ${roleColors[role]} uppercase tracking-wider`}>
                        {role}
                      </span>
                      <span className="font-[var(--font-beaufort)] text-sm font-bold text-[var(--gold-1)] truncate">
                        {champ.name}
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        {champ.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={`${tag}-${tagIndex}`} className={`text-[7px] px-1 py-0.5 ${isBlue ? 'bg-[var(--blue-4)]/50 text-[var(--blue-1)]' : 'bg-[var(--red-5)]/50 text-[var(--red-1)]'} rounded-sm`}>
                            {tag}
                          </span>
                        ))}
                        {teamPick && teamPick.count >= 3 && (
                          <span className="text-[7px] px-1 py-0.5 bg-[var(--gold-5)]/50 text-[var(--gold-2)] rounded-sm flex items-center gap-0.5">
                            <Flame className="w-2 h-2" />{teamPick.count}G • {teamPick.winRate.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center gap-2">
                    <span className="text-[var(--muted-dark)] text-sm opacity-50">
                      {role === 'TOP' ? '⚔️' : role === 'JUNGLE' ? '🌲' : role === 'MID' ? '🎯' : role === 'ADC' ? '🏹' : '🛡️'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-[var(--muted-dark)] font-[var(--font-beaufort)] tracking-wider">{role}</span>
                      <span className="text-[8px] text-[var(--muted-dark)]/50 font-[var(--font-spiegel)] italic">Awaiting pick...</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BANS Section - styled like draft page */}
      <div className={`px-3 py-3 border-t ${isBlue ? 'border-[var(--blue-4)]/20' : 'border-[var(--red-4)]/20'}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--red-4)]/30 to-transparent" />
          <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--muted)] tracking-[0.2em]">BANS</span>
          <div className="h-px flex-1 bg-gradient-to-l from-[var(--red-4)]/30 to-transparent" />
        </div>
        
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2, 3, 4].map(i => {
            const champId = bans[i];
            const champ = champId ? getChampion(champId) : null;
            
            return (
              <div 
                key={`ban-${i}`} 
                className={`w-10 h-10 border relative overflow-hidden rounded-sm
                  ${champ 
                    ? 'border-[var(--red-5)]/50 bg-[var(--red-6)]/30' 
                    : 'border-[var(--gold-5)]/30 bg-[var(--hextech-black)]/50 border-dashed'
                  }`}
              >
                {champ ? (
                  <>
                    <img src={champ.imageUrl} className="w-full h-full object-cover grayscale opacity-60" alt="" />
                    <div className="absolute inset-0 bg-[var(--red-5)]/30" />
                    {/* Ban X - same style as draft */}
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

      {/* COMP ANALYSIS Section */}
      {composition && picks.length >= 2 && (
        <div className={`px-3 py-3 border-t ${isBlue ? 'border-[var(--blue-4)]/20' : 'border-[var(--red-4)]/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--gold-4)]/30 to-transparent" />
            <span className="text-[9px] font-[var(--font-beaufort)] font-bold text-[var(--muted)] tracking-[0.2em]">COMP ANALYSIS</span>
            <div className="h-px flex-1 bg-gradient-to-l from-[var(--gold-4)]/30 to-transparent" />
          </div>
          
          <div className="flex gap-2 mb-3">
            <div className={`flex-1 p-2 text-center ${isBlue ? 'bg-[var(--blue-5)]/30 border border-[var(--blue-4)]/30' : 'bg-[var(--red-5)]/30 border border-[var(--red-4)]/30'}`}>
              <div className="text-xl font-[var(--font-beaufort)] font-bold text-orange-300">{composition.damageProfile.physical}</div>
              <div className="text-[8px] text-orange-300/70 uppercase tracking-wider">AD</div>
            </div>
            <div className={`flex-1 p-2 text-center ${isBlue ? 'bg-[var(--blue-5)]/30 border border-[var(--blue-4)]/30' : 'bg-[var(--red-5)]/30 border border-[var(--red-4)]/30'}`}>
              <div className="text-xl font-[var(--font-beaufort)] font-bold text-purple-300">{composition.damageProfile.magic}</div>
              <div className="text-[8px] text-purple-300/70 uppercase tracking-wider">AP</div>
            </div>
          </div>
          
          {composition.strengths.length > 0 && (
            <div className="mb-2">
              {composition.strengths.slice(0, 2).map((s, i) => (
                <div key={i} className="text-[10px] text-green-400 flex items-center gap-1 mb-0.5">
                  <Check className="w-3 h-3" />{s}
                </div>
              ))}
            </div>
          )}
          {composition.weaknesses.length > 0 && (
            <div>
              {composition.weaknesses.slice(0, 2).map((w, i) => (
                <div key={i} className="text-[10px] text-[var(--red-3)] flex items-center gap-1 mb-0.5">
                  <AlertTriangle className="w-3 h-3" />{w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DraftCompletePanelProps {
  analysis: DraftAnalysis | null;
  assistFor: 'BLUE' | 'RED';
  assistedTeam: { name: string; nameShortened?: string; logoUrl?: string } | null;
  draftState: DraftState;
  blueTeam: { name: string; nameShortened?: string } | null;
  redTeam: { name: string; nameShortened?: string } | null;
}

function DraftCompletePanel({ analysis, assistFor, assistedTeam, draftState, blueTeam, redTeam }: DraftCompletePanelProps) {
  const winProb = analysis?.winProbability?.ourTeam ?? 50;
  const favorable = winProb >= 50;
  const timings = draftState.timings || [];
  
  // Calculate timing statistics
  const blueTimings = timings.filter(t => t.side === 'BLUE');
  const redTimings = timings.filter(t => t.side === 'RED');
  const blueBanTimings = blueTimings.filter(t => t.type === 'BAN');
  const redBanTimings = redTimings.filter(t => t.type === 'BAN');
  const bluePickTimings = blueTimings.filter(t => t.type === 'PICK');
  const redPickTimings = redTimings.filter(t => t.type === 'PICK');
  
  const avgTime = (arr: typeof timings) => arr.length > 0 ? arr.reduce((sum, t) => sum + t.durationMs, 0) / arr.length : 0;
  const totalTime = (arr: typeof timings) => arr.reduce((sum, t) => sum + t.durationMs, 0);
  const maxTime = (arr: typeof timings) => arr.length > 0 ? Math.max(...arr.map(t => t.durationMs)) : 0;
  const minTime = (arr: typeof timings) => arr.length > 0 ? Math.min(...arr.map(t => t.durationMs)) : 0;
  
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const totalDraftTime = draftState.draftStartTime && timings.length > 0 
    ? timings[timings.length - 1].timestamp - draftState.draftStartTime 
    : totalTime(timings);
    
  const getChampionName = (id: string) => CHAMPIONS.find(c => c.id === id)?.name || id;

  // Find slowest picks for each team
  const blueSlowest = blueTimings.length > 0 ? blueTimings.reduce((max, t) => t.durationMs > max.durationMs ? t : max) : null;
  const redSlowest = redTimings.length > 0 ? redTimings.reduce((max, t) => t.durationMs > max.durationMs ? t : max) : null;

  return (
    <div className={`${favorable ? 'hextech-border-blue' : 'hextech-border-red'} overflow-hidden`}>
      <div className={`p-8 text-center ${favorable ? 'bg-gradient-to-b from-[var(--blue-6)]/50 to-transparent' : 'bg-gradient-to-b from-[var(--red-6)]/50 to-transparent'}`}>
        <div className="w-20 h-20 mx-auto mb-6 border-4 border-[var(--gold-3)] rotate-45 flex items-center justify-center bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent">
          <Crown className={`w-10 h-10 rotate-[-45deg] ${favorable ? 'text-[var(--gold-2)]' : 'text-[var(--muted)]'}`} />
        </div>
        <h2 className="text-3xl font-[var(--font-beaufort)] font-black text-gold-glow mb-4 tracking-wider">DRAFT COMPLETE</h2>
        <div className={`text-6xl font-[var(--font-beaufort)] font-black mb-2 tabular-nums ${favorable ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>{winProb.toFixed(1)}%</div>
        <div className="text-sm text-[var(--muted)] mb-6">Predicted Win Rate for {assistedTeam?.name || assistFor}</div>
        {analysis?.compositionAnalysis.ourTeam && (
          <div className="hextech-border max-w-md mx-auto p-4 text-left mb-6">
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-3 text-center">Draft Summary</div>
            {analysis.compositionAnalysis.ourTeam.strengths.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Strengths</span>
                <div className="text-sm text-[var(--gold-1)] mt-1">{analysis.compositionAnalysis.ourTeam.strengths.join(' • ')}</div>
              </div>
            )}
            {analysis.compositionAnalysis.ourTeam.weaknesses.length > 0 && (
              <div>
                <span className="text-[10px] text-[var(--red-3)] font-bold uppercase tracking-wider">Weaknesses</span>
                <div className="text-sm text-[var(--gold-1)] mt-1">{analysis.compositionAnalysis.ourTeam.weaknesses.join(' • ')}</div>
              </div>
            )}
          </div>
        )}
        
        {/* Draft Timing Analysis */}
        {timings.length > 0 && (
          <div className="hextech-border max-w-2xl mx-auto p-4 text-left">
            <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              DRAFT TIMING ANALYSIS
            </div>
            
            {/* Total Draft Time */}
            <div className="text-center mb-6">
              <div className="text-3xl font-[var(--font-beaufort)] font-black text-[var(--gold-2)] tabular-nums">
                {formatTime(totalDraftTime)}
              </div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total Draft Duration</div>
            </div>
            
            {/* Team Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Blue Team Stats */}
              <div className="p-3 bg-[var(--blue-6)]/30 border border-[var(--blue-4)]/30">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-[var(--blue-2)]" />
                  <span className="text-xs font-[var(--font-beaufort)] font-bold text-[var(--blue-2)]">
                    {blueTeam?.nameShortened || 'BLUE'}
                  </span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Avg Pick Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(avgTime(bluePickTimings))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Avg Ban Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(avgTime(blueBanTimings))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Total Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(totalTime(blueTimings))}</span>
                  </div>
                  {blueSlowest && (
                    <div className="pt-2 border-t border-[var(--blue-4)]/30">
                      <span className="text-[var(--muted)]">Slowest: </span>
                      <span className="text-[var(--gold-1)]">{getChampionName(blueSlowest.championId)}</span>
                      <span className="text-[var(--blue-2)] ml-1">({formatTime(blueSlowest.durationMs)})</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Red Team Stats */}
              <div className="p-3 bg-[var(--red-6)]/30 border border-[var(--red-4)]/30">
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="w-4 h-4 text-[var(--red-3)]" />
                  <span className="text-xs font-[var(--font-beaufort)] font-bold text-[var(--red-3)]">
                    {redTeam?.nameShortened || 'RED'}
                  </span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Avg Pick Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(avgTime(redPickTimings))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Avg Ban Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(avgTime(redBanTimings))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Total Time</span>
                    <span className="text-[var(--gold-1)] font-mono">{formatTime(totalTime(redTimings))}</span>
                  </div>
                  {redSlowest && (
                    <div className="pt-2 border-t border-[var(--red-4)]/30">
                      <span className="text-[var(--muted)]">Slowest: </span>
                      <span className="text-[var(--gold-1)]">{getChampionName(redSlowest.championId)}</span>
                      <span className="text-[var(--red-3)] ml-1">({formatTime(redSlowest.durationMs)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="border-t border-[var(--gold-5)]/30 pt-4">
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-3">Pick/Ban Timeline</div>
              <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {timings.map((timing, idx) => {
                  const champ = CHAMPIONS.find(c => c.id === timing.championId);
                  const isBlue = timing.side === 'BLUE';
                  const isBan = timing.type === 'BAN';
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2 p-2 text-[11px] ${isBlue ? 'bg-[var(--blue-6)]/20' : 'bg-[var(--red-6)]/20'}`}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${isBlue ? 'bg-[var(--blue-4)] text-white' : 'bg-[var(--red-5)] text-white'}`}>
                        {idx + 1}
                      </span>
                      <span className={`w-12 text-[9px] font-bold uppercase ${isBlue ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
                        {timing.side}
                      </span>
                      <span className={`w-10 text-[9px] px-1.5 py-0.5 rounded ${isBan ? 'bg-[var(--red-5)]/50 text-[var(--red-3)]' : 'bg-[var(--gold-5)]/30 text-[var(--gold-2)]'}`}>
                        {timing.type}
                      </span>
                      {champ && (
                        <img src={champ.imageUrl} alt={champ.name} className={`w-6 h-6 ${isBan ? 'grayscale opacity-60' : ''}`} />
                      )}
                      <span className="flex-1 text-[var(--gold-1)] truncate">{champ?.name || timing.championId}</span>
                      <span className={`font-mono tabular-nums ${timing.durationMs > 15000 ? 'text-[var(--red-3)]' : timing.durationMs > 8000 ? 'text-[var(--gold-3)]' : 'text-[var(--blue-2)]'}`}>
                        {formatTime(timing.durationMs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TEAM HISTORY TAB ============

interface TeamHistoryTabProps {
  teamData: TeamData | null;
  teamConfig: { id: string; name: string; nameShortened?: string; logoUrl?: string } | null;
  side: 'BLUE' | 'RED';
  loading: boolean;
}

function TeamHistoryTab({ teamData, teamConfig, side, loading }: TeamHistoryTabProps) {
  const isBlue = side === 'BLUE';
  const borderClass = isBlue ? 'hextech-border-blue' : 'hextech-border-red';
  const glowClass = isBlue ? 'text-blue-glow' : 'text-red-glow';
  
  if (!teamConfig) {
    return (
      <div className="hextech-border p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gold-5)]/20 to-transparent flex items-center justify-center">
          <Users className="w-12 h-12 text-[var(--gold-4)] opacity-50" />
        </div>
        <h3 className="text-lg font-[var(--font-beaufort)] text-[var(--gold-3)] mb-2">No Team Configured</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Configure your team in Setup to view statistics</p>
        <a href="/setup" className="hextech-button inline-flex items-center gap-2 px-6 py-3">
          <Target className="w-4 h-4" />GO TO SETUP
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hextech-border p-12 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-[var(--gold-5)]/30 border-t-[var(--gold-3)] animate-spin" />
          <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-[var(--gold-3)]" />
        </div>
        <span className="text-[var(--gold-3)] font-[var(--font-beaufort)] tracking-wider animate-pulse">Loading team history...</span>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="hextech-border p-12 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[var(--gold-4)]" />
        <h3 className="text-lg font-[var(--font-beaufort)] text-[var(--gold-3)] mb-2">No Data Available</h3>
        <p className="text-sm text-[var(--muted)]">Could not load history for {teamConfig.name}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Banner - Enhanced */}
      <div className={`${borderClass} overflow-hidden`}>
        <div className={`relative p-6 ${isBlue ? 'bg-gradient-to-r from-[var(--blue-6)]/60 via-[var(--blue-7)]/40 to-transparent' : 'bg-gradient-to-r from-[var(--red-6)]/60 via-[var(--red-7)]/40 to-transparent'}`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C8AA6E\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <div className="relative flex items-center gap-6">
            {teamConfig.logoUrl && (
              <div className="relative">
                <div className={`absolute inset-0 blur-2xl ${isBlue ? 'bg-[var(--blue-3)]' : 'bg-[var(--red-4)]'} opacity-30`} />
                <div className={`relative w-24 h-24 p-2 ${isBlue ? 'bg-[var(--blue-5)]/30 border-2 border-[var(--blue-3)]/50' : 'bg-[var(--red-5)]/30 border-2 border-[var(--red-4)]/50'} rounded-lg`}>
                  <img src={teamConfig.logoUrl} alt={teamConfig.name} className="w-full h-full object-contain" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <h2 className={`text-3xl font-[var(--font-beaufort)] font-black ${glowClass} mb-2`}>{teamConfig.name}</h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${isBlue ? 'bg-[var(--blue-5)]/30 border border-[var(--blue-4)]/30' : 'bg-[var(--red-5)]/30 border border-[var(--red-4)]/30'}`}>
                  <Trophy className="w-4 h-4 text-[var(--gold-2)]" />
                  <span className="text-sm font-[var(--font-beaufort)] font-bold">
                    <span className="text-[var(--blue-2)]">{teamData.seriesWins}W</span>
                    <span className="text-[var(--muted)] mx-1">-</span>
                    <span className="text-[var(--red-3)]">{teamData.seriesLosses}L</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center rounded ${teamData.gameWinRate >= 50 ? 'bg-[var(--blue-5)]/30' : 'bg-[var(--red-5)]/30'}`}>
                    <TrendingUp className={`w-4 h-4 ${teamData.gameWinRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`} />
                  </div>
                  <div>
                    <div className={`text-lg font-[var(--font-beaufort)] font-black ${teamData.gameWinRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>{teamData.gameWinRate.toFixed(1)}%</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Win Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--gold-4)]" />
                  <span className="text-sm text-[var(--gold-1)]">{teamData.gamesPlayed} Games Played</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Side Performance */}
        {teamData.sideStats && (
          <div className="hextech-border overflow-hidden group hover:border-[var(--gold-3)]/50 transition-colors">
            <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent">
              <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />SIDE PERFORMANCE
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <SideStatBar label="Blue Side" wins={teamData.sideStats.blueWins} losses={teamData.sideStats.blueLosses} winRate={teamData.sideStats.blueWinRate} color="blue" />
              <SideStatBar label="Red Side" wins={teamData.sideStats.redWins} losses={teamData.sideStats.redLosses} winRate={teamData.sideStats.redWinRate} color="red" />
            </div>
          </div>
        )}

        {/* Objectives */}
        {teamData.objectives && (
          <div className="hextech-border overflow-hidden group hover:border-[var(--gold-3)]/50 transition-colors">
            <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent">
              <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4" />OBJECTIVES
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <ObjectiveStat icon={Flame} label="Dragons" value={teamData.objectives.avgDragons} color="text-orange-400" />
              <ObjectiveStat icon={Skull} label="Barons" value={teamData.objectives.avgBarons} color="text-purple-400" />
              <ObjectiveStat icon={CircleDot} label="Heralds" value={teamData.objectives.avgHeralds} color="text-pink-400" />
              <ObjectiveStat icon={Castle} label="Towers" value={teamData.objectives.avgTowers} color="text-amber-400" />
              <ObjectiveStat icon={Crosshair} label="First Blood" value={teamData.objectives.firstBloodRate} isPercent color="text-red-400" />
              <ObjectiveStat icon={Target} label="First Tower" value={teamData.objectives.firstTowerRate} isPercent color="text-cyan-400" />
            </div>
          </div>
        )}

        {/* Game Averages */}
        {teamData.gameAverages && (
          <div className="hextech-border overflow-hidden group hover:border-[var(--gold-3)]/50 transition-colors">
            <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent">
              <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />GAME AVERAGES
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <GameAvgStat label="Kills" value={teamData.gameAverages.avgKills} color="text-[var(--blue-2)]" />
              <GameAvgStat label="Deaths" value={teamData.gameAverages.avgDeaths} color="text-[var(--red-3)]" />
              <GameAvgStat label="Assists" value={teamData.gameAverages.avgAssists} color="text-cyan-400" />
              <GameAvgStat label="KDA" value={teamData.gameAverages.avgKDA} decimal color={teamData.gameAverages.avgKDA >= 3 ? 'text-[var(--gold-2)]' : 'text-[var(--gold-4)]'} />
              <GameAvgStat label="Duration" value={teamData.gameAverages.avgDuration} suffix="m" color="text-[var(--gold-3)]" />
              <GameAvgStat label="Gold Diff" value={teamData.gameAverages.avgGoldDiff} prefix={teamData.gameAverages.avgGoldDiff > 0 ? '+' : ''} color={teamData.gameAverages.avgGoldDiff >= 0 ? 'text-[var(--gold-2)]' : 'text-[var(--red-3)]'} />
            </div>
          </div>
        )}

        {/* Dragon Types */}
        {teamData.objectives?.dragonsByType && (
          <div className="hextech-border overflow-hidden group hover:border-[var(--gold-3)]/50 transition-colors">
            <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent">
              <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4" />DRAGON TYPES
              </h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              <DragonTypeStat type="Infernal" count={teamData.objectives.dragonsByType.infernal} icon={Flame} color="text-orange-400" bgColor="bg-orange-500/10" />
              <DragonTypeStat type="Mountain" count={teamData.objectives.dragonsByType.mountain} icon={Mountain} color="text-amber-600" bgColor="bg-amber-500/10" />
              <DragonTypeStat type="Ocean" count={teamData.objectives.dragonsByType.ocean} icon={Droplet} color="text-blue-400" bgColor="bg-blue-500/10" />
              <DragonTypeStat type="Cloud" count={teamData.objectives.dragonsByType.cloud} icon={Cloud} color="text-gray-400" bgColor="bg-gray-500/10" />
              <DragonTypeStat type="Hextech" count={teamData.objectives.dragonsByType.hextech} icon={Hexagon} color="text-cyan-400" bgColor="bg-cyan-500/10" />
              <DragonTypeStat type="Chemtech" count={teamData.objectives.dragonsByType.chemtech} icon={FlaskConical} color="text-green-400" bgColor="bg-green-500/10" />
            </div>
          </div>
        )}
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Picked */}
        <div className="hextech-border overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent flex items-center justify-between">
            <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />SIGNATURE CHAMPIONS
            </h3>
            <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Most Picked</span>
          </div>
          <div className="p-4 space-y-2">
            {teamData.mostPicked?.length > 0 ? teamData.mostPicked.slice(0, 8).map((pick, i) => {
              const champ = getChampionByName(pick.name);
              const isTop3 = i < 3;
              return (
                <div key={pick.name} className={`flex items-center gap-3 p-2 border transition-all hover:bg-[var(--gold-5)]/5 ${isTop3 ? 'bg-gradient-to-r from-[var(--gold-5)]/10 to-transparent border-[var(--gold-4)]/30' : 'bg-[var(--hextech-black)]/50 border-[var(--gold-5)]/20'}`}>
                  <span className={`text-sm font-[var(--font-beaufort)] w-5 ${isTop3 ? 'text-[var(--gold-2)] font-bold' : 'text-[var(--gold-5)]'}`}>#{i + 1}</span>
                  <div className="relative">
                    {champ ? (
                      <img src={champ.imageUrl} alt={pick.name} className={`w-10 h-10 ${isTop3 ? 'border-2 border-[var(--gold-3)]' : 'border border-[var(--gold-5)]'}`} />
                    ) : (
                      <div className="w-10 h-10 bg-[var(--hextech-metal)] border border-[var(--gold-5)] flex items-center justify-center text-[8px]">?</div>
                    )}
                    {isTop3 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--gold-3)] rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{pick.name}</div>
                    <div className="text-[9px] text-[var(--muted)]">{pick.count} games played</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${pick.winRate >= 60 ? 'text-[var(--gold-2)]' : pick.winRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>{pick.winRate.toFixed(0)}%</div>
                    <div className="text-[8px] text-[var(--muted)]">Win Rate</div>
                  </div>
                </div>
              );
            }) : <div className="text-center py-4 text-[var(--muted)] text-sm">No data available</div>}
          </div>
        </div>

        {/* Most Banned Against */}
        <div className="hextech-border-red overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--red-5)]/30 bg-gradient-to-r from-[var(--red-6)]/30 to-transparent flex items-center justify-between">
            <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-red-glow tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4" />TARGET BANS
            </h3>
            <span className="text-[9px] text-[var(--red-3)]/70 uppercase tracking-wider">Banned Against Us</span>
          </div>
          <div className="p-4 space-y-2">
            {teamData.mostBannedAgainst?.length > 0 ? teamData.mostBannedAgainst.slice(0, 8).map((ban, i) => {
              const champ = getChampionByName(ban.name);
              const isTop3 = i < 3;
              return (
                <div key={ban.name} className={`flex items-center gap-3 p-2 border transition-all hover:bg-[var(--red-5)]/10 ${isTop3 ? 'bg-gradient-to-r from-[var(--red-5)]/20 to-transparent border-[var(--red-4)]/40' : 'bg-[var(--hextech-black)]/50 border-[var(--red-5)]/20'}`}>
                  <span className={`text-sm font-[var(--font-beaufort)] w-5 ${isTop3 ? 'text-[var(--red-3)] font-bold' : 'text-[var(--red-5)]'}`}>#{i + 1}</span>
                  <div className="relative">
                    {champ ? (
                      <img src={champ.imageUrl} alt={ban.name} className={`w-10 h-10 grayscale ${isTop3 ? 'opacity-90 border-2 border-[var(--red-4)]' : 'opacity-60 border border-[var(--red-5)]'}`} />
                    ) : (
                      <div className="w-10 h-10 bg-[var(--hextech-metal)] border border-[var(--red-5)] flex items-center justify-center text-[8px]">?</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <X className={`${isTop3 ? 'w-6 h-6 text-[var(--red-3)]' : 'w-4 h-4 text-[var(--red-4)]'}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{ban.name}</div>
                    <div className="text-[9px] text-[var(--muted)]">Targeted {ban.count} times</div>
                  </div>
                  <div className={`text-lg font-[var(--font-beaufort)] font-black ${isTop3 ? 'text-[var(--red-3)]' : 'text-[var(--red-4)]'}`}>{ban.count}×</div>
                </div>
              );
            }) : <div className="text-center py-4 text-[var(--muted)] text-sm">No data available</div>}
          </div>
        </div>
      </div>

      {/* Player Stats */}
      {teamData.players && teamData.players.length > 0 && (
        <div className="hextech-border overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent">
            <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />PLAYER STATISTICS
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--gold-5)]/30 bg-[var(--hextech-black)]/50">
                  <th className="text-left py-3 px-4 text-[10px] text-[var(--muted)] font-normal">PLAYER</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">GAMES</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">WIN%</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">KDA</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">K/D/A</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">DMG/M</th>
                  <th className="text-center py-3 px-2 text-[10px] text-[var(--muted)] font-normal">GOLD/M</th>
                  <th className="text-left py-3 px-2 text-[10px] text-[var(--muted)] font-normal">TOP CHAMPIONS</th>
                </tr>
              </thead>
              <tbody>
                {teamData.players.map((player) => (
                  <tr key={player.id} className="border-b border-[var(--gold-5)]/10 hover:bg-[var(--gold-5)]/5 transition-colors">
                    <td className="py-3 px-4 font-[var(--font-beaufort)] text-[var(--gold-1)]">{player.name}</td>
                    <td className="py-3 px-2 text-center text-[var(--muted)]">{player.gamesPlayed}</td>
                    <td className={`py-3 px-2 text-center font-bold ${player.winRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>{player.winRate.toFixed(0)}%</td>
                    <td className={`py-3 px-2 text-center font-bold ${player.avgKDA >= 3 ? 'text-[var(--gold-2)]' : 'text-[var(--gold-4)]'}`}>{player.avgKDA.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center text-[var(--muted)]">{player.avgKills.toFixed(1)}/{player.avgDeaths.toFixed(1)}/{player.avgAssists.toFixed(1)}</td>
                    <td className="py-3 px-2 text-center text-[var(--muted)]">{player.avgDamagePerMinute.toFixed(0)}</td>
                    <td className="py-3 px-2 text-center text-[var(--muted)]">{player.avgGoldPerMinute.toFixed(0)}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        {player.champions.slice(0, 4).map((c) => {
                          const champ = getChampionByName(c.name);
                          return champ ? (
                            <img key={c.name} src={champ.imageUrl} alt={c.name} title={`${c.name}: ${c.games}G ${c.winRate.toFixed(0)}%WR`} className="w-7 h-7 border border-[var(--gold-5)]/30" />
                          ) : (
                            <div key={c.name} className="w-7 h-7 bg-[var(--hextech-metal)] border border-[var(--gold-5)]/30 text-[6px] flex items-center justify-center">{c.name.slice(0, 2)}</div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      <div className="hextech-border overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-[var(--hextech-metal)]/30">
          <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" />RECENT MATCHES
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {teamData.recentMatches?.length > 0 ? teamData.recentMatches.slice(0, 10).map((match) => (
            <MatchCard key={match.seriesId} match={match} />
          )) : <div className="text-center py-8 text-[var(--muted)] text-sm">No recent matches available</div>}
        </div>
      </div>
    </div>
  );
}

// ============ HEAD TO HEAD TAB ============

interface HeadToHeadTabProps {
  headToHead: any;
  blueTeam: { id: string; name: string; nameShortened?: string; logoUrl?: string } | null;
  redTeam: { id: string; name: string; nameShortened?: string; logoUrl?: string } | null;
  loading: boolean;
}

function HeadToHeadTab({ headToHead, blueTeam, redTeam, loading }: HeadToHeadTabProps) {
  if (!blueTeam || !redTeam) {
    return (
      <div className="hextech-border p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gold-5)]/20 to-transparent flex items-center justify-center">
          <Swords className="w-12 h-12 text-[var(--gold-4)] opacity-50" />
        </div>
        <h3 className="text-lg font-[var(--font-beaufort)] text-[var(--gold-3)] mb-2">Both Teams Required</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Configure both teams in Setup to view head-to-head statistics</p>
        <a href="/setup" className="hextech-button inline-flex items-center gap-2 px-6 py-3">
          <Target className="w-4 h-4" />GO TO SETUP
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hextech-border p-12 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-[var(--gold-5)]/30 border-t-[var(--gold-3)] animate-spin" />
          <Swords className="absolute inset-0 m-auto w-8 h-8 text-[var(--gold-3)]" />
        </div>
        <span className="text-[var(--gold-3)] font-[var(--font-beaufort)] tracking-wider animate-pulse">Loading head-to-head data...</span>
      </div>
    );
  }

  const h2h = headToHead;

  return (
    <div className="space-y-6">
      {/* H2H Banner - Enhanced */}
      <div className="hextech-border overflow-hidden">
        <div className="relative p-8 bg-gradient-to-r from-[var(--blue-6)]/50 via-[var(--hextech-black)] to-[var(--red-6)]/50">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[var(--blue-4)]/10 to-transparent" />
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[var(--red-5)]/10 to-transparent" />
          </div>
          
          <div className="relative flex items-center justify-between">
            {/* Blue Team */}
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-[var(--blue-3)] opacity-30" />
                {blueTeam.logoUrl ? (
                  <div className="relative w-20 h-20 p-2 bg-[var(--blue-5)]/30 border-2 border-[var(--blue-3)]/50 rounded-lg">
                    <img src={blueTeam.logoUrl} alt={blueTeam.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-[var(--blue-5)]/30 border-2 border-[var(--blue-3)]/50 rounded-lg flex items-center justify-center text-2xl font-bold text-[var(--blue-2)]">{blueTeam.nameShortened?.slice(0, 2) || blueTeam.name.slice(0, 2)}</div>
                )}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-[var(--font-beaufort)] font-black text-blue-glow">{blueTeam.nameShortened || blueTeam.name}</h2>
                <div className="text-5xl md:text-6xl font-[var(--font-beaufort)] font-black text-[var(--blue-2)] leading-none mt-1">{h2h?.team1?.wins || 0}</div>
                <div className="text-[10px] text-[var(--blue-3)] uppercase tracking-widest">SERIES WON</div>
              </div>
            </div>
            
            {/* Center VS */}
            <div className="flex flex-col items-center px-6 md:px-12">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[var(--gold-4)]/30 to-[var(--gold-6)]/30 border-2 border-[var(--gold-3)]/50 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-[var(--font-beaufort)] font-black text-gold-glow">VS</span>
              </div>
              <div className="mt-2 text-center">
                <div className="text-2xl font-[var(--font-beaufort)] font-black text-[var(--gold-2)]">{h2h?.totalSeries || 0}</div>
                <div className="text-[9px] text-[var(--muted)] uppercase tracking-widest">SERIES PLAYED</div>
              </div>
            </div>
            
            {/* Red Team */}
            <div className="flex items-center gap-5 flex-1 justify-end">
              <div className="text-right">
                <h2 className="text-xl md:text-2xl font-[var(--font-beaufort)] font-black text-red-glow">{redTeam.nameShortened || redTeam.name}</h2>
                <div className="text-5xl md:text-6xl font-[var(--font-beaufort)] font-black text-[var(--red-3)] leading-none mt-1">{h2h?.team2?.wins || 0}</div>
                <div className="text-[10px] text-[var(--red-4)] uppercase tracking-widest">SERIES WON</div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-[var(--red-4)] opacity-30" />
                {redTeam.logoUrl ? (
                  <div className="relative w-20 h-20 p-2 bg-[var(--red-5)]/30 border-2 border-[var(--red-4)]/50 rounded-lg">
                    <img src={redTeam.logoUrl} alt={redTeam.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-[var(--red-5)]/30 border-2 border-[var(--red-4)]/50 rounded-lg flex items-center justify-center text-2xl font-bold text-[var(--red-3)]">{redTeam.nameShortened?.slice(0, 2) || redTeam.name.slice(0, 2)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {h2h?.totalSeries > 0 ? (
        <>
          {/* Champion Picks Comparison - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blue Team Picks in H2H */}
            <div className="hextech-border-blue overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--blue-4)]/30 bg-gradient-to-r from-[var(--blue-6)]/40 to-transparent flex items-center justify-between">
                <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-blue-glow tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" />{blueTeam.nameShortened || blueTeam.name}
                </h3>
                <span className="text-[9px] text-[var(--blue-3)] uppercase tracking-wider">PICKS</span>
              </div>
              <div className="p-4 space-y-2">
                {h2h.championsPickedByTeam1?.length > 0 ? h2h.championsPickedByTeam1.slice(0, 6).map((pick: any, i: number) => {
                  const champ = getChampionByName(pick.name);
                  return (
                    <div key={pick.name} className="flex items-center gap-3 p-2 bg-[var(--hextech-black)]/50 border border-[var(--blue-4)]/20 hover:border-[var(--blue-3)]/40 hover:bg-[var(--blue-6)]/10 transition-all">
                      <span className="text-xs font-[var(--font-beaufort)] text-[var(--blue-4)] w-4">#{i + 1}</span>
                      {champ ? <img src={champ.imageUrl} alt={pick.name} className="w-9 h-9 border border-[var(--blue-3)]" /> : <div className="w-9 h-9 bg-[var(--hextech-metal)] border border-[var(--blue-3)] flex items-center justify-center text-[8px]">?</div>}
                      <div className="flex-1 text-sm font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{pick.name}</div>
                      <div className="text-sm text-[var(--blue-2)] font-bold">{pick.count}×</div>
                    </div>
                  );
                }) : <div className="text-center py-4 text-[var(--muted)] text-sm">No data</div>}
              </div>
            </div>

            {/* Common Bans - Enhanced */}
            <div className="hextech-border overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-b from-[var(--red-6)]/20 to-transparent">
                <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-red-glow tracking-wider flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" />COMMON BANS
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {h2h.commonBans?.length > 0 ? h2h.commonBans.slice(0, 6).map((ban: any, i: number) => {
                  const champ = getChampionByName(ban.name);
                  return (
                    <div key={ban.name} className="flex items-center gap-3 p-2 bg-[var(--hextech-black)]/50 border border-[var(--red-5)]/20 hover:border-[var(--red-4)]/40 hover:bg-[var(--red-6)]/10 transition-all">
                      <span className="text-xs font-[var(--font-beaufort)] text-[var(--red-5)] w-4">#{i + 1}</span>
                      <div className="relative">
                        {champ ? <img src={champ.imageUrl} alt={ban.name} className="w-9 h-9 border border-[var(--red-4)] grayscale opacity-75" /> : <div className="w-9 h-9 bg-[var(--hextech-metal)] border border-[var(--red-4)] flex items-center justify-center text-[8px]">?</div>}
                        <X className="absolute inset-0 m-auto w-5 h-5 text-[var(--red-3)]" />
                      </div>
                      <div className="flex-1 text-sm font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{ban.name}</div>
                      <div className="text-sm text-[var(--red-3)] font-bold">{ban.count}×</div>
                    </div>
                  );
                }) : <div className="text-center py-4 text-[var(--muted)] text-sm">No data</div>}
              </div>
            </div>

            {/* Red Team Picks in H2H */}
            <div className="hextech-border-red overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--red-5)]/30 bg-gradient-to-l from-[var(--red-6)]/40 to-transparent flex items-center justify-between">
                <span className="text-[9px] text-[var(--red-4)] uppercase tracking-wider">PICKS</span>
                <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-red-glow tracking-wider flex items-center gap-2">
                  {redTeam.nameShortened || redTeam.name}<Target className="w-4 h-4" />
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {h2h.championsPickedByTeam2?.length > 0 ? h2h.championsPickedByTeam2.slice(0, 6).map((pick: any, i: number) => {
                  const champ = getChampionByName(pick.name);
                  return (
                    <div key={pick.name} className="flex items-center gap-3 p-2 bg-[var(--hextech-black)]/50 border border-[var(--red-5)]/20 hover:border-[var(--red-4)]/40 hover:bg-[var(--red-6)]/10 transition-all">
                      <span className="text-xs font-[var(--font-beaufort)] text-[var(--red-5)] w-4">#{i + 1}</span>
                      {champ ? <img src={champ.imageUrl} alt={pick.name} className="w-9 h-9 border border-[var(--red-4)]" /> : <div className="w-9 h-9 bg-[var(--hextech-metal)] border border-[var(--red-4)] flex items-center justify-center text-[8px]">?</div>}
                      <div className="flex-1 text-sm font-[var(--font-beaufort)] text-[var(--gold-1)] truncate">{pick.name}</div>
                      <div className="text-sm text-[var(--red-3)] font-bold">{pick.count}×</div>
                    </div>
                  );
                }) : <div className="text-center py-4 text-[var(--muted)] text-sm">No data</div>}
              </div>
            </div>
          </div>

          {/* Recent H2H Encounters - Enhanced */}
          <div className="hextech-border overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--gold-5)]/30 bg-gradient-to-r from-[var(--hextech-metal)]/50 to-transparent flex items-center justify-between">
              <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" />RECENT ENCOUNTERS
              </h3>
              <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{h2h.recentMatches?.length || 0} matches</span>
            </div>
            <div className="p-4">
              {h2h.recentMatches?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {h2h.recentMatches.map((match: any, i: number) => {
                    const isTeam1Win = match.winner === h2h.team1?.name;
                    return (
                      <div key={match.id || i} className={`relative p-4 border transition-all hover:scale-[1.02] ${isTeam1Win ? 'border-[var(--blue-4)] bg-gradient-to-br from-[var(--blue-6)]/30 to-transparent hover:border-[var(--blue-3)]' : 'border-[var(--red-5)] bg-gradient-to-br from-[var(--red-6)]/30 to-transparent hover:border-[var(--red-4)]'}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isTeam1Win ? 'bg-[var(--blue-3)]' : 'bg-[var(--red-4)]'}`} />
                        <div className="flex flex-col items-center text-center">
                          <span className={`text-lg font-[var(--font-beaufort)] font-black ${isTeam1Win ? 'text-blue-glow' : 'text-red-glow'}`}>{isTeam1Win ? blueTeam.nameShortened || 'Blue' : redTeam.nameShortened || 'Red'}</span>
                          <div className="flex items-center gap-1 my-2">
                            <Trophy className={`w-4 h-4 ${isTeam1Win ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`} />
                            <span className="text-sm font-bold text-[var(--gold-2)]">{match.score}</span>
                          </div>
                          {match.tournament && <div className="text-[8px] text-[var(--muted)] truncate max-w-full">{match.tournament}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="text-center py-8 text-[var(--muted)] text-sm">No recent encounters</div>}
            </div>
          </div>
        </>
      ) : (
        <div className="hextech-border p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--gold-5)]/10 to-transparent flex items-center justify-center">
            <Swords className="w-12 h-12 text-[var(--gold-4)] opacity-50" />
          </div>
          <h3 className="text-xl font-[var(--font-beaufort)] text-[var(--gold-3)] mb-2">No Head-to-Head History</h3>
          <p className="text-sm text-[var(--muted)]">No matches found between <span className="text-blue-glow">{blueTeam.name}</span> and <span className="text-red-glow">{redTeam.name}</span></p>
        </div>
      )}
    </div>
  );
}

// ============ HELPER COMPONENTS ============

function SideStatBar({ label, wins, losses, winRate, color }: { label: string; wins: number; losses: number; winRate: number; color: 'blue' | 'red' }) {
  const barColor = color === 'blue' ? 'bg-gradient-to-r from-[var(--blue-4)] to-[var(--blue-2)]' : 'bg-gradient-to-r from-[var(--red-5)] to-[var(--red-3)]';
  const textColor = color === 'blue' ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]';
  const bgColor = color === 'blue' ? 'bg-[var(--blue-6)]/20' : 'bg-[var(--red-6)]/20';
  const borderColor = color === 'blue' ? 'border-[var(--blue-4)]/30' : 'border-[var(--red-5)]/30';
  
  return (
    <div className={`p-3 rounded ${bgColor} border ${borderColor}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-[var(--font-beaufort)] ${textColor} font-bold`}>{label}</span>
        <span className={`text-xs ${textColor}`}>{wins}W - {losses}L</span>
      </div>
      <div className="h-3 bg-[var(--hextech-black)] border border-[var(--gold-5)]/20 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${winRate}%` }} />
      </div>
      <div className={`text-right text-sm font-bold mt-1 ${textColor}`}>{winRate.toFixed(0)}%</div>
    </div>
  );
}

function ObjectiveStat({ icon: Icon, label, value, isPercent, color = 'text-[var(--gold-4)]' }: { icon: React.ElementType; label: string; value: number; isPercent?: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-[var(--hextech-black)]/50 border border-[var(--gold-5)]/10 hover:border-[var(--gold-4)]/30 transition-colors group">
      <div className={`w-8 h-8 flex items-center justify-center rounded bg-[var(--gold-5)]/10 group-hover:bg-[var(--gold-5)]/20 transition-colors`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1">
        <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-[var(--font-beaufort)] font-bold ${color}`}>{isPercent ? `${value.toFixed(0)}%` : value.toFixed(1)}</div>
      </div>
    </div>
  );
}

function GameAvgStat({ label, value, decimal, prefix, suffix, color = 'text-[var(--gold-1)]' }: { label: string; value: number; decimal?: boolean; prefix?: string; suffix?: string; color?: string }) {
  return (
    <div className="p-2 bg-[var(--hextech-black)]/50 border border-[var(--gold-5)]/10 hover:border-[var(--gold-4)]/30 transition-colors">
      <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-[var(--font-beaufort)] font-bold ${color}`}>{prefix}{decimal ? value.toFixed(2) : value.toFixed(1)}{suffix}</div>
    </div>
  );
}

function DragonTypeStat({ type, count, icon: Icon, color, bgColor = 'bg-[var(--gold-5)]/10' }: { type: string; count: number; icon: React.ElementType; color: string; bgColor?: string }) {
  return (
    <div className={`flex items-center gap-2 p-2 ${bgColor} border border-[var(--gold-5)]/10 hover:border-[var(--gold-4)]/30 transition-colors`}>
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="flex-1">
        <div className="text-[9px] text-[var(--muted)]">{type}</div>
        <div className={`text-base font-[var(--font-beaufort)] font-bold ${color}`}>{count}</div>
      </div>
    </div>
  );
}

// ============ MATCH CARD ============

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className={`border ${match.won ? 'border-[var(--blue-4)] bg-[var(--blue-6)]/10' : 'border-[var(--red-5)] bg-[var(--red-6)]/10'}`}>
      <div className="p-3 cursor-pointer hover:bg-[var(--hextech-metal)]/20 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xl font-[var(--font-beaufort)] font-black ${match.won ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>{match.won ? 'W' : 'L'}</span>
            <div>
              <div className="text-sm text-[var(--gold-1)]">vs {match.opponent}</div>
              <div className="text-[10px] text-[var(--muted)]">{formatDate(match.date)} {match.tournament && `• ${match.tournament}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-[var(--font-beaufort)] text-[var(--gold-2)]">{match.score}</span>
            <div className="flex gap-1">
              {match.games?.map((g, i) => (
                <div key={i} className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${g.won ? 'bg-[var(--blue-5)] text-[var(--blue-1)]' : 'bg-[var(--red-5)] text-[var(--red-2)]'}`} title={`Game ${g.gameNumber}: ${g.won ? 'W' : 'L'}`}>{g.gameNumber}</div>
              ))}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
          </div>
        </div>
      </div>

      {expanded && match.games && match.games.length > 0 && (
        <div className="border-t border-[var(--gold-5)]/20 divide-y divide-[var(--gold-5)]/10">
          {match.games.map((game) => <GameDetail key={game.gameNumber} game={game} />)}
        </div>
      )}
    </div>
  );
}

function GameDetail({ game }: { game: MatchResult['games'][0] }) {
  const draft = game.draft;
  return (
    <div className="p-3 bg-[var(--hextech-black)]/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-[var(--font-beaufort)] font-bold ${game.won ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>Game {game.gameNumber} - {game.won ? 'WIN' : 'LOSS'}</span>
          <span className={`text-[10px] px-2 py-0.5 ${game.side === 'blue' ? 'bg-[var(--blue-5)]/50 text-[var(--blue-2)]' : 'bg-[var(--red-5)]/50 text-[var(--red-2)]'}`}>{game.side.toUpperCase()} SIDE</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
          <span>{game.kills}/{game.deaths} K/D</span>
          <span>{game.goldDiff >= 0 ? '+' : ''}{(game.goldDiff / 1000).toFixed(1)}k Gold</span>
          <span>{game.duration}m</span>
        </div>
      </div>
      
      {draft && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-2 border ${game.side === 'blue' ? 'border-[var(--blue-4)]/30' : 'border-[var(--red-5)]/30'}`}>
            <div className={`text-[9px] uppercase tracking-wider mb-2 ${game.side === 'blue' ? 'text-[var(--blue-3)]' : 'text-[var(--red-3)]'}`}>Our Team ({game.side.toUpperCase()})</div>
            <div className="mb-2">
              <div className="text-[8px] text-[var(--muted)] mb-1">PICKS</div>
              <div className="flex gap-1 flex-wrap">{draft.teamPicks.length > 0 ? draft.teamPicks.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="pick" />) : <span className="text-[9px] text-[var(--muted)]">No data</span>}</div>
            </div>
            <div>
              <div className="text-[8px] text-[var(--muted)] mb-1">BANS</div>
              <div className="flex gap-1 flex-wrap">{draft.teamBans.length > 0 ? draft.teamBans.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="ban" />) : <span className="text-[9px] text-[var(--muted)]">No data</span>}</div>
            </div>
          </div>
          
          <div className={`p-2 border ${game.side === 'blue' ? 'border-[var(--red-5)]/30' : 'border-[var(--blue-4)]/30'}`}>
            <div className={`text-[9px] uppercase tracking-wider mb-2 ${game.side === 'blue' ? 'text-[var(--red-3)]' : 'text-[var(--blue-3)]'}`}>Opponent ({game.side === 'blue' ? 'RED' : 'BLUE'})</div>
            <div className="mb-2">
              <div className="text-[8px] text-[var(--muted)] mb-1">PICKS</div>
              <div className="flex gap-1 flex-wrap">{draft.opponentPicks.length > 0 ? draft.opponentPicks.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="pick" />) : <span className="text-[9px] text-[var(--muted)]">No data</span>}</div>
            </div>
            <div>
              <div className="text-[8px] text-[var(--muted)] mb-1">BANS</div>
              <div className="flex gap-1 flex-wrap">{draft.opponentBans.length > 0 ? draft.opponentBans.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="ban" />) : <span className="text-[9px] text-[var(--muted)]">No data</span>}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChampionMiniIcon({ name, type }: { name: string; type: 'pick' | 'ban' }) {
  const champ = getChampionByName(name);
  const isBan = type === 'ban';
  return (
    <div className={`relative group ${isBan ? 'opacity-60' : ''}`} title={name}>
      {champ ? <img src={champ.imageUrl} alt={name} className={`w-8 h-8 border ${isBan ? 'border-[var(--red-4)] grayscale' : 'border-[var(--gold-4)]'}`} /> : <div className={`w-8 h-8 flex items-center justify-center text-[7px] bg-[var(--hextech-metal)] border ${isBan ? 'border-[var(--red-4)]' : 'border-[var(--gold-4)]'}`}>{name.slice(0, 2)}</div>}
      {isBan && (
        <div className="absolute inset-0 flex items-center justify-center">
          <XCircle className="w-4 h-4 text-[var(--red-3)]" />
        </div>
      )}
    </div>
  );
}

// ============ PRE-MATCH INFO TAB ============

function PreMatchInfoTab({ teamData, teamConfig, loading }: { teamData: TeamData | null; teamConfig: { id: string; name: string; nameShortened?: string; logoUrl?: string } | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--gold-3)]" />
        <span className="text-[var(--gold-3)] font-[var(--font-beaufort)]">Loading enemy intel...</span>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="hextech-border p-12 text-center">
        <Eye className="w-16 h-16 mx-auto mb-4 text-[var(--gold-4)] opacity-50" />
        <h3 className="text-xl font-[var(--font-beaufort)] text-[var(--gold-2)] mb-2">No Enemy Data</h3>
        <p className="text-sm text-[var(--muted)]">Configure an enemy team to see pre-match intel.</p>
      </div>
    );
  }

  // Calculate playstyle indicators
  const objectives = teamData.objectives;
  const averages = teamData.gameAverages;
  
  // Aggression score (0-100)
  const fbRate = objectives?.firstBloodRate ?? 0;
  const avgKills = averages?.avgKills ?? 0;
  const avgDuration = averages?.avgDuration ?? 30;
  const killsPerMin = avgKills / Math.max(avgDuration, 1);
  const aggressionScore = Math.min(100, Math.max(0, (fbRate * 0.4 + killsPerMin * 15 + (objectives?.firstTowerRate ?? 0) * 0.3) * 100 / 100));
  
  // Objective control score
  const dragonRate = objectives?.firstDragonRate ?? 0;
  const baronRate = objectives?.firstBaronRate ?? 0;
  const towerRate = objectives?.firstTowerRate ?? 0;
  const objectiveScore = Math.min(100, (dragonRate * 0.4 + baronRate * 0.3 + towerRate * 0.3) * 100);
  
  // Vision control estimate (from vision score)
  const avgVision = averages?.avgVisionScore ?? 0;
  const visionScore = Math.min(100, avgVision / 2.5);
  
  // Game length preference
  const durationStyle = avgDuration <= 28 ? 'FAST' : avgDuration >= 35 ? 'SLOW' : 'STANDARD';
  
  // Playstyle determination
  const playstyle = aggressionScore >= 65 ? 'AGGRESSIVE' : aggressionScore <= 35 ? 'PASSIVE' : 'BALANCED';
  const playstyleColor = playstyle === 'AGGRESSIVE' ? 'text-[var(--red-3)]' : playstyle === 'PASSIVE' ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]';

  return (
    <div className="space-y-6">
      {/* Header with team info */}
      <div className="hextech-border-red overflow-hidden">
        <div className="relative p-6 bg-gradient-to-r from-[var(--red-6)] via-[var(--hextech-black)] to-transparent">
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--red-4)]/30" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--red-4)]/30" />
          
          <div className="flex items-center gap-6">
            {teamConfig?.logoUrl ? (
              <div className="relative w-24 h-24">
                <img src={teamConfig.logoUrl} alt={teamConfig.name} className="w-full h-full object-contain" />
                <div className="absolute inset-0 blur-xl bg-[var(--red-4)] opacity-20 -z-10" />
              </div>
            ) : (
              <div className="w-24 h-24 hextech-border-red bg-[var(--red-6)]/30 flex items-center justify-center">
                <Skull className="w-12 h-12 text-[var(--red-3)]" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                <Eye className="w-3 h-3 text-[var(--red-3)]" />ENEMY SCOUTING REPORT
              </div>
              <h2 className="text-3xl font-[var(--font-beaufort)] font-black text-red-glow mb-2">
                {teamConfig?.name || teamData.teamName}
              </h2>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-[var(--muted)]">Record: </span>
                  <span className="font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">{teamData.seriesWins}W - {teamData.seriesLosses}L</span>
                  <span className={`ml-2 font-bold ${teamData.seriesWinRate >= 50 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
                    ({teamData.seriesWinRate.toFixed(0)}%)
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Games: </span>
                  <span className="font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">{teamData.gamesPlayed}</span>
                </div>
              </div>
            </div>
            
            {/* Playstyle Badge */}
            <div className="text-center">
              <div className={`text-4xl font-[var(--font-beaufort)] font-black ${playstyleColor}`}>
                {playstyle}
              </div>
              <div className="text-[9px] text-[var(--muted)] uppercase tracking-[0.2em]">Playstyle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Aggression Meter */}
        <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--red-3)]" />
              <span className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">AGGRESSION</span>
            </div>
            <span className={`text-2xl font-[var(--font-beaufort)] font-black ${aggressionScore >= 60 ? 'text-[var(--red-3)]' : aggressionScore >= 40 ? 'text-[var(--gold-2)]' : 'text-[var(--blue-2)]'}`}>
              {aggressionScore.toFixed(0)}
            </span>
          </div>
          <div className="h-3 bg-[var(--hextech-black)] border border-[var(--gold-5)]/30 overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[var(--blue-3)] via-[var(--gold-3)] to-[var(--red-4)] transition-all duration-700"
              style={{ width: `${aggressionScore}%` }}
            />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">First Blood Rate</span>
              <span className={`font-bold ${fbRate >= 55 ? 'text-[var(--red-3)]' : 'text-[var(--gold-2)]'}`}>{fbRate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Avg Kills/Game</span>
              <span className="font-bold text-[var(--gold-2)]">{avgKills.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">First Tower Rate</span>
              <span className={`font-bold ${(objectives?.firstTowerRate ?? 0) >= 55 ? 'text-[var(--red-3)]' : 'text-[var(--gold-2)]'}`}>{(objectives?.firstTowerRate ?? 0).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Objective Control */}
        <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[var(--gold-3)]" />
              <span className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">OBJECTIVE CONTROL</span>
            </div>
            <span className={`text-2xl font-[var(--font-beaufort)] font-black ${objectiveScore >= 60 ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]'}`}>
              {objectiveScore.toFixed(0)}
            </span>
          </div>
          <div className="h-3 bg-[var(--hextech-black)] border border-[var(--gold-5)]/30 overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[var(--gold-5)] to-[var(--gold-2)] transition-all duration-700"
              style={{ width: `${objectiveScore}%` }}
            />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">First Dragon</span>
              <span className={`font-bold ${dragonRate >= 55 ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]'}`}>{dragonRate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">First Baron</span>
              <span className={`font-bold ${baronRate >= 55 ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]'}`}>{baronRate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Avg Dragons/Game</span>
              <span className="font-bold text-[var(--gold-2)]">{(objectives?.avgDragons ?? 0).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Game Tempo */}
        <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--blue-2)]" />
              <span className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">GAME TEMPO</span>
            </div>
            <span className={`text-lg font-[var(--font-beaufort)] font-black ${durationStyle === 'FAST' ? 'text-[var(--red-3)]' : durationStyle === 'SLOW' ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]'}`}>
              {durationStyle}
            </span>
          </div>
          <div className="text-center mb-3">
            <div className="text-4xl font-[var(--font-beaufort)] font-black text-[var(--gold-1)] tabular-nums">
              {avgDuration.toFixed(1)}<span className="text-lg text-[var(--muted)]">m</span>
            </div>
            <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Avg Duration</div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Avg Gold Diff</span>
              <span className={`font-bold ${(averages?.avgGoldDiff ?? 0) >= 0 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
                {(averages?.avgGoldDiff ?? 0) >= 0 ? '+' : ''}{((averages?.avgGoldDiff ?? 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Vision Score</span>
              <span className="font-bold text-[var(--gold-2)]">{avgVision.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Preference & Win Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
          <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--gold-3)]" />SIDE PREFERENCE
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[var(--blue-6)]/30 border border-[var(--blue-4)]/30">
              <div className="text-3xl font-[var(--font-beaufort)] font-black text-[var(--blue-2)] tabular-nums">
                {teamData.sideStats?.blueWinRate?.toFixed(0) ?? '—'}%
              </div>
              <div className="text-[9px] text-[var(--blue-3)] uppercase tracking-wider">Blue Side WR</div>
              <div className="text-[10px] text-[var(--muted)] mt-1">
                {teamData.sideStats?.blueWins ?? 0}W - {teamData.sideStats?.blueLosses ?? 0}L
              </div>
            </div>
            <div className="text-center p-4 bg-[var(--red-6)]/30 border border-[var(--red-4)]/30">
              <div className="text-3xl font-[var(--font-beaufort)] font-black text-[var(--red-3)] tabular-nums">
                {teamData.sideStats?.redWinRate?.toFixed(0) ?? '—'}%
              </div>
              <div className="text-[9px] text-[var(--red-3)] uppercase tracking-wider">Red Side WR</div>
              <div className="text-[10px] text-[var(--muted)] mt-1">
                {teamData.sideStats?.redWins ?? 0}W - {teamData.sideStats?.redLosses ?? 0}L
              </div>
            </div>
          </div>
          {teamData.sideStats && (
            <div className="mt-4 p-3 bg-[var(--hextech-black)]/50 border border-[var(--gold-5)]/20">
              <div className="flex items-center gap-2 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-[var(--gold-3)]" />
                <span className="text-[var(--gold-1)]">
                  {(teamData.sideStats.blueWinRate - teamData.sideStats.redWinRate) > 10
                    ? 'Strong blue side preference — consider forcing red side'
                    : (teamData.sideStats.redWinRate - teamData.sideStats.blueWinRate) > 10
                      ? 'Strong red side preference — consider forcing blue side'
                      : 'No significant side preference detected'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Key Threats / Comfort Picks */}
        <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
          <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--red-3)]" />KEY THREATS TO BAN
          </h3>
          <div className="space-y-2">
            {teamData.mostPicked?.slice(0, 5).map((champ, i) => {
              const champion = getChampionByName(champ.name);
              const threat = champ.winRate >= 60 ? 'HIGH' : champ.winRate >= 50 ? 'MEDIUM' : 'LOW';
              const threatColor = threat === 'HIGH' ? 'text-[var(--red-3)]' : threat === 'MEDIUM' ? 'text-[var(--gold-2)]' : 'text-[var(--muted)]';
              return (
                <div key={i} className="flex items-center gap-3 p-2 bg-[var(--hextech-black)]/30 border border-[var(--gold-5)]/20 hover:border-[var(--red-4)]/50 transition-colors">
                  {champion ? (
                    <img src={champion.imageUrl} alt={champ.name} className="w-10 h-10 border border-[var(--gold-4)]" />
                  ) : (
                    <div className="w-10 h-10 bg-[var(--hextech-metal)] border border-[var(--gold-4)] flex items-center justify-center text-xs">{champ.name.slice(0, 2)}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">{champ.name}</span>
                      <span className={`text-[9px] font-bold ${threatColor}`}>{threat} THREAT</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
                      <span>{champ.count} games</span>
                      <span className={champ.winRate >= 60 ? 'text-[var(--red-3)]' : champ.winRate >= 50 ? 'text-[var(--blue-2)]' : ''}>{champ.winRate.toFixed(0)}% WR</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!teamData.mostPicked || teamData.mostPicked.length === 0) && (
              <div className="text-center text-[var(--muted)] py-4">No champion data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Player Breakdown */}
      {teamData.players && teamData.players.length > 0 && (
        <div className="hextech-border overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--gold-5)]/20 bg-[var(--hextech-metal)]/30">
            <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />PLAYER BREAKDOWN
            </h3>
          </div>
          <div className="divide-y divide-[var(--gold-5)]/10">
            {teamData.players.map((player, i) => (
              <PlayerScoutCard key={i} player={player} />
            ))}
          </div>
        </div>
      )}

      {/* Tactical Recommendations */}
      <div className="hextech-border p-5 bg-gradient-to-b from-[var(--hextech-metal)]/30 to-transparent">
        <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-[var(--gold-1)] mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-[var(--gold-3)]" />TACTICAL RECOMMENDATIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {generateTacticalRecommendations(teamData, aggressionScore, objectiveScore, durationStyle).map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[var(--hextech-black)]/30 border border-[var(--gold-5)]/20">
              <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${rec.type === 'danger' ? 'bg-[var(--red-5)]' : rec.type === 'opportunity' ? 'bg-[var(--blue-4)]' : 'bg-[var(--gold-4)]'}`}>
                {rec.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-white" /> : rec.type === 'opportunity' ? <Target className="w-4 h-4 text-white" /> : <Lightbulb className="w-4 h-4 text-[var(--hextech-black)]" />}
              </div>
              <div>
                <div className={`text-xs font-[var(--font-beaufort)] font-bold ${rec.type === 'danger' ? 'text-[var(--red-3)]' : rec.type === 'opportunity' ? 'text-[var(--blue-2)]' : 'text-[var(--gold-2)]'}`}>
                  {rec.title}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">{rec.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      {teamData.recentMatches && teamData.recentMatches.length > 0 && (
        <div className="hextech-border overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--gold-5)]/20 bg-[var(--hextech-metal)]/30">
            <h3 className="text-sm font-[var(--font-beaufort)] font-bold text-gold-glow tracking-wider flex items-center gap-2">
              <History className="w-4 h-4" />RECENT MATCHES
              <span className="text-[9px] text-[var(--muted)] font-[var(--font-spiegel)] ml-2">
                Last {teamData.recentMatches.length} series
              </span>
            </h3>
          </div>
          <div className="divide-y divide-[var(--gold-5)]/10 max-h-[500px] overflow-y-auto">
            {teamData.recentMatches.slice(0, 10).map((match, i) => (
              <EnemyMatchCard key={i} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EnemyMatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false);
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className={`border-l-2 ${match.won ? 'border-l-[var(--blue-3)]' : 'border-l-[var(--red-4)]'} transition-colors hover:bg-[var(--hextech-metal)]/10`}>
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xl font-[var(--font-beaufort)] font-black ${match.won ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
              {match.won ? 'W' : 'L'}
            </span>
            <div>
              <div className="text-sm text-[var(--gold-1)]">vs {match.opponent}</div>
              <div className="text-[10px] text-[var(--muted)]">
                {formatDate(match.date)} {match.tournament && `• ${match.tournament}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-[var(--font-beaufort)] text-[var(--gold-2)]">{match.score}</span>
            <div className="flex gap-1">
              {match.games?.map((g, i) => (
                <div 
                  key={i} 
                  className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold ${g.won ? 'bg-[var(--blue-5)] text-[var(--blue-1)]' : 'bg-[var(--red-5)] text-[var(--red-2)]'}`}
                  title={`Game ${g.gameNumber}: ${g.won ? 'W' : 'L'} - ${g.side} side`}
                >
                  {g.gameNumber}
                </div>
              ))}
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
          </div>
        </div>
      </div>

      {expanded && match.games && match.games.length > 0 && (
        <div className="border-t border-[var(--gold-5)]/20 divide-y divide-[var(--gold-5)]/10">
          {match.games.map((game) => (
            <div key={game.gameNumber} className="p-3 bg-[var(--hextech-black)]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-[var(--font-beaufort)] font-bold ${game.won ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}`}>
                    Game {game.gameNumber} - {game.won ? 'WIN' : 'LOSS'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 ${game.side === 'blue' ? 'bg-[var(--blue-5)]/50 text-[var(--blue-2)]' : 'bg-[var(--red-5)]/50 text-[var(--red-2)]'}`}>
                    {game.side.toUpperCase()} SIDE
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
                  <span>{game.kills}/{game.deaths} K/D</span>
                  <span className={game.goldDiff >= 0 ? 'text-[var(--blue-2)]' : 'text-[var(--red-3)]'}>
                    {game.goldDiff >= 0 ? '+' : ''}{(game.goldDiff / 1000).toFixed(1)}k Gold
                  </span>
                  <span>{game.duration}m</span>
                </div>
              </div>

              {game.draft && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Enemy Team (this is them) */}
                  <div className={`p-2 border ${game.side === 'blue' ? 'border-[var(--blue-4)]/30' : 'border-[var(--red-5)]/30'}`}>
                    <div className={`text-[9px] uppercase tracking-wider mb-2 ${game.side === 'blue' ? 'text-[var(--blue-3)]' : 'text-[var(--red-3)]'}`}>
                      Their Draft ({game.side.toUpperCase()})
                    </div>
                    <div className="mb-2">
                      <div className="text-[8px] text-[var(--muted)] mb-1">PICKS</div>
                      <div className="flex gap-1 flex-wrap">
                        {game.draft.teamPicks.length > 0 
                          ? game.draft.teamPicks.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="pick" />)
                          : <span className="text-[9px] text-[var(--muted)]">No data</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-[var(--muted)] mb-1">BANS</div>
                      <div className="flex gap-1 flex-wrap">
                        {game.draft.teamBans.length > 0 
                          ? game.draft.teamBans.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="ban" />)
                          : <span className="text-[9px] text-[var(--muted)]">No data</span>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Their Opponent */}
                  <div className={`p-2 border ${game.side === 'blue' ? 'border-[var(--red-5)]/30' : 'border-[var(--blue-4)]/30'}`}>
                    <div className={`text-[9px] uppercase tracking-wider mb-2 ${game.side === 'blue' ? 'text-[var(--red-3)]' : 'text-[var(--blue-3)]'}`}>
                      Opponent ({game.side === 'blue' ? 'RED' : 'BLUE'})
                    </div>
                    <div className="mb-2">
                      <div className="text-[8px] text-[var(--muted)] mb-1">PICKS</div>
                      <div className="flex gap-1 flex-wrap">
                        {game.draft.opponentPicks.length > 0 
                          ? game.draft.opponentPicks.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="pick" />)
                          : <span className="text-[9px] text-[var(--muted)]">No data</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-[var(--muted)] mb-1">BANS</div>
                      <div className="flex gap-1 flex-wrap">
                        {game.draft.opponentBans.length > 0 
                          ? game.draft.opponentBans.map((champ, i) => <ChampionMiniIcon key={i} name={champ} type="ban" />)
                          : <span className="text-[9px] text-[var(--muted)]">No data</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerScoutCard({ player }: { player: TeamData['players'][0] }) {
  const topChamps = player.champions?.slice(0, 3) || [];
  const kda = player.avgKDA ?? 0;
  const kdaColor = kda >= 4 ? 'text-[var(--blue-2)]' : kda >= 2.5 ? 'text-[var(--gold-2)]' : 'text-[var(--red-3)]';

  return (
    <div className="p-4 hover:bg-[var(--hextech-metal)]/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-[var(--font-beaufort)] font-bold text-[var(--gold-1)]">{player.name}</span>
            <span className={`text-sm font-[var(--font-beaufort)] font-black ${kdaColor}`}>{kda.toFixed(2)} KDA</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
            <span>{player.gamesPlayed} games</span>
            <span>{player.avgKills?.toFixed(1)}/{player.avgDeaths?.toFixed(1)}/{player.avgAssists?.toFixed(1)}</span>
            <span>{((player.winRate ?? 0)).toFixed(0)}% WR</span>
            {player.firstBloodParticipation > 0 && (
              <span className={player.firstBloodParticipation >= 40 ? 'text-[var(--red-3)]' : ''}>
                {player.firstBloodParticipation.toFixed(0)}% FB participation
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {topChamps.map((champ, i) => {
            const champion = getChampionByName(champ.name);
            return (
              <div key={i} className="text-center" title={`${champ.name}: ${champ.games}G, ${champ.winRate.toFixed(0)}% WR`}>
                {champion ? (
                  <img src={champion.imageUrl} alt={champ.name} className="w-10 h-10 border border-[var(--gold-5)]" />
                ) : (
                  <div className="w-10 h-10 bg-[var(--hextech-metal)] border border-[var(--gold-5)] flex items-center justify-center text-[8px]">{champ.name.slice(0, 3)}</div>
                )}
                <div className="text-[8px] text-[var(--muted)] mt-0.5">{champ.games}G</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateTacticalRecommendations(teamData: TeamData, aggression: number, objective: number, tempo: string): Array<{ type: 'danger' | 'opportunity' | 'tip'; title: string; description: string }> {
  const recs: Array<{ type: 'danger' | 'opportunity' | 'tip'; title: string; description: string }> = [];

  // Aggression-based
  if (aggression >= 65) {
    recs.push({ type: 'danger', title: 'Early Aggression Expected', description: 'This team plays aggressively early. Draft stability and avoid early coinflips.' });
    recs.push({ type: 'opportunity', title: 'Punish Overaggression', description: 'Set up vision for counterganks and punish dives with CC-heavy picks.' });
  } else if (aggression <= 35) {
    recs.push({ type: 'opportunity', title: 'Early Game Window', description: 'This team is passive early. Draft early game champions to snowball.' });
  }

  // Objective-based
  if (objective >= 60) {
    recs.push({ type: 'danger', title: 'Strong Objective Control', description: 'They prioritize objectives. Contest or trade, don\'t give them for free.' });
  } else if (objective <= 40) {
    recs.push({ type: 'opportunity', title: 'Objective Weakness', description: 'They struggle with objective control. Prioritize dragon stacking and soul.' });
  }

  // Tempo-based
  if (tempo === 'FAST') {
    recs.push({ type: 'tip', title: 'Short Game Expectation', description: 'They close games fast. Draft scaling carefully or match their tempo.' });
  } else if (tempo === 'SLOW') {
    recs.push({ type: 'tip', title: 'Long Game Team', description: 'They prefer longer games. Consider early pressure comps to end before they scale.' });
  }

  // Side preference
  const sideStats = teamData.sideStats;
  if (sideStats) {
    const bluePref = sideStats.blueWinRate - sideStats.redWinRate;
    if (bluePref > 12) {
      recs.push({ type: 'tip', title: 'Blue Side Dependent', description: `${bluePref.toFixed(0)}% higher WR on blue. Force them to red if possible.` });
    } else if (bluePref < -12) {
      recs.push({ type: 'tip', title: 'Red Side Dependent', description: `${Math.abs(bluePref).toFixed(0)}% higher WR on red. Force them to blue if possible.` });
    }
  }

  // Champion pool
  const highWRChamps = teamData.mostPicked?.filter(c => c.winRate >= 65 && c.count >= 3) || [];
  if (highWRChamps.length > 0) {
    recs.push({ type: 'danger', title: 'Must-Ban Champions', description: `High priority bans: ${highWRChamps.slice(0, 3).map(c => c.name).join(', ')}` });
  }

  // Ensure we have at least 4 recommendations
  if (recs.length < 4) {
    recs.push({ type: 'tip', title: 'Standard Preparation', description: 'Focus on your own win conditions and draft comfort picks.' });
  }

  return recs.slice(0, 6);
}
