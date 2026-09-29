import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { BarChartComponent } from './chart/bar-chart/bar-chart.component';
import { DonutChartComponent } from './chart/donut-chart/donut-chart.component';
import { StoreModule } from '@ngrx/store';
import * as fromChart from '../compvis/state/chart.reducers';
import { SharedModule } from '../shared/shared.module';
import { EchartsHostComponent } from '../reporting/echarts-host/echarts-host.component';


@NgModule({
  declarations: [
    ChartComponent,
    BarChartComponent,
    DonutChartComponent
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature('chart', fromChart.reducer),
    SharedModule,
    EchartsHostComponent
  ],
  exports: [
    ChartComponent
  ]
})
export class CompvisModule { }
