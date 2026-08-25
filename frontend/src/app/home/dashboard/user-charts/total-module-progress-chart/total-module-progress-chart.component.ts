import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { StudyPath } from '@interfaces/study-path';
import { BarChartCardData } from 'src/app/modules/reporting/reporting';

@Component({
    selector: 'app-total-module-progress-chart',
    templateUrl: './total-module-progress-chart.component.html',
    styleUrls: ['./total-module-progress-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TotalModuleProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: StudyPath;

  cardData: BarChartCardData | undefined;
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

    const colors = ['#97BF0D', '#E6444F', '#00457D'];
    this.cardData = {
      title: 'Modulbelegungen (Gesamt)',
      xLabels: ['Bestanden', 'Nicht bestanden', 'Belegt'],
      series: [{
        data: moduleData.map((value, i) => ({ value, color: colors[i] })),
      }],
    } satisfies BarChartCardData;
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
