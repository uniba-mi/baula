import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { State } from 'src/app/reducers';
import { RestService } from 'src/app/rest.service';
import { Timetable } from 'src/app/shared/classes/timetable';
import {
  PlanCourse,
  SemesterPlan,
  PlanningHints,
  DeletedCourse,
} from '../../../../../interfaces/semester-plan';
import { Course } from '../../../../../interfaces/course';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { AcademicDate } from '../../../../../interfaces/academic-date';
import { Semester } from '../../../../../interfaces/semester';
import { getSemesterList } from 'src/app/selectors/user.selectors';
import { MatSidenav } from '@angular/material/sidenav';
import {
  getActiveSemester,
  getEctsSumOfSemesterPlan,
  getPlanCourses,
  getPlanningHints,
  getSemesterPlan,
} from 'src/app/selectors/study-planning.selectors';
import {
  CoursePlanningActions,
  TimetableActions,
} from 'src/app/actions/study-planning.actions';
import { Router } from '@angular/router';
import { ModService } from 'src/app/shared/services/module.service';
import { IndexedDbService } from 'src/app/shared/services/indexed-db.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

import type { DownloadService } from 'src/app/shared/services/download.service';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';


@Component({
  selector: 'app-semester-plan',
  templateUrl: './semester-plan.component.html',
  styleUrls: ['./semester-plan.component.scss'],
  standalone: false,
})
export class SemesterPlanComponent implements OnInit, OnDestroy {
  @ViewChild('coursesearch') coursesearch: MatSidenav;

  maintenance = false; // Variable to disable features and make maintenance message visible
  private destroy$ = new Subject<void>();
  semesters$: Observable<Semester[]>;
  activeSemester$: Observable<string>;
  activeSemester: string;
  activePlan$: Observable<SemesterPlan | undefined>;
  activePlan: SemesterPlan;
  planCourses$: Observable<PlanCourse[]>;
  courses$: Observable<(Course | DeletedCourse)[]>;
  ectsSum$: Observable<number | null | undefined>;
  semesterPlanHint: string = 'semesterPlan-hint';
  semesterPlanHintMessage: string =
    'Hier planst du dein aktuelles Semester. Klicke auf Hinzufügen, um Lehrveranstaltungen zu suchen und diese bequem deinem Stundenplan hinzuzufügen. In der selben Menüleiste findest du beim Klick auf <i class="bi bi-exclamation-triangle-fill"></i> Planungshinweise wie z.B. fehlende oder sich überschneidende Lehrveranstaltungen.';
  timetable: Timetable;
  initialView = 'timeGridWeek';
  academicDates$: Observable<AcademicDate[]>;
  searchOpened = false;
  hintsOpened = false;
  toggle: boolean | undefined = undefined;
  isSticky: boolean = false;
  hints: PlanningHints[] = [];
  collisionHints: PlanningHints[];

  constructor(
    private store: Store<State>,
    private rest: RestService,
    private lazyInject: LazyInjectService,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private transform: TransformationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private mService: ModService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.semesters$ = this.store.select(getSemesterList);
    this.activeSemester$ = this.store.select(getActiveSemester);
    this.planCourses$ = this.store.select(getPlanCourses);
    this.activeSemester$
      .pipe(takeUntil(this.destroy$))
      .subscribe((semester) => {
        this.activeSemester = semester;
        if (semester) {
          this.academicDates$ = this.rest
            .getAcademicDatesOfSemester(semester)
            .pipe(
              catchError((error) => {
                this.auth.forceReload(error);
                return of([]); // Return an empty array or handle the error as needed
              })
            );
        }
      });
    this.activePlan$ = this.store.select(getSemesterPlan);
    this.ectsSum$ = this.store.select(getEctsSumOfSemesterPlan);
    this.store
      .select(getPlanningHints)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hints) => {
        this.hints = hints;
        this.cdr.detectChanges();
      });

    this.activePlan$.pipe(takeUntil(this.destroy$)).subscribe((plan) => {
      if (plan) {
        this.activePlan = plan;
      }
    });
  }

  // for stickyness of bulk action bar when selecting courses
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (offset > 25) {
      // determines where the sticky effect starts
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSearch(query?: boolean) {
    if (this.searchOpened && !query) {
      // reset route
      this.router.navigate(['app', 'semester']);
    }

    if (query && this.searchOpened) {
      // do nothing otherwise search would be closed when query starts from semester plan
    } else {
      this.searchOpened = !this.searchOpened;
    }
    this.cdr.detectChanges();
  }

  toggleHints() {
    this.hintsOpened = !this.hintsOpened;
    this.cdr.detectChanges();
  }

  updateCollisionHints(hints: PlanningHints[]) {
    this.collisionHints = hints;
  }

  editSemester() {
    this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'edit-semester-dialog',
        dialogTitle: 'Semester wählen',
        semesters$: this.semesters$,
        selectedSemester$: this.activeSemester$,
      },
    });
  }

  openUnivis(plan: SemesterPlan) {
    this.timetable = new Timetable(plan.semester);
    for (const course of plan.courses) {
      this.timetable.addCourse(course.id);
    }
    window.open(this.timetable.getUnivisLink(), '_blank');
  }

  openTimetable(plan: SemesterPlan) {
    this.timetable = new Timetable(plan.semester);
    for (const course of plan.courses) {
      this.timetable.addCourse(course.id);
    }

    if (this.timetable.courses.length !== 0) {
      window.open(this.timetable.getTimetableLink(), '_blank');
    } else {
      this.snackbar.openSnackBar({
        type: AlertType.DANGER,
        message:
          'Du hast keine Lehrveranstaltungen ausgewählt, es kann daher kein PDF angezeigt werden.',
      });
    }
  }

  exportTimetable(plan: SemesterPlan) {
    // prepare data for export -> only select relevant attributes
    // TODO: if semester and study plan were merged, maybe add aditional attributes like modules and user generated modules
    const exportPlan = {
      semester: plan.semester,
      isPastSemester: plan.isPastSemester,
      courses: plan.courses.map((el) => {
        return { ...el, _id: undefined };
      }),
    };
    this.lazyInject.get<DownloadService>(() => 
      import('../../shared/services/download.service').then((m) => m.DownloadService)
    ).then(download => download.downloadJSONFile(exportPlan, 'stundenplan.json'));
  }

  importTimetable(oldplan: SemesterPlan) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Daten importieren:',
        dialogContentId: 'import-dialog',
        importType: 'deinen Stundenplan',
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // check if result contains values of semesterplanTemplate
        if (
          typeof result === 'object' &&
          Array.isArray(result.courses) &&
          typeof result.isPastSemester === 'boolean' &&
          typeof result.semester === 'string'
        ) {
          // check if semester is same and if not, do not import since courses might differ
          if (result.semester === oldplan.semester) {
            // take values of old plan and rewrite values with new ones if available
            this.store.dispatch(
              TimetableActions.importSemesterPlan({
                newSemesterPlan: { ...oldplan, ...result },
              })
            );
          } else {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: `Der Stundenplan konnte nicht importiert werden. Wechsel zunächst in das ${this.transform.transformUnivIsSemester(
                result.semester
              )}!`,
            });
          }
        } else {
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message:
              'Der Stundenplan konnte nicht importiert werden, die Datei hatte nicht die richtige Struktur!',
          });
        }
      }
      this.dialog.closeAll();
    });
  }

  openModuleDetails(acronym: string) {
    this.mService.selectModuleFromAcronymString(acronym);
  }

  openResolveDialog(hint: PlanningHints) {
    if (hint.courses) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Überschneidung auflösen',
          dialogContentId: 'resolve-collision',
          courses: hint.courses,
        },
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          if (Array.isArray(result) && this.activeSemester) {
            for (let id of result) {
              this.store.dispatch(
                CoursePlanningActions.deselectCourse({
                  semester: this.activeSemester,
                  courseId: id,
                })
              );
            }
          }
        });
    }
  }
}
