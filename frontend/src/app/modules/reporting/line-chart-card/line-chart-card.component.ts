import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './line-chart-card.component.scss'
})
export class LineChartCardComponent {
  cardData = input.required<LineChartCardData>();
  // suppresses the card's own mat-card/title so it can be dropped into a host that supplies
  // its own header chrome (e.g. the dashboard's mat-card + app-dashboard-card-header)
  bare = input(false);

  option = computed<EChartsOption>(() => {
    const cardData = this.cardData();
    const showLegend = cardData.series.length > 1;
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
        // reserve extra room up top when the legend is shown, otherwise it has no dedicated
        // space and overlaps the plot/axis labels instead of sitting cleanly above them
        top: showLegend ? 40 : 24,
      },
      legend: {
        show: showLegend,
        top: 0,
        type: 'scroll',
      },
      tooltip: {
        trigger: 'axis',
      },
      series: cardData.series.map((series) => ({
        name: series.name,
        type: 'line',
        data: series.data,
        connectNulls: true,
        smooth: series.smooth ?? false,
        lineStyle: series.color ? { color: series.color } : undefined,
        itemStyle: series.color ? { color: series.color } : undefined,
        areaStyle: series.area ? {} : undefined,
      })),
    };
  });
}
