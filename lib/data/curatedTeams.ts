/**
 * Curated list of professional LoL teams with verified GRID data
 * These are the major teams from LEC, LCS, LCK, LPL, LCP, and CBLOL
 * 
 * Teams without data in GRID have been excluded
 * Logos obtained from GRID API
 */

export interface CuratedTeam {
  id: string;
  name: string;
  nameShortened: string;
  logoUrl: string;
  region: 'LEC' | 'LCS' | 'LCK' | 'LPL' | 'CBLOL';
}

export const CURATED_TEAMS: CuratedTeam[] = [
  // ============== LEC (Europe) ==============
  {
    id: '47376',
    name: 'Fnatic',
    nameShortened: 'FNC',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/d5bd0cb8ca32672cd8608d2ad2cb039a',
    region: 'LEC'
  },
  {
    id: '47380',
    name: 'G2 Esports',
    nameShortened: 'G2',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/94a774753c28adb6602d3c36e428a849',
    region: 'LEC'
  },
  {
    id: '47619',
    name: 'Movistar KOI',
    nameShortened: 'MKOI',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/739e7667002e441bd2596ba7fecff107',
    region: 'LEC'
  },
  {
    id: '53165',
    name: 'Karmine Corp',
    nameShortened: 'KC',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/0c73991760c7d80df981a06e99c7cd51',
    region: 'LEC'
  },
  {
    id: '106',
    name: 'Rogue',
    nameShortened: 'RGE',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/9089f72e65b99e4b08e88815fffa5576',
    region: 'LEC'
  },
  {
    id: '353',
    name: 'SK Gaming',
    nameShortened: 'SK',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/c69f9b19774472b7b06d183c9de2a448',
    region: 'LEC'
  },
  {
    id: '47370',
    name: 'Team Vitality',
    nameShortened: 'VIT',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/195171114bca3c1f69136199f73fce14',
    region: 'LEC'
  },
  {
    id: '47435',
    name: 'Team Heretics',
    nameShortened: 'TH',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/64b4c8501ef44ba51648a38d131d9f2e',
    region: 'LEC'
  },

  // ============== LCS (North America) ==============
  {
    id: '47351',
    name: 'Cloud9',
    nameShortened: 'C9',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/f7d208601ddc141eb136d9aba8ae7156',
    region: 'LCS'
  },
  {
    id: '340',
    name: 'FlyQuest',
    nameShortened: 'FLY',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/c073b6e06dbed1d34d37fdcfdda85e4d',
    region: 'LCS'
  },
  {
    id: '47363',
    name: 'Team Liquid',
    nameShortened: 'TL',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/ff1be4367df4d5a7a47e8ce8353d1d46',
    region: 'LCS'
  },
  {
    id: '47497',
    name: '100 Thieves',
    nameShortened: '100T',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/5200f435d4391140826fada04936283c',
    region: 'LCS'
  },
  {
    id: '52541',
    name: 'NRG',
    nameShortened: 'NRG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/0d75debf25baf1d1c5eb26e8d4497cdf',
    region: 'LCS'
  },
  {
    id: '47499',
    name: 'Dignitas',
    nameShortened: 'DIG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/7562a16d59f1e163bf38214c552403d9',
    region: 'LCS'
  },
  {
    id: '53073',
    name: 'Shopify Rebellion',
    nameShortened: 'SR',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/25c81a9203d53e13e0dc9ab7d0dc35a0',
    region: 'LCS'
  },

  // ============== LCK (Korea) ==============
  {
    id: '47494',
    name: 'T1',
    nameShortened: 'T1',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/1e7311945adc58ac807ffcf10b18d002',
    region: 'LCK'
  },
  {
    id: '47558',
    name: 'Gen.G Esports',
    nameShortened: 'GEN',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/d2eded1af01ce76afb9540de0ef8b1d8',
    region: 'LCK'
  },
  {
    id: '407',
    name: 'KT Rolster',
    nameShortened: 'KT',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/a47aaabd94d8ee66fc22a6893a48f4ae',
    region: 'LCK'
  },
  {
    id: '406',
    name: 'Hanwha Life Esports',
    nameShortened: 'HLE',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/f6bbce9ba43dfbf1b50b6cde51fda71b',
    region: 'LCK'
  },
  {
    id: '48179',
    name: 'Dplus KIA',
    nameShortened: 'DK',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/1c4e991b3a2ec38bc188409b6dcf6427',
    region: 'LCK'
  },
  {
    id: '47961',
    name: 'DRX',
    nameShortened: 'DRX',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/6470bf630495e659e6120d516a2f790c',
    region: 'LCK'
  },
  {
    id: '4035',
    name: 'BNK FearX',
    nameShortened: 'BFX',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/0ee8dc4cac1c6b09c4b25b7cbefc2493',
    region: 'LCK'
  },
  {
    id: '52747',
    name: 'Nongshim RedForce',
    nameShortened: 'NS',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/15cf94cff3b13fd908e2b79576b8e6f0',
    region: 'LCK'
  },
  {
    id: '52817',
    name: 'BRION',
    nameShortened: 'BRO',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/8fcd5ca8c455d1173afc0815b7321b7a',
    region: 'LCK'
  },

  // ============== LPL (China) ==============
  {
    id: '20483',
    name: "Anyone's Legend",
    nameShortened: 'AL',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/3f900588a5d1bc22435de057b77c2963',
    region: 'LPL'
  },
  {
    id: '375',
    name: 'Top Esports',
    nameShortened: 'TES',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/0a3a4f1e3b62cc86bb86284a63e62521',
    region: 'LPL'
  },
  {
    id: '47472',
    name: 'Invictus Gaming',
    nameShortened: 'IG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/529571ab502100d6ad4cde6fda36c070',
    region: 'LPL'
  },
  {
    id: '52822',
    name: 'Weibo Gaming',
    nameShortened: 'WBG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/8383962348428abb759211ca64536c06',
    region: 'LPL'
  },
  {
    id: '52905',
    name: 'Ninjas in Pyjamas',
    nameShortened: 'NIP',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/ca79f71f4b21b081fa73eca82517dd18',
    region: 'LPL'
  },
  {
    id: '52910',
    name: "Xi'an Team WE",
    nameShortened: 'WE',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/610e999679cee0189eee94fd9921f728',
    region: 'LPL'
  },
  {
    id: '52726',
    name: 'LNG Esports',
    nameShortened: 'LNG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/e951d09e1ea35d65144abf78b15c7456',
    region: 'LPL'
  },
  {
    id: '47319',
    name: 'Royal Never Give Up',
    nameShortened: 'RNG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/aaf047a67b0e77d2c932c5ca7a44ad92',
    region: 'LPL'
  },
  {
    id: '47514',
    name: 'FunPlus Phoenix',
    nameShortened: 'FPX',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/bfba1ef33b3196cef656330864159955',
    region: 'LPL'
  },
  {
    id: '3113',
    name: 'Ultra Prime',
    nameShortened: 'UP',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/363f9a6c2cec06b86f2372ec4a0e6726',
    region: 'LPL'
  },
  {
    id: '369',
    name: 'Oh My God',
    nameShortened: 'OMG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/a523933dbb1d3d560def090b6276fcf8',
    region: 'LPL'
  },
  {
    id: '47922',
    name: 'Rare Atom',
    nameShortened: 'RA',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/61e11c0e5c2713338e7bfbac1b605a5e',
    region: 'LPL'
  },
  {
    id: '52606',
    name: 'ThunderTalk Gaming',
    nameShortened: 'TT',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/eb2b22333b15af55973d4f5dd03f83c1',
    region: 'LPL'
  },

  // ============== CBLOL (Brazil) ==============
  {
    id: '48173',
    name: 'Vivo Keyd Stars',
    nameShortened: 'VKS',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/5fc2be84ac533a23b4c47fe1a5f9b8a8',
    region: 'CBLOL'
  },
  {
    id: '47960',
    name: 'LOUD',
    nameShortened: 'LLL',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/c6b8fc94efc77793bf8a3bec217e9040',
    region: 'CBLOL'
  },
  {
    id: '52573',
    name: 'RED Canids',
    nameShortened: 'RED',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/81c89d9a51f0f48ad863031b7966267f',
    region: 'CBLOL'
  },
  {
    id: '3389',
    name: 'paiN Gaming',
    nameShortened: 'PNG',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/6e3304db2cad17630886f15a94c640e1',
    region: 'CBLOL'
  },
  {
    id: '47389',
    name: 'FURIA',
    nameShortened: 'FUR',
    logoUrl: 'https://cdn.grid.gg/assets/team-logos/cca64419f3775b0067e9244360474421',
    region: 'CBLOL'
  },
];

// Helper function to get teams by region
export function getTeamsByRegion(region: CuratedTeam['region']): CuratedTeam[] {
  return CURATED_TEAMS.filter(team => team.region === region);
}

// Helper function to search teams
export function searchCuratedTeams(query: string): CuratedTeam[] {
  const lowerQuery = query.toLowerCase();
  return CURATED_TEAMS.filter(team => 
    team.name.toLowerCase().includes(lowerQuery) ||
    team.nameShortened.toLowerCase().includes(lowerQuery)
  );
}

// Get all regions
export const REGIONS: CuratedTeam['region'][] = ['LEC', 'LCS', 'LCK', 'LPL', 'CBLOL'];

// Region display names
export const REGION_NAMES: Record<CuratedTeam['region'], string> = {
  'LEC': 'LEC (Europe)',
  'LCS': 'LCS (North America)',
  'LCK': 'LCK (Korea)',
  'LPL': 'LPL (China)',
  'CBLOL': 'CBLOL (Brazil)'
};
