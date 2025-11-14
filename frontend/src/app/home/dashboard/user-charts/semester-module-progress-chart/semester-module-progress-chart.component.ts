import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SemesterStudyPath } from '../../../../../../../interfaces/study-path';
import { Semester } from '../../../../../../../interfaces/semester';
import { StudyPlan } from '../../../../../../../interfaces/study-plan';

@Component({
    selector: 'app-semester-module-progress-chart',
    templateUrl: './semester-module-progress-chart.component.html',
    styleUrls: ['./semester-module-progress-chart.component.scss'],
    standalone: false
})
export class SemesterModuleProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: SemesterStudyPath[];
  @Input() semesters: Semester[];
  @Input() studyPlan: StudyPlan | undefined | null;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  public barChartData: ChartData<'bar'>;
  noDataMessage: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.calculateDataForChart();
  }

  ngOnChanges() {
    this.noDataMessage = false;
    this.calculateDataForChart();
  }

  calculateDataForChart() {
    this.barChartData = {
      labels: this.semesters.map((semester) => semester.shortName),
      datasets: [
        {
          data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'passed'),
          label: 'Bestanden',
          backgroundColor: 'rgba(172, 204, 61, 0.8)',
          borderColor: '#97bf0d',
          hoverBackgroundColor: '#97bf0d',
          hoverBorderColor: '#97bf0d',
        },
        {
          data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'taken'),
          label: 'Belegt',
          backgroundColor: 'rgba(102, 144, 177, 0.8)',
          borderColor: 'rgb(51, 106, 151)',
          hoverBackgroundColor: '#00457d',
          hoverBorderColor: 'rgb(51, 106, 151)',
        },
        {
          data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'failed'),
          label: 'Nicht bestanden',
          backgroundColor: 'rgba(235, 105, 114, 0.8)',
          borderColor: '#e6444f',
          hoverBackgroundColor: 'rgb(235, 105, 114)',
          hoverBorderColor: '#e6444f',
        },
      ],
    };
  }
  // TODO
  // returns for the given status the number of modules for each semester
  private getNumberOfModulesFromStudyPath(
    path: SemesterStudyPath[],
    status: string
  ): number[] {
    return path.map((el) => {
      const filteredModules = el.modules.filter((el) => el.status == status);
      // display no data message if modules are empty
      filteredModules.forEach((module) => {
        if (module) {
          this.noDataMessage = true;
        }
      });
      return filteredModules.length;
    });
  }

  // TODO
  // returns the number of modules that are not in study path but in study plan for each semester
  private getNumberOfModulesFromStudyPlan(
    path: SemesterStudyPath[],
    studyPlan: StudyPlan
  ): number[] {
    const modulesInStudyPath = path.map((el) => el.modules.length);
    return studyPlan.semesterPlans.map(
      (el, i) => el.modules.length - modulesInStudyPath[i]
    );
  }
}
