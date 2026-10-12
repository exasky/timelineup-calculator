import { GameItem } from '../../../core/models/game-item.interface';
import { Card } from '../../cards/models/card.model';

export const BUILD_CATEGORIES = [
  { id: 'heroes', label: 'Heroes', emblem: '01', accent: '#f4bd50' },
  { id: 'champions', label: 'Champions', emblem: '02', accent: '#7ed3b2' },
  { id: 'pets', label: 'Pets', emblem: '03', accent: '#f28e68' },
  { id: 'mounts', label: 'Mounts', emblem: '04', accent: '#82b8ed' },
  { id: 'cards', label: 'Cards', emblem: '05', accent: '#d7a5e8' },
  { id: 'talents', label: 'Talents', emblem: '06', accent: '#e68a9c' },
] as const;

export type BuildCategory = (typeof BUILD_CATEGORIES)[number]['id'];
export type BuildCategoryDefinition = (typeof BUILD_CATEGORIES)[number];

export interface CalculatorItem extends GameItem {
  category: BuildCategory;
  role: string;
  emblem: string;
  specialPower?: number;
  specialPowerDescription?: string;
  card?: Card;
}
