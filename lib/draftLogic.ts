import { DraftState } from './types';

export const DRAFT_ORDER: { type: 'PICK' | 'BAN'; side: 'BLUE' | 'RED' }[] = [
  // Phase 1 Bans
  { type: 'BAN', side: 'BLUE' },
  { type: 'BAN', side: 'RED' },
  { type: 'BAN', side: 'BLUE' },
  { type: 'BAN', side: 'RED' },
  { type: 'BAN', side: 'BLUE' },
  { type: 'BAN', side: 'RED' },
  // Phase 1 Picks
  { type: 'PICK', side: 'BLUE' },
  { type: 'PICK', side: 'RED' },
  { type: 'PICK', side: 'RED' },
  { type: 'PICK', side: 'BLUE' },
  { type: 'PICK', side: 'BLUE' },
  { type: 'PICK', side: 'RED' },
  // Phase 2 Bans
  { type: 'BAN', side: 'RED' },
  { type: 'BAN', side: 'BLUE' },
  { type: 'BAN', side: 'RED' },
  { type: 'BAN', side: 'BLUE' },
  // Phase 2 Picks
  { type: 'PICK', side: 'RED' },
  { type: 'PICK', side: 'BLUE' },
  { type: 'PICK', side: 'BLUE' },
  { type: 'PICK', side: 'RED' },
];

export const INITIAL_DRAFT_STATE: DraftState = {
  bluePicks: [],
  blueBans: [],
  redPicks: [],
  redBans: [],
  currentTurn: 0,
  isFinished: false,
  timings: [],
  draftStartTime: undefined,
};

export function getNextAction(currentTurn: number) {
  if (currentTurn >= DRAFT_ORDER.length) return null;
  return DRAFT_ORDER[currentTurn];
}
