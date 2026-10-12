import { TalentNodeDefinition } from '../models/talent-tree.model';
import { TalentStatCalculatorService } from './talent-stat-calculator.service';

describe('TalentStatCalculatorService', () => {
  const calculator = new TalentStatCalculatorService();

  it('calculates configured per-rank totals by target and ignores disabled or unconfigured nodes', () => {
    const talents: TalentNodeDefinition[] = [
      {
        id: 'global-damage',
        name: 'Global Damage',
        maxLevel: 5,
        statType: 'damage',
        target: 'global',
        valuePerLevel: 10,
        isPercentage: true,
      },
      {
        id: 'hero-damage',
        name: 'Hero Damage',
        maxLevel: 5,
        statType: 'damage',
        target: 'hero',
        valuePerLevel: 20,
        isPercentage: true,
      },
      {
        id: 'unknown-value',
        name: 'Unknown Value',
        maxLevel: 5,
        statType: 'damage',
        target: 'crowd',
        valuePerLevel: null,
        isPercentage: true,
      },
    ];

    const totals = calculator.calculateBonuses(
      talents,
      { 'global-damage': 2, 'hero-damage': 3, 'unknown-value': 5 },
    );

    expect(totals).toEqual([
      { statType: 'damage', target: 'global', value: 20, isPercentage: true },
      { statType: 'damage', target: 'hero', value: 60, isPercentage: true },
    ]);
  });

  it('omits unranked talents from aggregated bonuses', () => {
    const talent: TalentNodeDefinition = {
      id: 'hero-damage',
      name: 'Hero Damage',
      maxLevel: 5,
      statType: 'damage',
      target: 'hero',
      valuePerLevel: 20,
      isPercentage: true,
    };

    expect(calculator.calculateBonuses([talent], { 'hero-damage': 0 })).toEqual([]);
  });
});
