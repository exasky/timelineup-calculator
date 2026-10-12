import { Injectable } from '@angular/core';

import {
  Card,
  CardCalculation,
  CARD_RARITY_RULES,
  CardStatBonuses,
} from '../models/card.model';
import { CARD_BUILD_STATE_DEFAULTS } from '../models/card-build-state.model';

const EMPTY_CARD_BONUSES: CardStatBonuses = {
  primaryStatBonuses: {},
  totalIncomeMultiplier: 0,
  totalDamageAddition: 0,
  totalCloneChance: 0,
  totalFireRate: 0,
  totalCritChance: 0,
  totalCooldownReduction: 0,
};

@Injectable({ providedIn: 'root' })
export class CardCalculatorService {
  calculateCard(
    card: Card,
    selectedLevel = CARD_BUILD_STATE_DEFAULTS.level,
    maxLevel = CARD_BUILD_STATE_DEFAULTS.maxLevel,
  ): CardCalculation {
    const level = Number.isFinite(selectedLevel)
      ? Math.max(0, Math.min(Math.round(selectedLevel), maxLevel))
      : 0;
    const rarityRules = CARD_RARITY_RULES[card.rarity];
    const configuredLevels = card.primaryStatValuesByLevel
      ? Object.keys(card.primaryStatValuesByLevel).map(Number).filter(Number.isFinite)
      : [];
    const primaryCap = configuredLevels.length > 0
      ? Math.max(...configuredLevels)
      : rarityRules.primaryLevelCap;
    const availablePrimaryLevels = configuredLevels
      .filter((configuredLevel) => configuredLevel <= level)
      .sort((left, right) => right - left);
    const primaryStatLevel = availablePrimaryLevels[0];
    const primaryStatBonus = primaryStatLevel === undefined
      ? 0
      : card.primaryStatValuesByLevel?.[primaryStatLevel] ?? 0;
    const hasPrimaryStatValue = primaryStatLevel !== undefined;
    const overflowLevels = Math.max(0, level - primaryCap);
    const flatDamagePerLevel = rarityRules.flatDamagePerLevel;
    const damageAddition =
      (card.primaryStatType === 'damage' ? primaryStatBonus : 0) +
      overflowLevels * flatDamagePerLevel;

    return {
      cardId: card.id,
      level,
      primaryLevelCap: primaryCap,
      flatDamagePerLevel,
      primaryStatType: card.primaryStatType,
      primaryStatBonus,
      hasPrimaryStatValue,
      damageAddition,
      hasReachedPrimaryCap: level >= primaryCap,
      isConvertingToDamage: overflowLevels > 0,
    };
  }

  calculateTotalBonuses(
    activeCards: readonly Card[],
    userLevels: Readonly<Record<string, number>> = {},
    maxLevels: Readonly<Record<string, number>> = {},
  ): CardStatBonuses {
    return activeCards.reduce<CardStatBonuses>((totals, card) => {
      const calculation = this.calculateCard(
        card,
        userLevels[card.id] ?? CARD_BUILD_STATE_DEFAULTS.level,
        maxLevels[card.id] ?? CARD_BUILD_STATE_DEFAULTS.maxLevel,
      );
      totals.primaryStatBonuses[card.primaryStatType] =
        (totals.primaryStatBonuses[card.primaryStatType] ?? 0) + calculation.primaryStatBonus;

      switch (card.primaryStatType) {
        case 'income':
          totals.totalIncomeMultiplier += calculation.primaryStatBonus;
          break;
        case 'warrior_clone_chance':
          totals.totalCloneChance += calculation.primaryStatBonus;
          break;
        case 'fire_rate':
          totals.totalFireRate += calculation.primaryStatBonus;
          break;
        case 'crit_chance':
        case 'critical_hit_chance':
          totals.totalCritChance += calculation.primaryStatBonus;
          break;
        case 'cooldown_reduction':
          totals.totalCooldownReduction += calculation.primaryStatBonus;
          break;
        default:
          break;
      }

      totals.totalDamageAddition += calculation.damageAddition;
      return totals;
    }, { ...EMPTY_CARD_BONUSES, primaryStatBonuses: {} });
  }
}
