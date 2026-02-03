'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TeamConfig } from '@/lib/context/DraftConfigContext';
import { X, ChevronDown, Globe } from 'lucide-react';
import { CURATED_TEAMS, CuratedTeam, REGIONS, REGION_NAMES, searchCuratedTeams } from '@/lib/data/curatedTeams';

interface TeamSearchProps {
  onSelect: (team: TeamConfig) => void;
  selectedTeam: TeamConfig | null;
  excludeTeamId?: string;
  side: 'blue' | 'red';
  label: string;
}

export function TeamSearch({ onSelect, selectedTeam, excludeTeamId, side, label }: TeamSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<CuratedTeam['region'] | 'ALL'>('ALL');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter teams based on query, region, and excluded team
  const filteredTeams = useMemo(() => {
    let teams: CuratedTeam[];
    
    if (query.trim()) {
      // If searching, search across all teams
      teams = searchCuratedTeams(query);
    } else if (selectedRegion === 'ALL') {
      teams = CURATED_TEAMS;
    } else {
      teams = CURATED_TEAMS.filter(t => t.region === selectedRegion);
    }
    
    // Exclude already selected team
    return teams.filter(team => team.id !== excludeTeamId);
  }, [query, selectedRegion, excludeTeamId]);

  // Group teams by region for display when not searching
  const groupedTeams = useMemo(() => {
    if (query.trim()) {
      // When searching, don't group
      return null;
    }
    
    if (selectedRegion !== 'ALL') {
      // When a specific region is selected, don't group
      return null;
    }
    
    // Group by region
    const groups: Record<string, CuratedTeam[]> = {};
    for (const region of REGIONS) {
      const regionTeams = filteredTeams.filter(t => t.region === region);
      if (regionTeams.length > 0) {
        groups[region] = regionTeams;
      }
    }
    return groups;
  }, [filteredTeams, query, selectedRegion]);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredTeams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]') as HTMLElement;
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (team: CuratedTeam) => {
    onSelect({
      id: team.id,
      name: team.name,
      nameShortened: team.nameShortened,
      logoUrl: team.logoUrl,
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null as unknown as TeamConfig);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredTeams.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTeams[highlightedIndex]) {
          handleSelect(filteredTeams[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const sideColors = {
    blue: {
      border: 'border-[var(--blue-4)]',
      bg: 'bg-[var(--blue-7)]/20',
      text: 'text-[var(--blue-2)]',
      accent: 'var(--blue-4)',
    },
    red: {
      border: 'border-[var(--red-4)]',
      bg: 'bg-[var(--red-6)]/20',
      text: 'text-[var(--red-3)]',
      accent: 'var(--red-4)',
    },
  };

  const colors = sideColors[side];

  // Render a single team item
  const renderTeamItem = (team: CuratedTeam, flatIndex: number) => {
    const isHighlighted = flatIndex === highlightedIndex;
    
    return (
      <button
        key={team.id}
        data-highlighted={isHighlighted}
        onClick={() => handleSelect(team)}
        onMouseEnter={() => setHighlightedIndex(flatIndex)}
        className="w-full flex items-center gap-3 p-3 transition-colors text-left"
        style={{ backgroundColor: isHighlighted ? '#2a2a3e' : '#0a0a0f' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
        onMouseOut={(e) => { if (!isHighlighted) e.currentTarget.style.backgroundColor = '#0a0a0f'; }}
      >
        {team.logoUrl ? (
          <img 
            src={team.logoUrl} 
            alt={team.name}
            className="w-8 h-8 object-contain flex-shrink-0"
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-[var(--hextech-metal)] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-[var(--muted)]">
              {team.nameShortened?.substring(0, 2) || team.name.substring(0, 2)}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm text-[var(--gold-1)] truncate">{team.name}</div>
          <div className="text-xs text-[var(--muted)] truncate">{team.nameShortened}</div>
        </div>
        <span 
          className="text-xs text-[var(--muted-dark)] px-2 py-0.5 rounded"
          style={{ backgroundColor: '#1e1e2e' }}
        >
          {team.region}
        </span>
      </button>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${colors.text}`}>
        {label}
      </label>

      {/* Selected Team Display */}
      {selectedTeam ? (
        <div className={`flex items-center gap-3 p-3 border ${colors.border} ${colors.bg} rounded`}>
          {selectedTeam.logoUrl && (
            <img 
              src={selectedTeam.logoUrl} 
              alt={selectedTeam.name}
              className="w-12 h-12 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[var(--gold-1)] truncate">{selectedTeam.name}</div>
            {selectedTeam.nameShortened && (
              <div className="text-xs text-[var(--muted)] truncate">{selectedTeam.nameShortened}</div>
            )}
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            title="Remove team"
          >
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>
      ) : (
        /* Combobox Input */
        <div className="relative">
          <div className={`flex items-center border ${colors.border} rounded bg-[var(--hextech-black)] overflow-hidden`}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Select or search team..."
              className="flex-1 p-3 bg-transparent text-[var(--gold-1)] placeholder-[var(--muted-dark)]
                         focus:outline-none"
            />
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                inputRef.current?.focus();
              }}
              className="p-3 hover:bg-white/5 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div 
              className="absolute z-50 w-full mt-1 border border-[var(--gold-5)]/30 
                         rounded shadow-xl overflow-hidden"
              style={{ backgroundColor: '#0a0a0f' }}
            >
              {/* Region Filter Tabs */}
              <div className="flex border-b border-[var(--gold-5)]/20 overflow-x-auto" style={{ backgroundColor: '#0e0e15' }}>
                <button
                  onClick={() => setSelectedRegion('ALL')}
                  className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1
                    ${selectedRegion === 'ALL' 
                      ? 'text-[var(--gold-1)] border-b-2 border-[var(--gold-4)]' 
                      : 'text-[var(--muted)] hover:text-[var(--gold-3)]'
                    }`}
                >
                  <Globe className="w-3 h-3" />
                  All
                </button>
                {REGIONS.map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap
                      ${selectedRegion === region 
                        ? 'text-[var(--gold-1)] border-b-2 border-[var(--gold-4)]' 
                        : 'text-[var(--muted)] hover:text-[var(--gold-3)]'
                      }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Team List */}
              <div 
                ref={listRef}
                className="max-h-64 overflow-y-auto"
                style={{ backgroundColor: '#0a0a0f' }}
              >
                {filteredTeams.length === 0 ? (
                  <div className="p-3 text-sm text-[var(--muted)]">
                    No teams found
                  </div>
                ) : groupedTeams ? (
                  // Grouped by region
                  (() => {
                    let flatOffset = 0;
                    return Object.entries(groupedTeams).map(([region, teams]) => {
                      const currentOffset = flatOffset;
                      flatOffset += teams.length;
                      
                      return (
                        <div key={region}>
                          <div 
                            className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--gold-4)] sticky top-0"
                            style={{ backgroundColor: '#1a1a2e' }}
                          >
                            {REGION_NAMES[region as CuratedTeam['region']]}
                          </div>
                          {teams.map((team, idx) => renderTeamItem(team, currentOffset + idx))}
                        </div>
                      );
                    });
                  })()
                ) : (
                  // Flat list (when searching or specific region selected)
                  filteredTeams.map((team, index) => renderTeamItem(team, index))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeamSearch;
