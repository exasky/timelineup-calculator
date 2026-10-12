import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import {
  BuildCategory,
  BuildCategoryDefinition,
} from '../../models/calculator-item.model';

@Component({
  selector: 'app-category-tabs',
  imports: [DecimalPipe],
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.scss',
})
export class CategoryTabsComponent {
  readonly categories = input.required<readonly BuildCategoryDefinition[]>();
  readonly selectedCategory = input.required<BuildCategory>();
  readonly categoryPowers = input.required<Record<BuildCategory, number>>();
  readonly categorySelected = output<BuildCategory>();
}
