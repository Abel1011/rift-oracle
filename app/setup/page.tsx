'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TeamSearch } from '@/components/TeamSearch';
import { useDraftConfig } from '@/lib/context/DraftConfigContext';
import { ArrowLeftRight, Shield, Sword, Zap, ArrowRight } from 'lucide-react';

// Star field component - creates a drifting star effect
interface StarProps {
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
}

const Star = ({ size, left, top, duration, delay, opacity }: StarProps) => (
  <div 
    className="absolute rounded-full bg-[var(--gold-3)] star-drift"
    style={{ 
      width: size, 
      height: size, 
      left: `${left}%`, 
      top: `${top}%`,
      opacity,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      boxShadow: size > 2 ? `0 0 ${size * 2}px rgba(200, 170, 110, 0.3)` : 'none'
    }}
  />
);

// Generate stars once to avoid re-renders
const generateStars = (count: number): StarProps[] => {
  return Array.from({ length: count }, () => ({
    size: Math.random() * 3 + 1,
    left: Math.random() * 120, // Start beyond screen to account for movement
    top: Math.random() * 100,
    duration: 15 + Math.random() * 25, // 15-40 seconds - faster movement
    delay: Math.random() * -30, // Varied starting positions
    opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7 - more visible
  }));
};

export default function SetupPage() {
  const router = useRouter();
  const { config, setBlueTeam, setRedTeam, swapTeams } = useDraftConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // Memoize stars so they don't regenerate on every render
  const stars = useMemo(() => generateStars(50), []);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleStartDraft = () => {
    if (config.blueTeam && config.redTeam) {
      setIsAnimating(true);
      setTimeout(() => router.push('/draft'), 800);
    }
  };

  const bothTeamsSelected = config.blueTeam && config.redTeam;

  return (
    <div className={`min-h-screen bg-[var(--hextech-black)] flex flex-col overflow-hidden transition-opacity duration-500 ${isAnimating ? 'opacity-0 scale-105' : 'opacity-100'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--gold-3)] opacity-[0.03] blur-[150px] rounded-full" />
        
        {/* Blue side glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--blue-4)] opacity-[0.08] blur-[120px] rounded-full -translate-x-1/2" />
        
        {/* Red side glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--red-4)] opacity-[0.08] blur-[120px] rounded-full translate-x-1/2" />
        
        {/* Drifting star field */}
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <Star key={i} {...star} />
          ))}
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `
              linear-gradient(var(--gold-4) 1px, transparent 1px),
              linear-gradient(90deg, var(--gold-4) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* ===== HEADER ===== */}
      <header className={`relative h-16 sm:h-20 md:h-24 border-b border-[var(--gold-5)] bg-gradient-to-b from-[var(--hextech-metal)] to-transparent z-10 
        transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold-3)] to-transparent" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold-4)] to-transparent" />
        
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-[var(--gold-3)] rotate-45 bg-gradient-to-br from-[var(--gold-5)]/30 to-transparent" />
                <div className="absolute inset-1 sm:inset-1.5 border border-[var(--gold-4)] rotate-45" />
                <span className="relative text-[var(--gold-2)] font-[var(--font-beaufort)] font-black text-base sm:text-lg md:text-xl tracking-tighter">C9</span>
              </div>
              <div className="absolute inset-0 blur-xl bg-[var(--gold-3)]/30 -z-10" />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl md:text-2xl font-[var(--font-beaufort)] font-bold tracking-wider">
                <span className="text-gold-glow">DRAFT</span>
                <span className="text-[var(--gold-1)] ml-1 sm:ml-2 hidden xs:inline">SIMULATOR</span>
              </h1>
              <div className="hidden sm:flex items-center gap-2 mt-0.5 md:mt-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--gold-3)] blink" />
                <span className="text-[9px] md:text-[11px] text-[var(--muted)] font-[var(--font-spiegel)] font-medium tracking-[0.15em] md:tracking-[0.2em] uppercase">
                  Powered by GRID
                </span>
              </div>
            </div>
          </div>

          {/* Hackathon Badge */}
          <div className="hextech-border px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 hidden sm:flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[var(--blue-3)] to-[var(--gold-3)] flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-white">☁️</span>
            </div>
            <div className="text-[10px] sm:text-xs">
              <div className="text-[var(--gold-2)] font-bold tracking-wider">SKY&apos;S THE LIMIT</div>
              <div className="text-[var(--muted)] text-[8px] sm:text-[10px] hidden md:block">Cloud9 x JetBrains Hackathon</div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-12 z-10 overflow-y-auto">
        
        {/* Title Section */}
        <div className={`text-center mb-6 sm:mb-8 md:mb-12 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-gradient-to-r from-transparent to-[var(--gold-4)]" />
            <span className="text-[var(--gold-4)] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] font-bold">MATCH CONFIGURATION</span>
            <div className="h-[1px] w-8 sm:w-12 md:w-16 bg-gradient-to-l from-transparent to-[var(--gold-4)]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[var(--font-beaufort)] font-bold mb-2 sm:mb-3">
            <span className="text-blue-glow">SELECT</span>
            <span className="text-[var(--gold-1)] mx-2 sm:mx-3">YOUR</span>
            <span className="text-red-glow">TEAMS</span>
          </h2>
          <p className="text-[var(--muted)] text-xs sm:text-sm max-w-xs sm:max-w-md mx-auto px-2">
            Choose two professional teams to simulate a draft with real historical data and AI-powered predictions.
          </p>
        </div>

        {/* Team Selection Arena */}
        <div className={`w-full max-w-6xl transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative">
            {/* VS Badge - Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--gold-4)] bg-[var(--hextech-black)] flex items-center justify-center shadow-[0_0_40px_rgba(200,170,110,0.3)]">
                  <span className="text-3xl font-[var(--font-beaufort)] font-black text-gold-glow">VS</span>
                </div>
                {/* Swap button below VS */}
                <button
                  onClick={swapTeams}
                  disabled={!config.blueTeam && !config.redTeam}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-[var(--gold-5)] 
                           bg-[var(--hextech-black)] flex items-center justify-center
                           hover:border-[var(--gold-3)] hover:bg-[var(--hextech-metal)] 
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                  title="Swap teams"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[var(--gold-4)] group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>

            {/* Team Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-16">
              
              {/* ===== BLUE TEAM CARD ===== */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--blue-4)] to-[var(--blue-2)] opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-lg" />
                
                <div className="relative hextech-border-blue bg-gradient-to-br from-[var(--blue-6)]/80 to-[var(--hextech-black)] p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--blue-3)] rounded-tl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--blue-3)] rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--blue-3)] rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--blue-3)] rounded-br" />
                  
                  {/* Side indicator */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:block">
                    <div className="w-6 h-32 bg-gradient-to-b from-transparent via-[var(--blue-3)] to-transparent opacity-50 rounded-full" />
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg border border-[var(--blue-3)] bg-gradient-to-br from-[var(--blue-4)]/50 to-transparent flex items-center justify-center">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--blue-2)]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-[var(--font-beaufort)] font-bold text-blue-glow tracking-wider">BLUE SIDE</h3>
                        <p className="text-[var(--blue-3)] text-[10px] sm:text-xs tracking-wide">First Pick Priority</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--blue-2)]">B1</div>
                    </div>
                  </div>
                  
                  {/* Team Search */}
                  <div className="mb-6">
                    <TeamSearch
                      onSelect={setBlueTeam}
                      selectedTeam={config.blueTeam}
                      excludeTeamId={config.redTeam?.id}
                      side="blue"
                      label="Select Team"
                    />
                  </div>
                  
                  {/* Team Info or Placeholder */}
                  <div className="min-h-[80px] sm:min-h-[90px] md:min-h-[100px]">
                    {config.blueTeam ? (
                      <div className="hextech-border p-3 sm:p-4 rounded animate-fade-in">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-[var(--muted)] mb-2">
                          <span>SELECTED TEAM</span>
                          <span className="text-[var(--blue-2)]">✓ READY</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          {config.blueTeam.logoUrl && (
                            <img src={config.blueTeam.logoUrl} alt="" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                          )}
                          <div>
                            <div className="text-base sm:text-lg font-bold text-[var(--gold-1)]">{config.blueTeam.name}</div>
                            {config.blueTeam.nameShortened && (
                              <div className="text-xs sm:text-sm text-[var(--muted)]">{config.blueTeam.nameShortened}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[var(--blue-4)]/30 rounded-lg p-4 sm:p-5 md:p-6 text-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full border-2 border-[var(--blue-4)]/30 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl opacity-30">🛡️</span>
                        </div>
                        <p className="text-[var(--muted)] text-xs sm:text-sm">Select a team to fill this slot</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== RED TEAM CARD ===== */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--red-4)] to-[var(--red-3)] opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-lg" />
                
                <div className="relative hextech-border-red bg-gradient-to-bl from-[var(--red-6)]/80 to-[var(--hextech-black)] p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--red-4)] rounded-tl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--red-4)] rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--red-4)] rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--red-4)] rounded-br" />
                  
                  {/* Side indicator */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                    <div className="w-6 h-32 bg-gradient-to-b from-transparent via-[var(--red-4)] to-transparent opacity-50 rounded-full" />
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg border border-[var(--red-4)] bg-gradient-to-br from-[var(--red-5)]/50 to-transparent flex items-center justify-center">
                        <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--red-3)]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-[var(--font-beaufort)] font-bold text-red-glow tracking-wider">RED SIDE</h3>
                        <p className="text-[var(--red-4)] text-[10px] sm:text-xs tracking-wide">Counter Pick Advantage</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--red-3)]">R1</div>
                    </div>
                  </div>
                  
                  {/* Team Search */}
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <TeamSearch
                      onSelect={setRedTeam}
                      selectedTeam={config.redTeam}
                      excludeTeamId={config.blueTeam?.id}
                      side="red"
                      label="Select Team"
                    />
                  </div>
                  
                  {/* Team Info or Placeholder */}
                  <div className="min-h-[80px] sm:min-h-[90px] md:min-h-[100px]">
                    {config.redTeam ? (
                      <div className="hextech-border p-3 sm:p-4 rounded animate-fade-in">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-[var(--muted)] mb-2">
                          <span>SELECTED TEAM</span>
                          <span className="text-[var(--red-3)]">✓ READY</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          {config.redTeam.logoUrl && (
                            <img src={config.redTeam.logoUrl} alt="" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                          )}
                          <div>
                            <div className="text-base sm:text-lg font-bold text-[var(--gold-1)]">{config.redTeam.name}</div>
                            {config.redTeam.nameShortened && (
                              <div className="text-xs sm:text-sm text-[var(--muted)]">{config.redTeam.nameShortened}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[var(--red-4)]/30 rounded-lg p-4 sm:p-5 md:p-6 text-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full border-2 border-[var(--red-4)]/30 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl opacity-30">⚔️</span>
                        </div>
                        <p className="text-[var(--muted)] text-xs sm:text-sm">Select a team to fill this slot</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile VS and Swap */}
            <div className="md:hidden flex flex-col items-center gap-2 my-4 sm:my-6">
              <span className="text-xl sm:text-2xl font-[var(--font-beaufort)] font-black text-gold-glow">VS</span>
              <button
                onClick={swapTeams}
                disabled={!config.blueTeam && !config.redTeam}
                className="hextech-button text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 disabled:opacity-30"
              >
                ↔ Swap Teams
              </button>
            </div>
          </div>
        </div>

        {/* Start Button Section - Only show when both teams selected */}
        {bothTeamsSelected && (
        <div className={`mt-6 sm:mt-8 md:mt-12 text-center transition-all duration-700 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={handleStartDraft}
            className="relative group px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 font-[var(--font-beaufort)] text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]
              transition-all duration-500 overflow-hidden cursor-pointer"
          >
            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold-5)] via-[var(--gold-3)] to-[var(--gold-5)]" />
            
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Border */}
            <div className="absolute inset-0 border-2 border-[var(--gold-2)]" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--gold-1)]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--gold-1)]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--gold-1)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--gold-1)]" />
            
            {/* Text */}
            <span className="relative flex items-center gap-2 sm:gap-3 text-[var(--hextech-black)]">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Enter the Arena</span>
              <span className="xs:hidden">Start</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_var(--gold-3),inset_0_0_30px_rgba(200,170,110,0.2)]" />
          </button>

          {/* Match preview */}
          <div className="mt-4 sm:mt-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 border border-[var(--gold-5)]/30 rounded-full bg-[var(--hextech-black)]/50">
              <span className="text-[var(--blue-2)] font-bold text-sm sm:text-base">{config.blueTeam?.nameShortened || config.blueTeam?.name}</span>
              <span className="text-[var(--gold-4)] text-sm sm:text-base">⚔️</span>
              <span className="text-[var(--red-3)] font-bold text-sm sm:text-base">{config.redTeam?.nameShortened || config.redTeam?.name}</span>
            </div>
            <p className="text-[var(--muted)] text-[10px] sm:text-xs mt-2 sm:mt-3 px-4">
              Historical data will be loaded for AI-powered draft predictions
            </p>
          </div>
        </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className={`relative border-t border-[var(--gold-5)]/20 py-3 sm:py-4 z-10 transition-all duration-700 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-[var(--muted-dark)]">
          <div className="order-2 sm:order-1">Draft Analysis Tool v2.0</div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
            <span>GRID API Connected</span>
          </div>
          <div className="order-3 hidden sm:block">© 2026 Cloud9 Hackathon Project</div>
        </div>
      </footer>
    </div>
  );
}
