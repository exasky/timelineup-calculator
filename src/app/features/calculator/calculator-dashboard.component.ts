import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { HeroPowerCalculator } from '../../core/calculators/hero-power.calculator';
import {
  CardCalculation,
  CardPrimaryStatType,
  CardStatBonuses,
  CARD_PRIMARY_STAT_METADATA,
  formatCardPrimaryStatValue,
} from '../../core/models/card.model';
import { CardCalculatorService } from '../../core/calculators/card-calculator.service';
import { BuildStateService } from '../../core/services/build-state.service';
import {
  PowerAggregatorService,
  PowerCategoryGroup,
} from '../../core/services/power-aggregator.service';
import { CategoryTabsComponent } from './components/category-tabs/category-tabs.component';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { PowerBannerComponent } from './components/power-banner/power-banner.component';
import { BuildCategory, CalculatorItem } from './models/calculator-item.model';

interface CalculatorItemView {
  item: CalculatorItem;
  level: number;
  enabled: boolean;
  power: number;
  cardCalculation?: CardCalculation;
}

@Component({
  selector: 'app-calculator-dashboard',
  imports: [DecimalPipe, PowerBannerComponent, CategoryTabsComponent, ItemCardComponent],
  templateUrl: './calculator-dashboard.component.html',
  styleUrl: './calculator-dashboard.component.scss',
})
export class CalculatorDashboardComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly powerAggregator = inject(PowerAggregatorService);
  private readonly heroPowerCalculator = inject(HeroPowerCalculator);
  private readonly cardCalculator = inject(CardCalculatorService);

  readonly categories = this.buildState.categories;
  readonly selectedCategory = signal<BuildCategory>('heroes');
  readonly shareStatus = signal('');
  readonly buildStateCount = computed(() => this.buildState.allItems().length);
  get selectedCategoryLabel(): string {
    return this.categories.find((category) => category.id === this.selectedCategory())?.label ?? '';
  }
  readonly enabledCount = computed(() => this.buildState.enabledItemIds().size);
  readonly cardBonuses = computed<CardStatBonuses>(() => {
    const activeIds = this.buildState.enabledItemIds();
    const activeCards = this.buildState.allItems()
      .filter((item) => item.card && activeIds.has(item.id))
      .map((item) => item.card!);
    return this.cardCalculator.calculateTotalBonuses(activeCards, this.buildState.levels());
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
        items: category.id === 'cards' ? [] : this.buildState.itemsForCategory(category.id),
        calculator: this.heroPowerCalculator,
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
  readonly visibleItems = computed<CalculatorItemView[]>(() => {
    const levels = this.buildState.levels();
    const enabledItems = this.buildState.enabledItemIds();

    return this.buildState.itemsForCategory(this.selectedCategory()).map((item) => {
      const level = levels[item.id] ?? item.level;
      const enabled = enabledItems.has(item.id);
      const cardCalculation = item.card
        ? this.cardCalculator.calculateCard(item.card, level)
        : undefined;
      return {
        item,
        level,
        enabled,
        power: enabled
          ? cardCalculation?.damageAddition ??
          this.heroPowerCalculator.calculatePower([item], { [item.id]: level })
          : 0,
        cardCalculation,
      };
    });
  });

  selectCategory(category: BuildCategory): void {
    this.selectedCategory.set(category);
  }

  updateLevel(item: CalculatorItem, level: number): void {
    this.buildState.setLevel(item, level);
  }

  toggleItem(itemId: string): void {
    this.buildState.toggleItem(itemId);
  }

  resetBuild(): void {
    this.buildState.resetBuild();
    this.shareStatus.set('Build reset');
  }

  maxAllLevels(): void {
    this.buildState.maxAllLevels();
    this.shareStatus.set('All levels maximized');
  }

  async saveAndShare(): Promise<void> {
    try {
      this.buildState.saveBuild();
      await navigator.clipboard.writeText(this.buildState.createShareUrl());
      this.shareStatus.set('Build saved · share link copied');
    } catch {
      this.shareStatus.set('Build saved on this device · clipboard unavailable');
    }
  }
}
