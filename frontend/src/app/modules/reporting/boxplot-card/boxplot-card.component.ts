import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { BoxplotCardData } from '../reporting';
import { MatCardModule } from '@angular/material/card';
import { EchartsHostComponent } from '../echarts-host/echarts-host.component';
import type { EChartsOption } from 'echarts';

const CATEGORY_COLORS = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA'];

// echarts defaults the boxplot border to a fixed blue regardless of the fill color unless
// itemStyle.borderColor is set explicitly - darken the fill color so the border still reads
// as "this category", just a shade deeper, instead of a mismatched default blue everywhere
function darken(hex: string, amount = 0.35): string {
  const num = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.max(0, Math.round(((num >> shift) & 0xff) * (1 - amount)));
  return `#${[channel(16), channel(8), channel(0)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

@Component({
  selector: 'reporting-boxplot-card',
  imports: [
    MatCardModule,
    EchartsHostComponent
  ],
  templateUrl: './boxplot-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './boxplot-card.component.scss'
})
export class BoxplotCardComponent {
  cardData = input.required<BoxplotCardData>();

  option = computed<EChartsOption>(() => {
    const cardData = this.cardData();
    const grouped = cardData.groups.length > 1;
    const colorFor = (categoryIndex: number) => CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];

    // Every (group, category) combination gets its own dedicated x-axis slot instead of
    // relying on echarts' automatic bar-family dodging for the boxplot series - that dodging
    // only applies to the boxplot series, not to a scatter overlay, which would then drift
    // out of alignment with "its" box. A single flattened axis keeps boxplot and outlier
    // points pinned to the exact same coordinate no matter how many groups/categories there are.
    const xLabels: string[] = [];
    const boxplotData: (string | { value: number[]; itemStyle: { color: string; borderColor: string } })[] = [];
    const outlierData: { value: [string, number]; itemStyle: { color: string } }[] = [];

    cardData.groups.forEach((group, groupIndex) => {
      cardData.categories.forEach((category, categoryIndex) => {
        const xLabel = grouped ? `${group}\n${category}` : category;
        xLabels.push(xLabel);

        const stats = cardData.data[groupIndex][categoryIndex];
        boxplotData.push(
          stats
            ? { value: stats, itemStyle: { color: colorFor(categoryIndex), borderColor: darken(colorFor(categoryIndex)) } }
            : '-'
        );

        cardData.outliers[groupIndex][categoryIndex].forEach((value) => {
          outlierData.push({ value: [xLabel, value], itemStyle: { color: colorFor(categoryIndex) } });
        });
      });
    });

    return {
      xAxis: {
        type: 'category',
        data: xLabels,
        boundaryGap: true,
        axisLabel: { rotate: 30, hideOverlap: true },
      },
      yAxis: {
        type: 'value',
      },
      grid: {
        containLabel: true,
        left: 8,
        right: 110,
        bottom: 8,
        top: 24,
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        right: 4,
        top: 'middle',
        data: cardData.categories,
        // boxplot/outliers now live in one shared series each (see below) so a per-category
        // legend toggle isn't possible anymore - the legend is a static color key only
        selectedMode: false,
      },
      series: [
        {
          name: 'Verteilung',
          type: 'boxplot',
          data: boxplotData,
        },
        // invisible per-category series purely so the legend shows the right name/color pairing;
        // deliberately NOT type 'boxplot' - echarts groups/dodges same-axis boxplot series by
        // count, so even empty boxplot series here could shrink and re-offset the real one
        ...cardData.categories.map((category, index) => ({
          name: category,
          type: 'scatter' as const,
          data: [],
          itemStyle: { color: colorFor(index) },
        })),
        {
          name: 'Ausreißer',
          type: 'scatter',
          symbolSize: 6,
          data: outlierData,
          tooltip: { formatter: (params: any) => `${params.value[0].replace('\n', ' ')} Ausreißer: ${params.value[1]}` },
        },
      ],
    } as EChartsOption;
  });
}
