import { DecimalPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import {
  CardCalculation,
  CardRarity,
  CARD_PRIMARY_STAT_METADATA,
  formatCardPrimaryStatValue,
} from '../../../../core/models/card.model';
import { BUILD_CATEGORIES, CalculatorItem } from '../../models/calculator-item.model';

@Component({
  selector: 'app-item-card',
  imports: [DecimalPipe],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
})
export class ItemCardComponent {
  readonly item = input.required<CalculatorItem>();
  readonly level = input.required<number>();
  readonly enabled = input.required<boolean>();
  readonly power = input.required<number>();
  readonly cardCalculation = input<CardCalculation>();
  readonly levelChange = output<number>();
  readonly enabledChange = output<void>();
  readonly accent = computed(
    () => BUILD_CATEGORIES.find((category) => category.id === this.item().category)?.accent ?? '#7ed3b2',
  );
  readonly levelProgress = computed(() =>
    this.item().maxLevel > 0 ? (this.level() / this.item().maxLevel) * 100 : 0,
  );
  readonly rarityAccent = computed(() => {
    const colors: Record<CardRarity, string> = {
      common: '#aab4ad',
      rare: '#68a9e8',
      epic: '#c28be8',
      legendary: '#edb853',
      mythic: '#ef7e9b',
    };
    return colors[this.item().card?.rarity ?? 'common'];
  });

  primaryBonusLabel(): string {
    const card = this.item().card;
    const calculation = this.cardCalculation();
    if (!card || !calculation) {
      return '';
    }

    const stat = CARD_PRIMARY_STAT_METADATA[card.primaryStatType];
    return `${formatCardPrimaryStatValue(card.primaryStatType, calculation.primaryStatBonus)} ${stat.label}`;
  }

  overflowBonusLabel(): string {
    const bonus = this.item().card?.flatDamageBonusAfterCap ?? 0;
    return `+${bonus.toLocaleString()} damage per level`;
  }

  onLevelInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.value !== '') {
      this.levelChange.emit(Number(target.value));
    }
  }
}
