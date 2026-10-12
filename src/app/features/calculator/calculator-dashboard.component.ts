import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { BuildStateService } from '../../core/services/build-state.service';
import { CategoryTabsComponent } from './components/category-tabs/category-tabs.component';
import { ItemCardComponent } from './components/item-card/item-card.component';
import { PowerBannerComponent } from './components/power-banner/power-banner.component';
import { CalculatorEngineService } from './services/calculator-engine.service';
import { BuildCategory } from './models/calculator-item.model';

@Component({
  selector: 'app-calculator-dashboard',
  imports: [DecimalPipe, PowerBannerComponent, CategoryTabsComponent, ItemCardComponent],
  templateUrl: './calculator-dashboard.component.html',
  styleUrl: './calculator-dashboard.component.scss',
})
export class CalculatorDashboardComponent {
  private readonly buildState = inject(BuildStateService);
  private readonly calculator = inject(CalculatorEngineService);

  readonly categories = this.calculator.categories;
  readonly selectedCategory = signal<BuildCategory>('heroes');
  readonly shareStatus = signal('');
  readonly buildStateCount = computed(() => this.calculator.items().length);
  readonly enabledCount = this.calculator.enabledCount;
  readonly totalPower = this.calculator.totalPower;
  readonly categoryPowers = this.calculator.categoryPowers;
  readonly cardBonuses = this.calculator.cardBonuses;
  readonly cardBonusEntries = this.calculator.cardBonusEntries;
  readonly visibleItems = computed(() =>
    this.calculator.itemsForCategory(this.selectedCategory()).map((item) =>
      this.calculator.itemView(item),
    ),
  );

  get selectedCategoryLabel(): string {
    return this.categories.find((category) => category.id === this.selectedCategory())?.label ?? '';
  }

  selectCategory(category: BuildCategory): void {
    this.selectedCategory.set(category);
  }

  updateLevel(itemId: string, level: number): void {
    const item = this.calculator.items().find((entry) => entry.id === itemId);
    if (item) {
      this.buildState.setLevel(item.id, level, item.maxLevel);
    }
  }

  toggleItem(itemId: string): void {
    this.buildState.toggleItem(itemId);
  }

  resetBuild(): void {
    this.buildState.resetBuild(this.calculator.items());
    this.shareStatus.set('Build reset');
  }

  maxAllLevels(): void {
    this.buildState.maxAllLevels(this.calculator.items());
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
