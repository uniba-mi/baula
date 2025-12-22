import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  catchError,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ChartVisibility, User } from '../../../../../interfaces/user';
import { Store } from '@ngrx/store';
import {
  getDashboardSettings,
  getSemesterList,
  getUser,
  getUserStudyPath,
  getVisibleCharts,
} from 'src/app/selectors/user.selectors';
import {
  SemesterStudyPath,
  StudyPath,
} from '../../../../../interfaces/study-path';
import { Semester } from '../../../../../interfaces/semester';
import {
  getActiveStudyPlan,
  getPlanCourses,
  getSemesterPlan,
  getShowFinishSemesterInfo,
  getStudyPlans,
} from 'src/app/selectors/study-planning.selectors';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { ModuleGroup } from '../../../../../interfaces/module-group';
import { getFirstLevelModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { combineLatest } from 'rxjs';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { DashboardActions } from 'src/app/actions/user.actions';
import { AcademicDate } from '../../../../../interfaces/academic-date';
import { RestService } from 'src/app/rest.service';
import {
  PlanCourse,
  SemesterPlan,
} from '../../../../../interfaces/semester-plan';
import { chartMetadata } from 'src/app/shared/constants/chart-metadata';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('feedbackTooltip') feedbackTooltip: MatTooltip;
  maintenance = false; // Variable to disable features and make maintenance message visible
  private destroy$ = new Subject<void>();
  user$: Observable<User>;
  studyPath$: Observable<StudyPath>;
  semesters$: Observable<Semester[]>;
  activeStudyPlan$: Observable<StudyPlan | undefined>;
  maxEcts: number = 180;
  visibleCharts$: Observable<ChartVisibility[]>;
  dashboardSettings$: Observable<ChartVisibility[]>;
  modulegroups$: Observable<ModuleGroup[] | undefined>;
  studyPlans$: Observable<StudyPlan[]>;
  semesterStudyPath: SemesterStudyPath[]; // variable for study path separted by semester
  splitIndex: number = 0;
  activePlan$: Observable<SemesterPlan | undefined>;
  planCourses$: Observable<PlanCourse[]>;
  initialView = 'timeGridDay';
  academicDates$: Observable<AcademicDate[]>;
  isWidget: boolean = true;
  chartMetadata = chartMetadata;
  finishSemesterHint: string = 'finishSemester-hint';
  finishSemesterHintMessage: string =
    'Es ist Zeit, dein Semester abzuschließen. Navigiere über "Studienverlaufsplan" zu deinem Plan und schließe das Semester ab, indem du auf "Jetzt Semester abschließen" klickst. Nur so können deine Module und Platzhalter aus dem vergangenen Semester zum Studienverlauf hinzugefügt und deine aktuellen Leistungen berücksichtigt werden.';
  showFinishSemesterHint$: Observable<boolean>;
  isPersonalisationComplete = false;

  constructor(
    private store: Store,
    private transform: TransformationService,
    private rest: RestService,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.studyPath$ = this.store.select(getUserStudyPath);
    this.semesters$ = this.store.select(getSemesterList);
    this.activeStudyPlan$ = this.store.select(getActiveStudyPlan);
    this.visibleCharts$ = this.store.select(getVisibleCharts);
    this.dashboardSettings$ = this.store.select(getDashboardSettings);
    this.modulegroups$ = this.store.select(getFirstLevelModuleGroups);
    this.activePlan$ = this.store.select(getSemesterPlan);
    this.studyPlans$ = this.store.select(getStudyPlans);
    this.planCourses$ = this.store.select(getPlanCourses);
    combineLatest([this.studyPath$, this.semesters$])
      .pipe(
        switchMap(([path, semester]) =>
          this.transform.transformStudyPath(path, semester)
        )
      )
      .subscribe((semesterStudyPath) => {
        this.semesterStudyPath = semesterStudyPath;
        this.splitIndex = this.semesterStudyPath.findIndex(
          (el) => el.semester === new Semester().fullName
        );
      });
    this.showFinishSemesterHint$ = this.store.select(getShowFinishSemesterInfo);

    this.activePlan$.pipe(takeUntil(this.destroy$)).subscribe((plan) => {
      if (plan && plan.semester) {
        this.academicDates$ = this.rest
          .getAcademicDatesOfSemester(plan.semester)
          .pipe(
            catchError((error) => {
              this.auth.forceReload(error);
              return of([]); // Return an empty array or handle the error as needed
            })
          );
      }
    });
  }

  ngAfterViewInit(): void {
    this.feedbackTooltip.show(7500);
    this.cd.detectChanges();
    setTimeout(() => this.feedbackTooltip.hide(), 15000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  findEntryName(key: string): string {
    const entry = chartMetadata.find((el) => el.key === key);
    return entry ? entry.name : '';
  }

  changeVisibility(key: string) {
    this.store.dispatch(
      DashboardActions.updateDashboardView({ chartName: key })
    );
  }

  navigateToVC() {
    window.open(
      'https://vc.uni-bamberg.de/course/view.php?id=71480'
    );
  }

  onPersonalisationComplete(isComplete: boolean) {
    this.isPersonalisationComplete = isComplete;
  }
}
