import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-power-banner',
  imports: [DecimalPipe],
  templateUrl: './power-banner.component.html',
  styleUrl: './power-banner.component.scss',
})
export class PowerBannerComponent {
  readonly totalPower = input.required<number>();
  readonly shareStatus = input('');
  readonly resetBuild = output<void>();
  readonly maxAllLevels = output<void>();
  readonly saveShare = output<void>();
}
