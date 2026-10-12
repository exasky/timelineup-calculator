import { Injectable } from '@angular/core';

import { TalentNodeDefinition, TalentStatType } from '../models/talent-tree.model';
import { PowerTarget } from '../../../core/models/power-target.model';

export interface TalentStatBonus {
  statType: TalentStatType;
  target: PowerTarget;
  value: number;
  isPercentage: boolean;
}

@Injectable({ providedIn: 'root' })
export class TalentStatCalculatorService {
  calculateNodeBonus(node: TalentNodeDefinition, level: number): number | null {
    if (node.valuePerLevel === null) {
      return null;
    }

    const boundedLevel = Math.max(0, Math.min(Math.round(level), node.maxLevel));
    return boundedLevel * node.valuePerLevel;
  }

  calculateBonuses(
    nodes: readonly TalentNodeDefinition[],
    levels: Readonly<Record<string, number>>,
  ): TalentStatBonus[] {
    const bonuses = new Map<string, TalentStatBonus>();

    for (const node of nodes) {
      const level = levels[node.id] ?? 0;
      if (node.valuePerLevel === null || level <= 0) {
        continue;
      }

      const value = this.calculateNodeBonus(node, level) ?? 0;
      if (value === 0) {
        continue;
      }

      const key = `${node.target}:${node.statType}`;
      const current = bonuses.get(key);
      bonuses.set(key, {
        statType: node.statType,
        target: node.target,
        value: (current?.value ?? 0) + value,
        isPercentage: node.isPercentage,
      });
    }

    return [...bonuses.values()];
  }
}
