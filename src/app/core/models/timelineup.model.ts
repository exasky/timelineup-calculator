export interface Upgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  bonusPerLevel: number;
  category: 'attack' | 'defense' | 'economy' | 'utility';
}

export interface Era {
  id: number;
  name: string;
  multiplier: number;
}

export interface UserBuildState {
  [upgradeId: string]: number;
}
