import { Injectable } from '@angular/core';

import { IPowerCalculator } from '../calculators/base-calculator.interface';
import { GameItem } from '../models/game-item.interface';

export interface PowerCategoryGroup {
  items: GameItem[];
  calculator: IPowerCalculator;
}

@Injectable({ providedIn: 'root' })
export class PowerAggregatorService {
  calculateTotalPower(
    categories: Readonly<Record<string, PowerCategoryGroup>>,
    userLevels: Record<string, number>,
  ): number {
    return Object.values(categories).reduce(
      (totalPower, { items, calculator }) =>
        totalPower + calculator.calculatePower(items, userLevels),
      0,
    );
  }
}
