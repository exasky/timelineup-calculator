import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalculatorDashboardComponent } from './features/calculator/calculator-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [CalculatorDashboardComponent],
  template: '<app-calculator-dashboard />',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App { }
