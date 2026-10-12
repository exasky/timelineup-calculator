import { Injectable, computed, effect, inject, untracked } from '@angular/core';

import { ScaledItemPowerCalculator } from '../../../core/calculators/scaled-item-power.calculator';
import { CardCalculatorService } from '../../cards/calculators/card-calculator.service';
import {
  CardCalculation,
  CardPrimaryStatType,
  CardStatBonuses,
  CARD_PRIMARY_STAT_METADATA,
  formatCardPrimaryStatValue,
} from '../../cards/models/card.model';
import { BuildStateService } from '../../../core/services/build-state.service';
import {
  PowerAggregatorService,
  PowerCategoryGroup,
} from '../../../core/services/power-aggregator.service';
import { CalculatorCatalogService } from '../data/calculator-catalog.service';
import { BuildCategory, CalculatorItem } from '../models/calculator-item.model';

export interface CalculatorItemView {
  item: CalculatorItem;
  level: number;
  enabled: boolean;
  power: number;
  cardCalculation?: CardCalculation;
}

@Injectable({ providedIn: 'root' })
export class CalculatorEngineService {
  private readonly buildState = inject(BuildStateService);
  private readonly catalog = inject(CalculatorCatalogService);
  private readonly powerAggregator = inject(PowerAggregatorService);
  private readonly scaledItemPowerCalculator = inject(ScaledItemPowerCalculator);
  private readonly cardCalculator = inject(CardCalculatorService);

  readonly categories = this.catalog.categories;
  readonly items = this.catalog.items;
  readonly enabledCount = computed(() => this.buildState.enabledItemIds().size);
  readonly cardBonuses = computed<CardStatBonuses>(() => {
    const enabledIds = this.buildState.enabledItemIds();
    const activeCards = this.items()
      .filter((item) => item.card && enabledIds.has(item.id))
      .map((item) => item.card!);
    return this.cardCalculator.calculateTotalBonuses(
      activeCards,
      this.buildState.levels(),
      this.buildState.maxLevels(),
    );
  });
  readonly cardBonusEntries = computed(() => {
    const bonuses = this.cardBonuses();
    const values: Partial<Record<CardPrimaryStatType, number>> = {
      ...bonuses.primaryStatBonuses,
      damage: bonuses.totalDamageAddition,
    };

    return Object.entries(values)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] !== 0)
      .map(([statType, value]) => {
        const typedStat = statType as CardPrimaryStatType;
        return {
          stat: statType,
          label: CARD_PRIMARY_STAT_METADATA[typedStat].label,
          value: formatCardPrimaryStatValue(typedStat, value),
        };
      });
  });
  readonly categoryGroups = computed(() => {
    const groups = {} as Record<BuildCategory, PowerCategoryGroup>;
    for (const category of this.categories) {
      groups[category.id] = {
        items: category.id === 'cards' ? [] : this.itemsForCategory(category.id),
        calculator: this.scaledItemPowerCalculator,
      };
    }
    return groups;
  });
  readonly totalPower = computed(() =>
    this.powerAggregator.calculateTotalPower(
      this.categoryGroups(),
      this.buildState.effectiveLevels(),
    ) + this.cardBonuses().totalDamageAddition,
  );
  readonly categoryPowers = computed(() => {
    const levels = this.buildState.effectiveLevels();
    const groups = this.categoryGroups();
    return Object.fromEntries(
      this.categories.map((category) => [
        category.id,
        category.id === 'cards'
          ? this.cardBonuses().totalDamageAddition
          : this.powerAggregator.calculateTotalPower(
            { [category.id]: groups[category.id] },
            levels,
          ),
      ]),
    ) as Record<BuildCategory, number>;
  });

  constructor() {
    effect(() => untracked(() => this.buildState.initializeItems(this.items())));
  }

  itemsForCategory(category: BuildCategory): CalculatorItem[] {
    return this.catalog.itemsForCategory(category);
  }

  itemView(item: CalculatorItem): CalculatorItemView {
    const level = this.buildState.levels()[item.id] ?? item.level;
    const maxLevel = this.buildState.maxLevels()[item.id] ?? item.maxLevel;
    const enabled = this.buildState.enabledItemIds().has(item.id);
    const cardCalculation = item.card
      ? this.cardCalculator.calculateCard(item.card, level, maxLevel)
      : undefined;

    return {
      item: { ...item, maxLevel },
      level,
      enabled,
      power: !enabled
        ? 0
        : cardCalculation?.damageAddition ??
        this.scaledItemPowerCalculator.calculatePower([item], { [item.id]: level }),
      cardCalculation,
    };
  }
}
