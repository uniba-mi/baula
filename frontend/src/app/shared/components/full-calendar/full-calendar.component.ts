import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import deLocale from '@fullcalendar/core/locales/de';
import listPlugin from '@fullcalendar/list';
import { Course } from '../../../../../../interfaces/course';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  forkJoin,
  map,
  of,
  skipWhile,
  take,
  takeUntil,
} from 'rxjs';
import { RestService } from 'src/app/rest.service';
import rrulePlugin from '@fullcalendar/rrule';
import { AcademicDate } from '../../../../../../interfaces/academic-date';
import { MatDialog } from '@angular/material/dialog';
import {
  DeletedCourse,
  PlanCourse,
  PlanningHints,
  SemesterPlan,
} from '../../../../../../interfaces/semester-plan';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { FullCalendarComponent as FullCalendar } from '@fullcalendar/angular';
import { TimetableActions } from 'src/app/actions/user.actions';
import { getTimetableSettings } from 'src/app/selectors/user.selectors';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';
import { CourseService } from '../../services/course.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TransformationService } from '../../services/transformation.service';
import { PlanningValidationService } from '../../services/planning-validation.service';
import { getPlanningHints } from 'src/app/selectors/study-planning.selectors';
import { AlertType } from '../../classes/alert';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-full-calendar',
  templateUrl: './full-calendar.component.html',
  styleUrl: './full-calendar.component.scss',
  standalone: false
})
export class FullCalendarComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('calendar') fullCalendar: FullCalendar;
  @Input() initalView: string;
  @Input() isWidget: boolean;
  @Input() activePlan: SemesterPlan;
  @Input() academicDates: AcademicDate[];
  @Input() planCourses?: PlanCourse[] | null;
  @Input() toggle: boolean | undefined;
  @Output() import = new EventEmitter();
  @Output() export = new EventEmitter();
  @Output() openPDF = new EventEmitter();
  @Output() openSearch = new EventEmitter();
  @Output() openHints = new EventEmitter();
  @Output() openUnivis = new EventEmitter();

  private destroy$ = new Subject<void>();
  courses$: Observable<Course[]>;
  deletedCourses: DeletedCourse[] = [];
  calendarOptions: CalendarOptions;
  events: EventInput[];
  courseSubscription: Subscription;
  currentDate: string;
  teachingPeriod: AcademicDate;
  currentHints: PlanningHints[] = [];
  hintsIconColor: string = 'standard';
  planingHints$: Observable<PlanningHints[]>;
  initialLoad: boolean = true;

  constructor(
    private store: Store<State>,
    public dialog: MatDialog,
    private rest: RestService,
    private cdr: ChangeDetectorRef,
    private cService: CourseService,
    private validation: PlanningValidationService,
    private transform: TransformationService,
    private snackbar: SnackbarService,
    private analytics: AnalyticsService
  ) { }

  ngOnInit(): void {
    this.calendarOptions = {
      themeSystem: 'bootstrap5',
      initialView: this.initalView,
      headerToolbar: false,
      plugins: [dayGridPlugin, timeGridPlugin, rrulePlugin, listPlugin],
      firstDay: 1,
      weekends: true, // default
      dayHeaderFormat: {
        weekday: 'short',
      },
      locale: deLocale,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Thursday
        startTime: '08:00', // a start time (10am in this example)
        endTime: '22:00', // an end time (6pm in this example)
      },
      dayHeaderClassNames: ['fs-5', 'fw-light'],
      nowIndicator: true,
      scrollTime: '08:00:00', // scroll to 8am initially
      eventClick: (info) => {
        if (info.event.extendedProps.course) {
          this.cService.openCourseDetails(
            info.event.extendedProps.course,
            true
          );
        }
      },
    };

    // determine semester period
    const teachingPeriod = this.academicDates.find((date) =>
      date.dateType.name.includes('Vorlesungszeit')
    );
    if (teachingPeriod) {
      this.teachingPeriod = teachingPeriod;
    }

    // load user's timetable settings from the store and apply them
    this.store
      .select(getTimetableSettings)
      .pipe(take(1))
      .subscribe((timetableSettings) => {
        const showWeekendsSetting = timetableSettings.find((setting) =>
          setting.hasOwnProperty('showWeekends')
        );

        if (showWeekendsSetting) {
          this.calendarOptions.weekends = showWeekendsSetting.showWeekends;
        }
      });

    this.store
      .select(getPlanningHints)
      .pipe(
        skipWhile((hints) => {
          return hints.length === 0 && !this.events;
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((hints) => {
        if (this.events) {
          if (hints.length !== 0) {
            this.hintsIconColor = hints.find(
              (el) => el.type === 'collision' || el.type === 'danger'
            )
              ? 'danger'
              : 'warning';
          } else {
            this.hintsIconColor = 'standard';
          }

          if (this.currentHints.length < hints.length && !this.initialLoad) {
            // part opens snackbar if added course is leading to a collision
            const newHint = this.getNewHint(hints);

            // only show snackbar for collisions
            if (newHint && newHint.type === 'collision') {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: newHint.begin + newHint.end,
              });
            }
          }

          this.currentHints = hints.map((hint) => {
            for (let event of this.events) {
              const course = event.extendedProps?.course;
              const ids = hint.courses?.map((el) => el.id);

              if (course && ids && ids.includes(course.id)) {
                // mark collisions in calendar
                event.borderColor = 'red';
              }
            }
            return hint;
          });

          this.events = [...this.events]; // reassign events to trigger change detection

          this.initialLoad = false;
        }
      });

    this.updateEvents();
  }

  ngAfterViewInit(): void {
    this.updateEvents();
    if (this.fullCalendar) {
      // set date to display
      this.updateDate();
    }

    if (this.activePlan.semester && !this.isWithinTeachingPeriod()) {
      this.jumpToNewSemester();
    }

    /** scroll tracking **/
    setTimeout(() => {
      const scrollContainer = document.querySelector('.fc-timegrid-body');

      if (!scrollContainer) {
        return;
      }

      let lastScrollDirection = "none";

      scrollContainer.addEventListener('wheel', (event) => {
        const wheelEvent = event as WheelEvent;

        const el = event.currentTarget as HTMLElement;

        // Determine scroll direction
        const scrollDirection = wheelEvent.deltaY > 0 ? "down" : "up";
        if (scrollDirection !== lastScrollDirection) {
          lastScrollDirection = scrollDirection;
        }

        this.analytics.trackEvent('ScrollView', { direction: scrollDirection });

      });
    }, 2000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.planCourses) {
      this.updateEvents();
    }
    if (changes.toggle && this.toggle !== undefined) {
      // hack to make resize of fullcalendar -> https://github.com/fullcalendar/fullcalendar-react/issues/46
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 150);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getNewHint(hints: PlanningHints[]): PlanningHints | undefined {
    // A comparer used to determine if two entries are equal by checking end string
    const isSameHint = (a: PlanningHints, b: PlanningHints) => a.end === b.end;

    // Get items that only occur in the left array,
    // using the compareFunction to determine equality.
    const hint = hints.filter(
      (hint) => !this.currentHints.some((cHint) => isSameHint(hint, cHint))
    );
    return hint[0] ? hint[0] : undefined;
  }

  isWithinTeachingPeriod(): boolean {
    const today = new Date();

    if (this.teachingPeriod) {
      const startDate = new Date(this.teachingPeriod.startdate);
      const endDate = new Date(this.teachingPeriod.enddate);

      return today >= startDate && today <= endDate;
    }

    return false;
  }

  jumpToNewSemester(): void {
    if (!this.fullCalendar) {
      return;
    }

    if (this.teachingPeriod) {
      // set calendar view to start of teaching period
      this.fullCalendar.getApi().gotoDate(this.teachingPeriod.startdate);
      this.updateDate();
    } else {
      return;
    }
  }

  /** Functions for customHeaderToolbar */
  private updateDate() {
    this.currentDate = this.fullCalendar.getApi().view.title;
    this.cdr.detectChanges();
  }

  today() {
    this.fullCalendar.getApi().today();
    this.updateDate();
  }

  next() {
    this.fullCalendar.getApi().next();
    this.updateDate();
  }

  prev() {
    this.fullCalendar.getApi().prev();
    this.updateDate();
  }

  changeView(view: string) {
    this.fullCalendar.getApi().changeView(view);
    this.updateDate();
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends;

    // update the timetable settings in the db
    this.store.dispatch(
      TimetableActions.updateTimetableSettings({
        showWeekends: this.calendarOptions.weekends,
      })
    );
  }

  /*------------------------------------*/

  updateEvents() {
    if (this.planCourses && this.planCourses.length !== 0 && this.activePlan) {
      this.courses$ = forkJoin(
        this.planCourses.map((course) =>
          this.rest.getCourseDetails(course.id, this.activePlan.semester).pipe(
            catchError((error) => {
              console.warn(
                `Course with ID ${course.id} could not be loaded`,
                error
              );
              if (!this.deletedCourses.find((el) => el.id == course.id)) {
                this.deletedCourses.push({
                  ...course,
                  isDeleted: true,
                });
              }
              // Return `null` to handle the error and allow filtering later
              return of(null);
            })
          )
        )
      ).pipe(
        map((courses): Course[] => {
          // Type guard to filter out null values and let TypeScript know
          return courses.filter((course): course is Course => course !== null);
        })
      );
    } else {
      this.courses$ = of([]);
    }

    //check if subscription is open
    if (this.courseSubscription) {
      this.courseSubscription.unsubscribe();
    }

    // set new subscription
    this.courseSubscription = this.courses$.subscribe((courses) => {
      this.events = [
        ...this.transform.transformCourses(courses, this.academicDates),
      ];
      // only check collisions if teaching period is set and fullcalender is not a widget -> to prevent load in dashboard
      if (this.teachingPeriod && !this.isWidget && this.planCourses) {
        this.validation.checkForPlanningHints(
          this.planCourses,
          this.activePlan.modules,
          this.events,
          this.teachingPeriod
        );
      }
    });
  }

  deselectDeletedCourse(course: DeletedCourse) {
    // remove course from deletedCourses-Array
    const indexToDelete = this.deletedCourses.findIndex(
      (el) => el.id == course.id
    );
    if (indexToDelete >= 0) {
      this.deletedCourses.splice(indexToDelete, 1);
    }
    this.store.dispatch(
      CoursePlanningActions.deselectCourse({
        semester: this.activePlan.semester,
        courseId: course.id,
      })
    );
  }
}
