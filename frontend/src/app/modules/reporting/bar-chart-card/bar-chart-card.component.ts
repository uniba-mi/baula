import { Component, input } from '@angular/core';
import { BarChartCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'reporting-bar-chart-card',
  imports: [
    MatCardModule,
    BaseChartDirective
  ],
  templateUrl: './bar-chart-card.component.html',
  styleUrl: './bar-chart-card.component.scss'
})
export class BarChartCardComponent {
  cardData = input.required<BarChartCardData>();
}
