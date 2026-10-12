import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { Card } from '../../cards/models/card.model';
import { CardsDataService } from '../../cards/services/cards-data.service';
import { CARD_BUILD_STATE_DEFAULTS } from '../../cards/models/card-build-state.model';
import { BUILD_CATEGORIES, BuildCategory, CalculatorItem } from '../models/calculator-item.model';
import { CHAMPIONS } from '../../champions/data/champions.data';
import { HEROES } from '../../heroes/data/heroes.data';
import { MOUNTS } from '../../mounts/data/mounts.data';
import { PETS } from '../../pets/data/pets.data';
import { flattenTalentTree, TalentNodeDefinition } from '../../talents/models/talent-tree.model';
import { TalentsDataService } from '../../talents/services/talents-data.service';

@Injectable({ providedIn: 'root' })
export class CalculatorCatalogService {
  private readonly talentsData = inject(TalentsDataService);
  private readonly cards = toSignal(
    inject(CardsDataService).loadCards().pipe(catchError(() => of([] as Card[]))),
    { initialValue: [] as Card[] },
  );

  readonly categories = BUILD_CATEGORIES;
  readonly talents = computed(() => {
    const tree = this.talentsData.tree();
    return tree ? flattenTalentTree(tree).map((node) => this.toTalentCalculatorItem(node)) : [];
  });
  readonly items = computed<CalculatorItem[]>(() => [
    ...HEROES,
    ...CHAMPIONS,
    ...PETS,
    ...MOUNTS,
    ...this.cards().map((card) => this.toCalculatorItem(card)),
    ...this.talents(),
  ]);

  itemsForCategory(category: BuildCategory): CalculatorItem[] {
    return this.items().filter((item) => item.category === category);
  }

  private toCalculatorItem(card: Card): CalculatorItem {
    const emblem = card.name
      .split(/\s+/)
      .map((word) => word[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      ...card,
      level: CARD_BUILD_STATE_DEFAULTS.level,
      maxLevel: CARD_BUILD_STATE_DEFAULTS.maxLevel,
      basePower: 0,
      powerScaling: 1,
      role: card.primaryStatType.replaceAll('_', ' '),
      emblem: emblem || 'CA',
      category: 'cards',
      card,
    };
  }

  private toTalentCalculatorItem(node: TalentNodeDefinition): CalculatorItem {
    const emblem = node.name
      .split(/\s+/)
      .map((word) => /^\d+$/.test(word) ? word : word[0] ?? '')
      .join('')
      .slice(0, 4)
      .toUpperCase();

    return {
      ...node,
      level: 0,
      basePower: 0,
      powerScaling: 1,
      role: 'Talent',
      emblem: emblem || 'TN',
      category: 'talents',
    };
  }
}
