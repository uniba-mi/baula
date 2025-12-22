import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartMetadata, chartMetadata } from 'src/app/shared/constants/chart-metadata';

@Component({
    selector: 'app-dashboard-card-header',
    templateUrl: './dashboard-card-header.component.html',
    styleUrls: ['./dashboard-card-header.component.scss'],
    standalone: false
})
export class DashboardCardHeaderComponent implements OnInit {
  @Input() key: string;
  @Input() showCompletionBadge = false;
  @Output() changeVisibility = new EventEmitter<string>()

  chartMetadata = chartMetadata
  chartData: ChartMetadata | undefined;


  constructor() { }

  ngOnInit(): void {
    this.chartData = chartMetadata.find(el => el.key === this.key)
  }

  hideElement() {
    this.changeVisibility.emit(this.key)
  }
}
