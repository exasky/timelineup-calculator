import { CalculatorItem } from '../../calculator/models/calculator-item.model';

export const CHAMPIONS: CalculatorItem[] = [
  {
    id: 'kade-unbound', name: 'Kade Unbound', role: 'Arena champion', emblem: 'KU', category: 'champions',
    level: 16, maxLevel: 70, basePower: 205, powerScaling: 1.13, specialPower: 64,
    specialPowerDescription: 'Last Stand · surges when the fight turns.',
  },
  {
    id: 'mira-ashvale', name: 'Mira Ashvale', role: 'Cinder duelist', emblem: 'MA', category: 'champions',
    level: 10, maxLevel: 70, basePower: 188, powerScaling: 1.15, specialPower: 58,
    specialPowerDescription: 'Ashen Arc · chains a second strike.',
  },
  {
    id: 'orin-stonewake', name: 'Orin Stonewake', role: 'Oathbound sentinel', emblem: 'OS', category: 'champions',
    level: 8, maxLevel: 65, basePower: 221, powerScaling: 1.11, specialPower: 72,
    specialPowerDescription: 'Granite Vow · steadies the whole formation.',
  },
];
