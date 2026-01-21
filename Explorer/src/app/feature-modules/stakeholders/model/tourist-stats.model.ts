export interface TouristStats {
  touristId: number;
  xp: number;
  level: number;
  rank: string;
}

export type Rank = 'Rookie' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Vista';

export interface RankConfig {
  name: Rank;
  minLevel: number;
  maxLevel: number;
  color: string;
  icon: string;
  gradient: string;
}

export const RANK_CONFIGS: RankConfig[] = [
  {
    name: 'Rookie',
    minLevel: 0,
    maxLevel: 1,
    color: '#8D6E63',
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #8D6E63, #A1887F)'
  },
  {
    name: 'Bronze',
    minLevel: 2,
    maxLevel: 4,
    color: '#CD7F32',
    icon: '🥉',
    gradient: 'linear-gradient(135deg, #CD7F32, #E69A5F)'
  },
  {
    name: 'Silver',
    minLevel: 5,
    maxLevel: 9,
    color: '#C0C0C0',
    icon: '🥈',
    gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)'
  },
  {
    name: 'Gold',
    minLevel: 10,
    maxLevel: 14,
    color: '#FFD700',
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  },
  {
    name: 'Platinum',
    minLevel: 15,
    maxLevel: 19,
    color: '#E5E4E2',
    icon: '💎',
    gradient: 'linear-gradient(135deg, #E5E4E2, #B9F2FF)'
  },
  {
    name: 'Diamond',
    minLevel: 20,
    maxLevel: 29,
    color: '#B9F2FF',
    icon: '💠',
    gradient: 'linear-gradient(135deg, #00BCD4, #B9F2FF)'
  },
  {
    name: 'Vista',
    minLevel: 30,
    maxLevel: 999,
    color: '#9C27B0',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #9C27B0, #E1BEE7)'
  }
];

export function getRankConfig(level: number): RankConfig {
  return RANK_CONFIGS.find(
    config => level >= config.minLevel && level <= config.maxLevel
  ) || RANK_CONFIGS[0];
}

export function calculateXpInCurrentLevel(currentXp: number): number {
  // XP u trenutnom levelu (ostatak nakon deljenja sa 100)
  return currentXp % 100;
}

export function calculateXpForNextLevel(): number {
  // Uvek treba 100 XP za sledeći level
  return 100;
}

export function calculateXpProgress(currentXp: number): number {
  return calculateXpInCurrentLevel(currentXp);
}

export function calculateProgressPercentage(currentXp: number): number {
  const xpInCurrentLevel = calculateXpInCurrentLevel(currentXp);
  const xpNeeded = 100;
  return (xpInCurrentLevel / xpNeeded) * 100;
}

export function calculateXpRemaining(currentXp: number): number {
  const xpInCurrentLevel = calculateXpInCurrentLevel(currentXp);
  return 100 - xpInCurrentLevel;
}
