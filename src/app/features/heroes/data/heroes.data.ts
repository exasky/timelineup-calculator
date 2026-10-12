import { CalculatorItem } from '../../calculator/models/calculator-item.model';

export const HEROES: CalculatorItem[] = [
  {
    id: 'aster-vale', name: 'Aster Vale', role: 'Starforged vanguard', emblem: 'AV', category: 'heroes',
    level: 24, maxLevel: 80, basePower: 132, powerScaling: 1.16, specialPower: 48,
    specialPowerDescription: 'Starfall · calls down a focused astral strike.',
  },
  {
    id: 'nyra-sol', name: 'Nyra Sol', role: 'Dawnweaver', emblem: 'NS', category: 'heroes',
    level: 18, maxLevel: 75, basePower: 118, powerScaling: 1.19, specialPower: 36,
    specialPowerDescription: 'Solar Thread · burns through the front line.',
  },
  {
    id: 'dorian-flux', name: 'Dorian Flux', role: 'Rift tactician', emblem: 'DF', category: 'heroes',
    level: 12, maxLevel: 80, basePower: 146, powerScaling: 1.14, specialPower: 52,
    specialPowerDescription: 'Paradox Field · bends the next incoming hit.',
  },
];
