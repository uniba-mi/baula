import { Component, input } from '@angular/core';
import { Report } from './reporting';
import { BarChartCardComponent } from './bar-chart-card/bar-chart-card.component';
import { MetaDataCardComponent } from './meta-data-card/meta-data-card.component';
import { TableCardComponent } from './table-card/table-card.component';
import { BoxplotCardComponent } from './boxplot-card/boxplot-card.component';
import { LineChartCardComponent } from './line-chart-card/line-chart-card.component';
import { QuoteCardComponent } from './quote-card/quote-card.component';
import { PieChartCardComponent } from './pie-chart-card/pie-chart-card.component';

@Component({
  selector: 'reporting-base',
  imports: [
    BarChartCardComponent,
    MetaDataCardComponent,
    TableCardComponent,
    BoxplotCardComponent,
    LineChartCardComponent,
    QuoteCardComponent,
    PieChartCardComponent
  ],
  templateUrl: './reporting-base.component.html',
  styleUrl: './reporting-base.component.scss'
})
export class ReportingBaseComponent {
  report = input.required<Report>()
}
