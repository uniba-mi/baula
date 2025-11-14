import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartMetadata, chartMetadata } from 'src/app/shared/constants/chart-metadata';

@Component({
    selector: 'app-quick-links',
    templateUrl: './quick-links.component.html',
    styleUrl: './quick-links.component.scss',
    standalone: false
})
export class QuickLinksComponent implements OnInit {
  @Input() key: string;
  @Output() changeVisibility = new EventEmitter<string>()

  chartMetadata = chartMetadata
  chartData: ChartMetadata | undefined;

  ngOnInit(): void {
    this.chartData = chartMetadata.find(el => el.key === this.key)
  }

  hideElement() {
    this.changeVisibility.emit(this.key)
  }
}
