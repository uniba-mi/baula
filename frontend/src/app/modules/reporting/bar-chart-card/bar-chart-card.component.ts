import { Component, computed, input } from '@angular/core';
import { BarChartCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { EchartsHostComponent } from '../echarts-host/echarts-host.component';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'reporting-bar-chart-card',
  imports: [
    MatCardModule,
    EchartsHostComponent
  ],
  templateUrl: './bar-chart-card.component.html',
  styleUrl: './bar-chart-card.component.scss'
})
export class BarChartCardComponent {
  cardData = input.required<BarChartCardData>();

  option = computed<EChartsOption>(() => {
    const cardData = this.cardData();
    const showLegend = cardData.series.length > 1;
    return {
      xAxis: {
        type: 'category',
        data: cardData.xLabels,
        axisLabel: { rotate: 45, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
      },
      grid: {
        containLabel: true,
        left: 8,
        right: 16,
        bottom: 8,
        // reserve extra room up top when the legend is shown, otherwise it has no dedicated
        // space and overlaps the plot/axis labels instead of sitting cleanly above them
        top: showLegend ? 40 : 24,
      },
      legend: {
        show: showLegend,
        top: 0,
        // keeps the legend to a single row (scrolling instead of wrapping) so its height stays
        // predictable and the reserved grid.top above always fits it, regardless of series count
        type: 'scroll',
      },
      tooltip: {
        trigger: 'axis',
      },
      series: cardData.series.map((series) => ({
        name: series.name,
        type: 'bar',
        data: series.data.map((point) =>
          typeof point === 'object'
            ? { value: point.value, itemStyle: point.color ? { color: point.color } : undefined }
            : point
        ),
        itemStyle: series.color ? { color: series.color } : undefined,
      })),
    };
  });
}
