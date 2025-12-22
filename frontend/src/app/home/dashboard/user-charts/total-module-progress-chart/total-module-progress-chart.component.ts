import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { StudyPath } from '../../../../../../../interfaces/study-path';

@Component({
    selector: 'app-total-module-progress-chart',
    templateUrl: './total-module-progress-chart.component.html',
    styleUrls: ['./total-module-progress-chart.component.scss'],
    standalone: false
})
export class TotalModuleProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: StudyPath;

  modulProgressData: ChartConfiguration<'bar'>['data'];
  moduleProgressOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        display: false,
      },
    },
  };
  noDataMessage: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.calculateDataForCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.studyPath) {
      this.noDataMessage = false;
      this.calculateDataForCharts();
    }
  }

  private calculateDataForCharts() {
    // get passed, failed and taken modules and set module data
    const moduleData = this.getModuleStatistics(this.studyPath);
    // display no data message if modules are empty
    // for each item in moduleData
    // if item is larger than 0, set noDataMessage to true
    moduleData.forEach((item) => {
      if (item > 0) {
        this.noDataMessage = true;
      }
    });

    this.modulProgressData = {
      labels: ['Bestanden', 'Nicht bestanden', 'Belegt'],
      datasets: [
        {
          data: moduleData,
          backgroundColor: ['#97BF0D', '#E6444F', '#00457D'],
          hoverBackgroundColor: ['#C1D86E', '#F08F95', '#6690B1'],
        },
      ],
    };
  }

  private getModuleStatistics(studyPath: StudyPath): number[] {
    let passed = 0;
    let failed = 0;
    let taken = 0;
    for (let module of studyPath.completedModules) {
      switch (module.status) {
        case 'passed':
          passed++;
          break;
        case 'failed':
          failed++;
          break;
        case 'taken':
          taken++;
          break;
        default:
          break;
      }
    }
    return [passed, failed, taken];
  }
}
