import { Injectable } from '@angular/core';

import {
  Card,
  CardCalculation,
  CardStatBonuses,
} from '../models/card.model';

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
  calculateCard(card: Card, selectedLevel = card.level): CardCalculation {
    const level = Number.isFinite(selectedLevel)
      ? Math.max(0, Math.min(Math.round(selectedLevel), card.maxLevel))
      : 0;
    const primaryCap = Math.max(0, card.maxLevelCapForPrimary);
    const primaryLevels = Math.min(level, primaryCap);
    const primaryStatBonus = primaryLevels * card.primaryStatValuePerLevel;
    const overflowLevels = Math.max(0, level - primaryCap);
    const damageAddition =
      (card.primaryStatType === 'damage' ? primaryStatBonus : 0) +
      overflowLevels * card.flatDamageBonusAfterCap;

    return {
      cardId: card.id,
      level,
      primaryStatType: card.primaryStatType,
      primaryStatBonus,
      damageAddition,
      hasReachedPrimaryCap: primaryCap > 0 && level >= primaryCap,
      isConvertingToDamage: overflowLevels > 0,
    };
  }

  calculateTotalBonuses(
    activeCards: readonly Card[],
    userLevels: Readonly<Record<string, number>> = {},
  ): CardStatBonuses {
    return activeCards.reduce<CardStatBonuses>((totals, card) => {
      const calculation = this.calculateCard(card, userLevels[card.id] ?? card.level);
      totals.primaryStatBonuses[card.primaryStatType] =
        (totals.primaryStatBonuses[card.primaryStatType] ?? 0) + calculation.primaryStatBonus;

      switch (card.primaryStatType) {
        case 'damage':
          break;
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
    }, {
      ...EMPTY_CARD_BONUSES,
      primaryStatBonuses: {},
    });
  }
}
