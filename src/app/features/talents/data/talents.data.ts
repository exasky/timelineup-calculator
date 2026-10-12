import { CalculatorItem } from '../../calculator/models/calculator-item.model';

export const TALENTS: CalculatorItem[] = [
  { id: 'keen-instinct', name: 'Keen Instinct', role: 'Precision talent', emblem: 'KI', category: 'talents', level: 9, maxLevel: 40, basePower: 42, powerScaling: 1.18 },
  { id: 'iron-resolve', name: 'Iron Resolve', role: 'Endurance talent', emblem: 'IR', category: 'talents', level: 7, maxLevel: 40, basePower: 48, powerScaling: 1.16 },
  { id: 'quickening', name: 'Quickening', role: 'Tempo talent', emblem: 'QU', category: 'talents', level: 5, maxLevel: 40, basePower: 57, powerScaling: 1.15 },
];
