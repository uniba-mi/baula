import { Component, computed, input } from '@angular/core';
import { LineChartCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { EchartsHostComponent } from '../echarts-host/echarts-host.component';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'reporting-line-chart-card',
  imports: [
    MatCardModule,
    EchartsHostComponent
  ],
  templateUrl: './line-chart-card.component.html',
  styleUrl: './line-chart-card.component.scss'
})
export class LineChartCardComponent {
  cardData = input.required<LineChartCardData>();

  option = computed<EChartsOption>(() => {
    const cardData = this.cardData();
    return {
      xAxis: {
        type: 'category',
        data: cardData.xLabels,
        axisLabel: { rotate: 30, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
      },
      grid: {
        containLabel: true,
        left: 8,
        right: 16,
        bottom: 8,
        top: 24,
      },
      legend: {
        show: cardData.series.length > 1,
        top: 0
      },
      tooltip: {
        trigger: 'axis',
      },
      series: cardData.series.map((series) => ({
        name: series.name,
        type: 'line',
        data: series.data,
        connectNulls: true,
      })),
    };
  });
}
