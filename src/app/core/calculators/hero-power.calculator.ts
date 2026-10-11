import { Injectable } from '@angular/core';

import { GameItem } from '../models/game-item.interface';
import { IPowerCalculator } from './base-calculator.interface';

export interface HeroGameItem extends GameItem {
  specialPower?: number;
}

@Injectable({ providedIn: 'root' })
export class HeroPowerCalculator implements IPowerCalculator {
  calculatePower(items: GameItem[], userLevels: Record<string, number>): number {
    return items.reduce((totalPower, item) => {
      const selectedLevel = userLevels[item.id] ?? item.level;
      const level = Math.max(0, Math.min(selectedLevel, item.maxLevel));

      if (level === 0) {
        return totalPower;
      }

      const levelPower = item.basePower * item.powerScaling ** (level - 1);
      const specialPower = this.getSpecialPower(item);

      return totalPower + levelPower + specialPower;
    }, 0);
  }

  private getSpecialPower(item: GameItem): number {
    return 'specialPower' in item && typeof item.specialPower === 'number'
      ? item.specialPower
      : 0;
  }
}
