import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartMetadata, chartMetadata } from 'src/app/shared/constants/chartMetadata';

@Component({
    selector: 'app-quicklinks',
    templateUrl: './quicklinks.component.html',
    styleUrl: './quicklinks.component.scss',
    standalone: false
})
export class QuicklinksComponent implements OnInit {
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
