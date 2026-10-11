import { Card } from '../models/card.model';
import { CardCalculatorService } from './card-calculator.service';

describe('CardCalculatorService', () => {
  const calculator = new CardCalculatorService();
  const cloneChanceCard: Card = {
    id: 'clone-card',
    name: 'Clone Card',
    rarity: 'epic',
    level: 4,
    maxLevel: 20,
    primaryStatType: 'warrior_clone_chance',
    primaryStatValuePerLevel: 0.02,
    maxLevelCapForPrimary: 5,
    flatDamageBonusAfterCap: 12,
  };

  it('scales the primary stat up to its cap', () => {
    const result = calculator.calculateCard(cloneChanceCard, 5);

    expect(result.primaryStatBonus).toBeCloseTo(0.1);
    expect(result.damageAddition).toBe(0);
    expect(result.hasReachedPrimaryCap).toBe(true);
    expect(result.isConvertingToDamage).toBe(false);
  });

  it('locks the primary stat and converts levels above cap into damage', () => {
    const result = calculator.calculateCard(cloneChanceCard, 8);

    expect(result.primaryStatBonus).toBeCloseTo(0.1);
    expect(result.damageAddition).toBe(36);
    expect(result.isConvertingToDamage).toBe(true);
  });

  it('aggregates selected levels for the supplied active cards', () => {
    const damageCard: Card = {
      ...cloneChanceCard,
      id: 'damage-card',
      name: 'Damage Card',
      rarity: 'rare',
      primaryStatType: 'damage',
      primaryStatValuePerLevel: 3,
      flatDamageBonusAfterCap: 5,
    };

    const totals = calculator.calculateTotalBonuses(
      [cloneChanceCard, damageCard],
      { 'clone-card': 8, 'damage-card': 6 },
    );

    expect(totals.totalCloneChance).toBeCloseTo(0.1);
    expect(totals.totalDamageAddition).toBe(56);
    expect(totals.totalIncomeMultiplier).toBe(0);
  });

  it('does not carry primary stat totals across recalculations', () => {
    const firstTotals = calculator.calculateTotalBonuses(
      [cloneChanceCard],
      { 'clone-card': 3 },
    );
    const secondTotals = calculator.calculateTotalBonuses(
      [cloneChanceCard],
      { 'clone-card': 4 },
    );
    const repeatedTotals = calculator.calculateTotalBonuses(
      [cloneChanceCard],
      { 'clone-card': 3 },
    );

    expect(firstTotals.primaryStatBonuses.warrior_clone_chance).toBeCloseTo(0.06);
    expect(secondTotals.primaryStatBonuses.warrior_clone_chance).toBeCloseTo(0.08);
    expect(repeatedTotals.primaryStatBonuses.warrior_clone_chance).toBeCloseTo(0.06);
  });
});
