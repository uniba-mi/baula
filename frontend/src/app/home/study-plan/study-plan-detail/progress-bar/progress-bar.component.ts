import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  SemesterStudyPath,
} from '../../../../../../../interfaces/study-path';
import { SemesterPlan } from '../../../../../../../interfaces/semester-plan';
import { combineLatest, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  standalone: false
})
export class ProgressBarComponent {
    @Input() totalCredits: number;
    @Input() semesterPlans$: Observable<SemesterPlan[] | undefined>;
    @Input() studyPath$: Observable<SemesterStudyPath[]>;
    achievedCredits$: Observable<number>;
    plannedCredits$: Observable<number>;
    achievedPercentage$: Observable<number>;
    plannedPercentage$: Observable<number>;

    totalTooltip: string;
    achievedTooltip$: Observable<string>;
    plannedTooltip$: Observable<string>;

    ngOnInit(): void {
      this.totalTooltip = `Insgesamt umfasst dein Studium ${this.totalCredits} ECTS.`;

      this.achievedCredits$ = this.studyPath$.pipe(
        startWith([]),
        map((studyPath) => this.calculateAchievedCredits(studyPath))
      );

      this.plannedCredits$ = combineLatest([
        this.semesterPlans$.pipe(startWith(undefined)),
        this.studyPath$.pipe(startWith([]))
      ]).pipe(
        map(([semesterPlans, studyPath]) =>
          this.calculatePlannedCredits(semesterPlans || [], studyPath)
        )
      );

      this.achievedPercentage$ = this.achievedCredits$.pipe(
        map((achievedCredits) =>
          this.totalCredits > 0 ? (achievedCredits / this.totalCredits) * 100 : 0
        )
      );

      this.achievedTooltip$ = this.achievedCredits$.pipe(
        map(
          (achievedCredits) =>
            `Du hast aktuell ${achievedCredits} ECTS von insgesamt ${this.totalCredits} ECTS eingeplant.`
        )
      );

      this.plannedPercentage$ = this.plannedCredits$.pipe(
        map((plannedCredits) =>
          this.totalCredits > 0 ? (plannedCredits / this.totalCredits) * 100 : 0
        )
      );

      this.plannedTooltip$ = this.plannedCredits$.pipe(
        map(
          (plannedCredits) =>
            `Du hast aktuell ${plannedCredits} ECTS von insgesamt ${this.totalCredits} ECTS durch bestandene Module erreicht.`
        )
      );
    }

    calculateAchievedCredits(path: SemesterStudyPath[]): number {
      return path
        .map((path) => path.modules)
        .reduce((pv, cv) => pv.concat(cv), [])
        .filter((mod) => mod.status === 'passed')
        .map((mod) => mod.ects)
        .reduce((pv, cv) => pv + cv, 0);
    }

    calculatePlannedCredits(semesterPlans: SemesterPlan[],
      studyPath: SemesterStudyPath[]): number {
      const passedSemesterCredits = this.calculateAchievedCredits(
        studyPath.filter((path) => path.isPastSemester)
      );
      const futureSemesterCredits = semesterPlans.filter(
        (plan) => !plan.isPastSemester
      ).map(plan => plan.summedEcts).reduce((pv, cv) => pv + cv, 0);
      return passedSemesterCredits + futureSemesterCredits;
    }
}
