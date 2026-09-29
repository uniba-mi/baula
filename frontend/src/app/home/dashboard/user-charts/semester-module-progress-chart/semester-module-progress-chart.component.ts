import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SemesterStudyPath } from '@interfaces/study-path';
import { Semester } from '@interfaces/semester';
import { StudyPlan } from '@interfaces/study-plan';
import { BarChartCardData } from 'src/app/modules/reporting/reporting';

@Component({
    selector: 'app-semester-module-progress-chart',
    templateUrl: './semester-module-progress-chart.component.html',
    styleUrls: ['./semester-module-progress-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SemesterModuleProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: SemesterStudyPath[];
  @Input() semesters: Semester[];
  @Input() studyPlan: StudyPlan | undefined | null;

  public cardData: BarChartCardData;
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
    this.cardData = {
      title: $localize`Modul Fortschritt nach Semester`,
      stacked: true,
      xLabels: this.semesters.map((semester) => semester.shortName),
      series: [
        { name: $localize`Bestanden`, data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'passed'), color: '#97bf0d' },
        { name: $localize`Belegt`, data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'taken'), color: '#00457d' },
        { name: $localize`Nicht bestanden`, data: this.getNumberOfModulesFromStudyPath(this.studyPath, 'failed'), color: '#e6444f' },
      ],
    } satisfies BarChartCardData;
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
