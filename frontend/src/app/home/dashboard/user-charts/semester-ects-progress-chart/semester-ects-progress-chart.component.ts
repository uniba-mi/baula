import { Component, Input, OnChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SemesterStudyPath, StudyPath } from '@interfaces/study-path';
import { Semester } from '@interfaces/semester';
import { StudyPlan } from '@interfaces/study-plan';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { LineChartCardData } from 'src/app/modules/reporting/reporting';

@Component({
  selector: 'app-semester-ects-progress-chart',
  templateUrl: './semester-ects-progress-chart.component.html',
  styleUrls: ['./semester-ects-progress-chart.component.scss'],
  standalone: false,
})
export class SemesterEctsProgressChartComponent implements OnInit, OnChanges, OnDestroy {
  private transform = inject(TransformationService);
  private destroy$ = new Subject<void>();

  @Input() studyPath: StudyPath;
  @Input() semesters: Semester[];
  @Input() studyPlan: StudyPlan | undefined | null;
  studyPathInSemester: SemesterStudyPath[] = [];

  public cardData: LineChartCardData;

  ngOnInit(): void {
    this.transform
      .transformStudyPath(this.studyPath, this.semesters)
      .pipe(takeUntil(this.destroy$))
      .subscribe((studyPathInSemester) => {
        this.studyPathInSemester = studyPathInSemester;
        this.calculateDataForLineChart();
      });
    this.calculateDataForLineChart();
  }

  ngOnChanges() {
    this.transform
      .transformStudyPath(this.studyPath, this.semesters)
      .pipe(takeUntil(this.destroy$))
      .subscribe((studyPathInSemester) => {
        this.studyPathInSemester = studyPathInSemester;
        this.calculateDataForLineChart();
      });
    this.calculateDataForLineChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateDataForLineChart() {
    const series: LineChartCardData['series'] = [
      { name: 'Belegte ECTS (Ist)', data: this.getEctsProgressFromStudyPath(this.studyPathInSemester, 'taken'), color: 'rgb(51, 106, 151)', area: true, smooth: true },
      { name: 'Bestandene ECTS (Ist)', data: this.getEctsProgressFromStudyPath(this.studyPathInSemester, 'passed'), color: '#97bf0d', area: true, smooth: true },
      { name: 'Nicht bestandene ECTS (Ist)', data: this.getEctsProgressFromStudyPath(this.studyPathInSemester, 'failed'), color: '#e6444f', area: true, smooth: true },
    ];
    if (this.studyPathInSemester) {
      series.push(
        { name: 'Ziel ECTS (Plan)', data: this.getEctsProgressFromStudyPlan('aim'), color: 'rgba(77,83,96,1)', area: true, smooth: true },
        { name: 'Eingeplante ECTS (Plan)', data: this.getEctsProgressFromStudyPlan('planned'), color: 'rgb(159, 159, 156)', area: true, smooth: true },
      );
    }

    this.cardData = {
      title: 'ECTS Fortschritt nach Semester',
      xLabels: this.semesters.map((semester) => semester.shortName),
      series,
    } satisfies LineChartCardData;
  }

  /** ------------------------------
   *  Helper function to get ects values for each semester out of study plan (soll-status)
   * @param status defines which data should be returned, can be 'aim' for aimedEcts for each Semester or 'planned' for ects that are planed with modules
   * @returns array with ects for each semester (length is same as semesters)
     ------------------------------- */
  private getEctsProgressFromStudyPlan(status: string): number[] {
    if (this.studyPlan) {
      // check if aimed or planned ects are requested
      if (status == 'aim') {
        return this.studyPlan.semesterPlans.map((plan) => plan.aimedEcts);
      } else if (status == 'planned') {
        return this.studyPlan.semesterPlans.map((plan) => plan.summedEcts);
      } else {
        // invalid status, return empty array
        return [];
      }
    } else {
      return [];
    }
  }

  /** ------------------------------
   *  Helper function to get ects values from study path (ist-status)
   * @param status defines which data should be returned, stands for status of modules that should be combined (e.g. 'passed' for all modules that were passed in this semester)
   * @returns array with ects for each semester (length is same as semesters)
      ------------------------------ */
  private getEctsProgressFromStudyPath(
    path: SemesterStudyPath[],
    status: string,
  ): number[] {
    return path.map((el) => {
      const passedModulesEcts = el.modules
        .filter((mod) => mod.status == status)
        .map((module) => module.ects)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      return passedModulesEcts;
    });
  }
}
