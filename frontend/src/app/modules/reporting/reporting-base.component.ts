import { Component, input } from '@angular/core';
import { Report } from './reporting';
import { BarChartCardComponent } from './bar-chart-card/bar-chart-card.component';
import { MetaDataCardComponent } from './meta-data-card/meta-data-card.component';
import { TableCardComponent } from './table-card/table-card.component';

@Component({
  selector: 'reporting-base',
  imports: [
    BarChartCardComponent,
    MetaDataCardComponent,
    TableCardComponent
  ],
  templateUrl: './reporting-base.component.html',
  styleUrl: './reporting-base.component.scss'
})
export class ReportingBaseComponent {
  report = input.required<Report>()
}
