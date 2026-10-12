import { Card } from '../models/card.model';
import { CardCalculatorService } from './card-calculator.service';

describe('CardCalculatorService', () => {
  const calculator = new CardCalculatorService();
  const critCard: Card = {
    id: 'e_crit_0',
    name: 'Crit Chance',
    rarity: 'epic',
    imageUrl: '/assets/cards/e_crit_0.png',
    primaryStatType: 'crit_chance',
    primaryStatValuesByLevel: { 1: 10, 4: 30, 7: 55 },
  };

  it('uses the configured total at the selected level instead of multiplying it by level', () => {
    const result = calculator.calculateCard(critCard, 7);

    expect(result.primaryStatBonus).toBe(55);
    expect(result.damageAddition).toBe(0);
    expect(result.primaryLevelCap).toBe(7);
  });

  it('uses the latest configured total between breakpoints', () => {
    const result = calculator.calculateCard(critCard, 5);

    expect(result.primaryStatBonus).toBe(30);
    expect(result.hasPrimaryStatValue).toBe(true);
    expect(result.isConvertingToDamage).toBe(false);
  });

  it('converts levels above the last primary breakpoint using the card damage rate', () => {
    const result = calculator.calculateCard(critCard, 9);

    expect(result.primaryStatBonus).toBe(55);
    expect(result.damageAddition).toBe(40);
    expect(result.flatDamagePerLevel).toBe(20);
    expect(result.isConvertingToDamage).toBe(true);
  });

  it('uses rarity cap and damage rules when no per-level table exists', () => {
    const cardWithoutCurve: Card = {
      ...critCard,
      rarity: 'common',
      primaryStatValuesByLevel: null,
    };
    const result = calculator.calculateCard(cardWithoutCurve, 13);

    expect(result.primaryLevelCap).toBe(10);
    expect(result.primaryStatBonus).toBe(0);
    expect(result.damageAddition).toBe(15);
    expect(result.flatDamagePerLevel).toBe(5);
  });

  it('does not carry aggregated stats between recalculations', () => {
    const firstTotals = calculator.calculateTotalBonuses([critCard], { [critCard.id]: 4 });
    const secondTotals = calculator.calculateTotalBonuses([critCard], { [critCard.id]: 7 });
    const repeatedTotals = calculator.calculateTotalBonuses([critCard], { [critCard.id]: 4 });

    expect(firstTotals.totalCritChance).toBe(30);
    expect(secondTotals.totalCritChance).toBe(55);
    expect(repeatedTotals.totalCritChance).toBe(30);
  });
});
