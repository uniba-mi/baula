import { Component, computed, input } from '@angular/core';
import { PieCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { EchartsHostComponent } from '../echarts-host/echarts-host.component';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'reporting-pie-chart-card',
  imports: [
    MatCardModule,
    EchartsHostComponent
  ],
  templateUrl: './pie-chart-card.component.html',
  styleUrl: './pie-chart-card.component.scss'
})
export class PieChartCardComponent {
  cardData = input.required<PieCardData>();
  // suppresses the card's own mat-card/title so it can be dropped into a host that supplies
  // its own header chrome (e.g. the dashboard's mat-card + app-dashboard-card-header)
  bare = input(false);

  option = computed<EChartsOption>(() => {
    const cardData = this.cardData();
    const ringCount = cardData.rings.length;
    // evenly split the radius into one band per ring (innermost = rings[0]), with a small gap
    // between bands so concentric rings stay visually distinguishable from one another
    const bandWidth = 90 / ringCount;

    return {
      tooltip: { trigger: 'item' },
      legend: {
        show: true,
        top: 0,
        type: 'scroll',
        data: cardData.categories,
      },
      series: cardData.rings.map((ring, ringIndex) => ({
        type: 'pie',
        name: ring.name,
        radius: [
          ringIndex === 0 ? '0%' : `${(ringIndex * bandWidth + 2).toFixed(0)}%`,
          `${((ringIndex + 1) * bandWidth - 2).toFixed(0)}%`,
        ],
        label: { show: false },
        data: cardData.categories.map((category, categoryIndex) => ({
          name: category,
          value: ring.data[categoryIndex],
          itemStyle: { color: cardData.colors[categoryIndex] },
        })),
      })),
    } as EChartsOption;
  });
}
