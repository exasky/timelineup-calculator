import { GameItem } from '../models/game-item.interface';

export interface IPowerCalculator {
  calculatePower(items: GameItem[], userLevels: Record<string, number>): number;
}
