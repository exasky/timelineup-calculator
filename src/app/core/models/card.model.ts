export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

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

type CardPrimaryStatFormat = 'number' | 'percentage';

export const CARD_PRIMARY_STAT_METADATA: Record<
  CardPrimaryStatType,
  { label: string; format: CardPrimaryStatFormat }
> = {
  damage: { label: 'damage', format: 'number' },
  income: { label: 'income', format: 'percentage' },
  warrior_clone_chance: { label: 'clone chance', format: 'percentage' },
  crit_chance: { label: 'crit chance', format: 'percentage' },
  cooldown_reduction: { label: 'cooldown reduction', format: 'percentage' },
  range: { label: 'range', format: 'percentage' },
  fire_rate: { label: 'fire rate', format: 'percentage' },
  warrior_upgrade: { label: 'warrior upgrade', format: 'number' },
  idle_price_discount: { label: 'idle price discount', format: 'percentage' },
  diamond_drop_chance_from_enemy: {
    label: 'diamond drop chance from enemy',
    format: 'percentage',
  },
  diamond_double_drop_chance: { label: 'diamond double drop chance', format: 'percentage' },
  add_warrior: { label: 'additional warrior', format: 'number' },
  capacity: { label: 'capacity', format: 'number' },
  level_end_blowk_weakening: { label: 'level-end boss weakening', format: 'percentage' },
  critical_hit_chance: { label: 'critical hit chance', format: 'percentage' },
  pet_clone_damage: { label: 'pet clone damage', format: 'number' },
  hero_shockwave_damage: { label: 'hero shockwave damage', format: 'number' },
};

export function formatCardPrimaryStatValue(
  statType: CardPrimaryStatType,
  value: number,
): string {
  const formattedValue = CARD_PRIMARY_STAT_METADATA[statType].format === 'percentage'
    ? `${Number(value.toFixed(2))}%`
    : value.toLocaleString();

  return `+${formattedValue}`;
}

export interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  level: number;
  maxLevel: number;
  primaryStatType: CardPrimaryStatType;
  primaryStatValuePerLevel: number;
  maxLevelCapForPrimary: number;
  flatDamageBonusAfterCap: number;
}

export interface CardCalculation {
  cardId: string;
  level: number;
  primaryStatType: CardPrimaryStatType;
  primaryStatBonus: number;
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
