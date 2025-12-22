import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { BarChartComponent } from './chart/bar-chart/bar-chart.component';
import { DonutChartComponent } from './chart/donut-chart/donut-chart.component';
import { BaseChartDirective  } from 'ng2-charts';
import { StoreModule } from '@ngrx/store';
import * as fromChart from '../compvis/state/chart.reducers';
import { SharedModule } from '../shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    ChartComponent,
    BarChartComponent,
    DonutChartComponent
  ],
  imports: [
    CommonModule,
    BaseChartDirective,
    StoreModule.forFeature('chart', fromChart.reducer),
    SharedModule,
    MatTooltipModule
  ], 
  exports: [
    ChartComponent
  ]
})
export class CompvisModule { }
