import { Rarity } from "../../../core/models/rarity.model";


export const CARD_RARITY_RULES: Record<
  Rarity,
  { primaryLevelCap: number; flatDamagePerLevel: number }
> = {
  common: { primaryLevelCap: 10, flatDamagePerLevel: 5 },
  rare: { primaryLevelCap: 10, flatDamagePerLevel: 10 },
  epic: { primaryLevelCap: 7, flatDamagePerLevel: 20 },
  legendary: { primaryLevelCap: 7, flatDamagePerLevel: 50 },
  mythic: { primaryLevelCap: 7, flatDamagePerLevel: 100 },
  immortal: { primaryLevelCap: 7, flatDamagePerLevel: 500 },
};

export type CardPrimaryStatType =
  | 'damage'
  | 'income'
  | 'warrior_clone_chance'
  | 'crit_chance'
  | 'cooldown_reduction'
  | 'range'
  | 'fire_rate'
  | 'warrior_upgrade'
  | 'idle_price_discount'
  | 'diamond_drop_chance_from_enemy'
  | 'diamond_double_drop_chance'
  | 'add_warrior'
  | 'capacity'
  | 'level_end_blowk_weakening'
  | 'critical_hit_chance'
  | 'pet_clone_damage'
  | 'hero_shockwave_damage';

export type CardSpecialEffect =
  | {
    type: 'periodic_hero_shockwave';
    intervalSeconds: number;
    description: string;
  }
  | {
    type: 'periodic_pet_clone';
    intervalSeconds: number;
    durationSeconds: number;
    description: string;
  };

type CardPrimaryStatFormat = 'number' | 'percentage';

export const CARD_PRIMARY_STAT_METADATA: Record<
  CardPrimaryStatType,
  { label: string; format: CardPrimaryStatFormat }
> = {
  damage: { label: 'damage', format: 'percentage' },
  income: { label: 'income', format: 'percentage' },
  warrior_clone_chance: { label: 'clone chance', format: 'percentage' },
  crit_chance: { label: 'crit chance', format: 'percentage' },
  cooldown_reduction: { label: 'cooldown reduction', format: 'percentage' },
  range: { label: 'range', format: 'percentage' },
  fire_rate: { label: 'fire rate', format: 'percentage' },
  warrior_upgrade: { label: 'warrior upgrade', format: 'number' },
  idle_price_discount: { label: 'idle price discount', format: 'percentage' },
  diamond_drop_chance_from_enemy: { label: 'diamond drop chance from enemy', format: 'percentage' },
  diamond_double_drop_chance: { label: 'diamond double drop chance', format: 'percentage' },
  add_warrior: { label: 'additional warrior', format: 'number' },
  capacity: { label: 'capacity', format: 'percentage' },
  level_end_blowk_weakening: { label: 'level-end block weakening', format: 'percentage' },
  critical_hit_chance: { label: 'critical hit chance', format: 'percentage' },
  pet_clone_damage: { label: 'pet clone damage', format: 'percentage' },
  hero_shockwave_damage: { label: 'hero shockwave damage', format: 'percentage' },
};

export function formatCardPrimaryStatValue(statType: CardPrimaryStatType, value: number): string {
  const formattedValue = CARD_PRIMARY_STAT_METADATA[statType].format === 'percentage'
    ? `${Number(value.toFixed(2))}%`
    : value.toLocaleString();
  return `+${formattedValue}`;
}

export type Level = number;
export type StatValue = number;

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  imageUrl?: string;
  primaryStatType: CardPrimaryStatType;
  primaryStatValuesByLevel: Record<Level, StatValue> | null;
  specialEffect?: CardSpecialEffect;
}

export interface CardCalculation {
  cardId: string;
  level: number;
  primaryLevelCap: number;
  flatDamagePerLevel: number;
  primaryStatType: CardPrimaryStatType;
  primaryStatBonus: number;
  hasPrimaryStatValue: boolean;
  damageAddition: number;
  hasReachedPrimaryCap: boolean;
  isConvertingToDamage: boolean;
}

export interface CardStatBonuses {
  primaryStatBonuses: Partial<Record<CardPrimaryStatType, number>>;
  totalIncomeMultiplier: number;
  totalDamageAddition: number;
  totalCloneChance: number;
  totalFireRate: number;
  totalCritChance: number;
  totalCooldownReduction: number;
}
