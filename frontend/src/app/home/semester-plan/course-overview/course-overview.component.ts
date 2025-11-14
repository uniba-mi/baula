import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { UntypedFormControl } from '@angular/forms';
import { Course } from '../../../../../../interfaces/course';
import {
  Option,
  SearchSettings,
} from '../../../../../../interfaces/search';
import { takeUntil } from 'rxjs/operators';
import { getModuleAcronyms } from 'src/app/selectors/module-overview.selectors';
import { ModuleCourse } from '../../../../../../interfaces/module-course';
import { PlanCourse, SemesterPlan } from '../../../../../../interfaces/semester-plan';
import { getLoadingState } from 'src/app/selectors/study-planning.selectors';
import {
  LoadingActions,
} from 'src/app/actions/study-planning.actions';
import { IndexedDbService } from 'src/app/shared/services/indexed-db.service';
import { SearchActions } from 'src/app/actions/search-settings.actions';

@Component({
  selector: 'app-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.scss'],
  standalone: false
})
export class CourseOverviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activePlan: SemesterPlan;
  @Input() selectedCourses?: PlanCourse[] | null;
  @Input() isSticky: boolean;
  @Output() openSearch = new EventEmitter();
  ngUnsubscribe = new Subject<void>();

  selectedFilters: Option[];
  courseSearchHint: string = 'courseSearch-hint';
  courseSearchHintMessage: string =
    'Hier findest du Lehrveranstaltungen, die du in deinen Stundenplan einplanen kannst. Lehrveranstaltungen gehören immer zu einem größeren thematischen Abschnitt, einem Modul. Damit du weißt, welche Lehrveranstaltung zu welchem Modul gehört, kannst du die Modulzugehörigkeit sehen. Du kannst auch direkt Lehrveranstaltungen zu einem Modul suchen, wenn du im <a class="link" href="/app/modulkatalog">Modulkatalog</a> ein Modul auswählst und dort auf den Button "Finde passende Lehrveranstaltungen" klickst.';
  searchSettings: SearchSettings;
  courses: Course[] = [];
  searchResult: Course[] | undefined = undefined;
  searchTerm: string = '';
  courseListEmpty: boolean = false;
  filters = new UntypedFormControl();
  spinner$: Observable<boolean>;
  acronyms: string[];
  types: string | undefined;

  constructor(
    private store: Store<State>,
    private indexedDB: IndexedDbService
  ) { }

  ngOnInit(): void {
    this.spinner$ = this.store.select(getLoadingState);
    this.store
      .select(getModuleAcronyms)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((acr) => {
        this.acronyms = acr;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if search settings setted, get courses after switching semester
    if (changes.activeSemester && changes.activeSemester.previousValue) {
      this.getCourses(this.searchSettings, true);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateList() {
    this.courseListEmpty = false;
    // set timeout so box is not displayed when observable is still empty
    setTimeout(() => {
      // make empty course list div visible if course list empty
      let courseList = document.querySelector('.course-list');
      if (courseList?.textContent?.trim() === '') {
        this.courseListEmpty = true;
      }
    }, 2000);
  }

  private getCoursesFromUnivis(
    semester: string,
    searchsettings?: SearchSettings,
    reload?: boolean
  ) {
    this.store.dispatch(LoadingActions.startLoading());
    this.indexedDB
      .searchCourses(semester, searchsettings, reload)
      .then((courses) => {
        if (courses) {
          this.courses = courses.map((course) => {
            return {
              ...course,
              mCourses: this.extractModulesFromCourse(course),
            };
          });
          if (searchsettings) {
            // check for only module courses
            if (
              searchsettings.advancedSearch?.filter?.onlyModuleCourses &&
              this.acronyms.length !== 0
            ) {
              this.courses = this.courses.filter(
                (course) =>
                  course.mCourses &&
                  course.mCourses.length !== 0 &&
                  this.extractModulesFromCourse(course)
              );
            }

            // check for only selected courses
            if (searchsettings.advancedSearch?.filter?.onlySelectedCourses) {
              if (this.selectedCourses) {
                this.courses = this.courses.filter((course) =>
                  this.selectedCourses?.find(
                    (planCourse) => planCourse.id == course.id
                  )
                );
              } else {
                this.courses = [];
              }
            }
          }

          this.store.dispatch(LoadingActions.stopLoading());
          // update list to check if list is empty
          this.updateList();
        }
      });
  }

  getCourses(searchSettings?: SearchSettings, semesterChange?: boolean) {
    if (semesterChange) {
      this.courses = [];
    }
    this.getCoursesFromUnivis(this.activePlan.semester, searchSettings);
    if (searchSettings) {
      this.searchSettings = searchSettings;
      this.store.dispatch(
        SearchActions.updateSearchSettings({
          context: 'course-search',
          searchSettings: this.searchSettings,
        })
      );
    }
  }

  extractModulesFromCourse(
    course: Course
  ): { modCourse: ModuleCourse }[] | undefined {
    let result: { modCourse: ModuleCourse }[] = [];
    if (course.mCourses && course.mCourses.length !== 0 && this.acronyms) {
      for (const mc of course.mCourses) {
        if (
          !result.includes(mc) &&
          this.acronyms.includes(mc.modCourse.identifier.acronym)
        ) {
          result.push(mc);
        }
      }
      if (result.length !== 0) {
        return result;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}
