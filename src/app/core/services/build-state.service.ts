import { Injectable, computed, signal } from '@angular/core';

import { GameItem } from '../models/game-item.interface';

interface SharedBuild {
  levels: Record<string, unknown>;
  enabledIds: unknown[];
}

@Injectable({ providedIn: 'root' })
export class BuildStateService {
  readonly enabledItemIds = signal<ReadonlySet<string>>(new Set());
  readonly levels = signal<Record<string, number>>({});
  readonly maxLevels = signal<Record<string, number>>({});
  readonly effectiveLevels = computed(() =>
    Object.fromEntries(
      Object.entries(this.levels()).map(([itemId, level]) => [
        itemId,
        this.enabledItemIds().has(itemId) ? level : 0,
      ]),
    ),
  );

  constructor() {
    this.restoreSharedBuild();
  }

  initializeItems(items: readonly GameItem[]): void {
    const levels = this.levels();
    const maxLevels = this.maxLevels();
    const newItems = items.filter((item) => levels[item.id] === undefined);
    let levelsChanged = false;
    let maxLevelsChanged = false;
    const updatedLevels = { ...levels };
    const updatedMaxLevels = { ...maxLevels };

    for (const item of items) {
      const currentLevel = updatedLevels[item.id] ?? item.level;
      const currentMaxLevel = item.maxLevel;
      const boundedLevel = Math.max(0, Math.min(Math.round(currentLevel), currentMaxLevel));
      if (updatedLevels[item.id] !== boundedLevel) {
        updatedLevels[item.id] = boundedLevel;
        levelsChanged = true;
      }
      if (updatedMaxLevels[item.id] !== currentMaxLevel) {
        updatedMaxLevels[item.id] = currentMaxLevel;
        maxLevelsChanged = true;
      }
    }

    if (levelsChanged) {
      this.levels.set(updatedLevels);
    }
    if (maxLevelsChanged) {
      this.maxLevels.set(updatedMaxLevels);
    }

    if (newItems.length > 0) {
      this.enabledItemIds.update((enabledIds) => {
        const updated = new Set(enabledIds);
        for (const item of newItems) {
          updated.add(item.id);
        }
        return updated;
      });
    }
  }

  setLevel(itemId: string, level: number, fallbackMaxLevel: number): void {
    if (!Number.isFinite(level)) {
      return;
    }

    const maxLevel = this.maxLevels()[itemId] ?? fallbackMaxLevel;
    const boundedLevel = Math.max(0, Math.min(Math.round(level), maxLevel));
    if (this.maxLevels()[itemId] === undefined) {
      this.maxLevels.update((maxLevels) => ({ ...maxLevels, [itemId]: maxLevel }));
    }
    this.levels.update((levels) => ({ ...levels, [itemId]: boundedLevel }));
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

  resetBuild(items: readonly GameItem[]): void {
    this.levels.set(Object.fromEntries(items.map((item) => [item.id, item.level])));
    this.enabledItemIds.set(new Set(items.map((item) => item.id)));
  }

  maxAllLevels(items: readonly GameItem[]): void {
    this.levels.set(Object.fromEntries(
      items.map((item) => [item.id, this.maxLevels()[item.id] ?? item.maxLevel]),
    ));
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

      const levels = Object.fromEntries(
        Object.entries(parsed.levels).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === 'number' && Number.isFinite(entry[1]),
        ),
      );
      const enabledIds = new Set(parsed.enabledIds.filter((id): id is string => typeof id === 'string'));

      this.levels.set(levels);
      this.enabledItemIds.set(enabledIds);
      return true;
    } catch {
      return false;
    }
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
