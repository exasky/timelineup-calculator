import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import {
  BUILD_CATEGORIES,
  BuildCategory,
  CalculatorItem,
} from '../../features/calculator/models/calculator-item.model';
import { Card } from '../models/card.model';
import { GameDataService } from './game-data.service';

const STATIC_ITEMS: CalculatorItem[] = [
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
  {
    id: 'mossling', name: 'Mossling', role: 'Grove companion', emblem: 'MO', category: 'pets',
    level: 14, maxLevel: 60, basePower: 54, powerScaling: 1.12,
  },
  {
    id: 'emberfox', name: 'Emberfox', role: 'Flame companion', emblem: 'EF', category: 'pets',
    level: 9, maxLevel: 60, basePower: 68, powerScaling: 1.15,
  },
  {
    id: 'moonmoth', name: 'Moonmoth', role: 'Lunar companion', emblem: 'MM', category: 'pets',
    level: 6, maxLevel: 55, basePower: 61, powerScaling: 1.17,
  },
  {
    id: 'glasswing', name: 'Glasswing', role: 'Skyrunner mount', emblem: 'GW', category: 'mounts',
    level: 11, maxLevel: 65, basePower: 92, powerScaling: 1.13,
  },
  {
    id: 'duskstrider', name: 'Duskstrider', role: 'Twilight mount', emblem: 'DS', category: 'mounts',
    level: 7, maxLevel: 65, basePower: 108, powerScaling: 1.12,
  },
  {
    id: 'ironmane', name: 'Ironmane', role: 'Warbound mount', emblem: 'IM', category: 'mounts',
    level: 5, maxLevel: 60, basePower: 126, powerScaling: 1.11,
  },
  {
    id: 'keen-instinct', name: 'Keen Instinct', role: 'Precision talent', emblem: 'KI', category: 'talents',
    level: 9, maxLevel: 40, basePower: 42, powerScaling: 1.18,
  },
  {
    id: 'iron-resolve', name: 'Iron Resolve', role: 'Endurance talent', emblem: 'IR', category: 'talents',
    level: 7, maxLevel: 40, basePower: 48, powerScaling: 1.16,
  },
  {
    id: 'quickening', name: 'Quickening', role: 'Tempo talent', emblem: 'QU', category: 'talents',
    level: 5, maxLevel: 40, basePower: 57, powerScaling: 1.15,
  },
];

interface SharedBuild {
  levels: Record<string, unknown>;
  enabledIds: unknown[];
}

@Injectable({ providedIn: 'root' })
export class BuildStateService {
  readonly categories = BUILD_CATEGORIES;
  private readonly cards = toSignal(
    inject(GameDataService).loadCards().pipe(catchError(() => of([] as Card[]))),
    { initialValue: [] as Card[] },
  );
  readonly allItems = computed<CalculatorItem[]>(() => [
    ...STATIC_ITEMS,
    ...this.cards().map((card) => this.toCalculatorItem(card)),
  ]);
  readonly enabledItemIds = signal<ReadonlySet<string>>(
    new Set(STATIC_ITEMS.map((item) => item.id)),
  );
  readonly levels = signal<Record<string, number>>(
    Object.fromEntries(STATIC_ITEMS.map((item) => [item.id, item.level])),
  );
  readonly effectiveLevels = computed(() =>
    Object.fromEntries(
      this.allItems().map((item) => [
        item.id,
        this.enabledItemIds().has(item.id) ? this.levels()[item.id] ?? item.level : 0,
      ]),
    ),
  );

  constructor() {
    const restoredBuild = this.restoreSharedBuild();
    effect(() => {
      const cards = this.allItems().filter((item) => item.card);
      if (cards.length === 0) {
        return;
      }

      untracked(() => {
        const currentLevels = this.levels();
        const newCards = cards.filter((card) => currentLevels[card.id] === undefined);
        this.levels.update((levels) => {
          let changed = false;
          const updated = { ...levels };
          for (const card of cards) {
            const currentLevel = updated[card.id] ?? card.level;
            const boundedLevel = Math.max(0, Math.min(Math.round(currentLevel), card.maxLevel));
            if (updated[card.id] !== boundedLevel) {
              updated[card.id] = boundedLevel;
              changed = true;
            }
          }
          return changed ? updated : levels;
        });

        const cardsToEnable = restoredBuild ? newCards : cards;
        if (cardsToEnable.length > 0) {
          this.enabledItemIds.update((enabledIds) => {
            const updated = new Set(enabledIds);
            for (const card of cardsToEnable) {
              updated.add(card.id);
            }
            return updated;
          });
        }
      });
    });
  }

  itemsForCategory(category: BuildCategory): CalculatorItem[] {
    return this.allItems().filter((item) => item.category === category);
  }

  setLevel(item: CalculatorItem, level: number): void {
    if (!Number.isFinite(level)) {
      return;
    }

    const boundedLevel = Math.max(0, Math.min(Math.round(level), item.maxLevel));
    this.levels.update((levels) => ({ ...levels, [item.id]: boundedLevel }));
  }

  toggleItem(itemId: string): void {
    this.enabledItemIds.update((enabled) => {
      const updated = new Set(enabled);
      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }
      return updated;
    });
  }

  resetBuild(): void {
    const items = this.allItems();
    this.levels.set(Object.fromEntries(items.map((item) => [item.id, item.level])));
    this.enabledItemIds.set(new Set(items.map((item) => item.id)));
  }

  maxAllLevels(): void {
    const items = this.allItems();
    this.levels.set(Object.fromEntries(items.map((item) => [item.id, item.maxLevel])));
    this.enabledItemIds.set(new Set(items.map((item) => item.id)));
  }

  saveBuild(): void {
    window.localStorage.setItem(
      'timelineup-build',
      JSON.stringify({ levels: this.levels(), enabledIds: [...this.enabledItemIds()] }),
    );
  }

  createShareUrl(): string {
    const build = {
      levels: this.levels(),
      enabledIds: [...this.enabledItemIds()],
    };
    const url = new URL(window.location.href);
    url.hash = `/?build=${encodeURIComponent(btoa(JSON.stringify(build)))}`;
    return url.toString();
  }

  private restoreSharedBuild(): boolean {
    const query = window.location.hash.split('?')[1];
    const encodedBuild = query ? new URLSearchParams(query).get('build') : null;

    try {
      const savedBuild = window.localStorage.getItem('timelineup-build');
      const parsed: unknown = encodedBuild
        ? JSON.parse(atob(encodedBuild))
        : savedBuild
          ? JSON.parse(savedBuild)
          : null;
      if (!this.isSharedBuild(parsed)) {
        return false;
      }

      const levels: Record<string, number> = Object.fromEntries(
        STATIC_ITEMS.map((item) => [item.id, item.level]),
      );
      for (const [id, value] of Object.entries(parsed.levels)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          levels[id] = Math.max(0, Math.round(value));
        }
      }
      const enabledIds = new Set(parsed.enabledIds.filter((id): id is string => typeof id === 'string'));

      this.levels.set(levels);
      this.enabledItemIds.set(enabledIds);
      return true;
    } catch {
      return false;
    }
  }

  private toCalculatorItem(card: Card): CalculatorItem {
    const initials = card.name
      .split(/\s+/)
      .map((word) => word[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      ...card,
      basePower: 0,
      powerScaling: 1,
      role: card.primaryStatType.replaceAll('_', ' '),
      emblem: initials || 'CA',
      category: 'cards',
      card,
    };
  }

  private isSharedBuild(value: unknown): value is SharedBuild {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      typeof record['levels'] === 'object' && record['levels'] !== null &&
      Array.isArray(record['enabledIds'])
    );
  }
}
