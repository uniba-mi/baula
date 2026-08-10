import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'reporting-echarts-host',
  imports: [],
  templateUrl: './echarts-host.component.html',
  styleUrl: './echarts-host.component.scss'
})
export class EchartsHostComponent implements AfterViewInit, OnDestroy {
  option = input.required<EChartsOption>();

  private container = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
  private chart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      const option = this.option();
      this.chart?.setOption(option, true);
    });
  }

  ngAfterViewInit(): void {
    const element = this.container().nativeElement;

    // cards embedded in a mat-tab-group (e.g. the admin dashboard) can mount with a 0x0
    // container while the tab is still being laid out/animated in - initializing echarts
    // then triggers its "Can't get DOM width or height" warning. Skip init until the
    // container actually has a size; the same observer below retries once it does.
    const tryInit = (): void => {
      if (this.chart || element.clientWidth === 0 || element.clientHeight === 0) {
        return;
      }
      this.chart = echarts.init(element);
      this.chart.setOption(this.option());
    };

    tryInit();

    this.resizeObserver = new ResizeObserver(() => (this.chart ? this.chart.resize() : tryInit()));
    this.resizeObserver.observe(element);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }
}
