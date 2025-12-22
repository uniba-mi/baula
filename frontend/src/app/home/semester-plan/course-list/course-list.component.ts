import {
  Component,
  Input,
  OnInit,
  OnChanges,
  EventEmitter,
  Output,
  ViewChild,
  HostListener,
  ElementRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { SearchSettings } from '../../../../../../interfaces/search';
import { Course } from '../../../../../../interfaces/course';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PlanCourse } from '../../../../../../interfaces/semester-plan';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';
import { Semester } from '../../../../../../interfaces/semester';
import { getPlanCourses } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-course-list',
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
    standalone: false
})
export class CourseListComponent implements OnInit, OnChanges {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('bulkActionsBar') bulkActionsBar: ElementRef;
  @Input() courses: Course[];
  @Input() searchSettings: SearchSettings;
  @Input() isSticky: boolean;
  @Output() notify = new EventEmitter();
  selectedItems: Course[] = [];
  allSelected: boolean = false;
  searchResult: Course[];
  viewResult: Course[];
  pageSize = 25;
  courses$: Observable<Course[]>;
  fulltextSearchEnabled: boolean = false;
  isSidenavFullScreen: boolean = false;
  screenIsXXL = false;
  activePlanCourses$: Observable<PlanCourse[]>;

  constructor(private fuseSearch: FuseSearchService, private store: Store, private screenSizeService: ScreenSizeService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setStickyBarWidth();
  }

  ngOnInit(): void {
    this.activePlanCourses$ = this.store.select(getPlanCourses);
    this.searchResult = this.searchCourses(
      this.courses,
      this.searchSettings?.term,
      this.searchSettings?.searchIn
    );
    this.viewResult = this.searchResult.slice(0, this.pageSize)
    //this.notify.emit();

    // observe sidenav width for css adjustments
    this.screenSizeService.isSidenavFullScreen$.pipe(take(1)).subscribe(isFullScreen => {
      this.isSidenavFullScreen = isFullScreen;
    });

    // observe screensize for css adjustments
    this.screenSizeService.isXXLScreen$.pipe(take(1)).subscribe(isXXL => {
      this.screenIsXXL = isXXL;
    });
  }

  ngAfterViewChecked(): void {
    this.setStickyBarWidth();
  }

  setStickyBarWidth() {
    const parentElement = document.querySelector('.course-list-container');
    const stickyBar = document.querySelector('.bulk-actions-bar');
    if (parentElement && stickyBar) {
      const parentWidth = parentElement.clientWidth;
      stickyBar.setAttribute('style', `width: ${parentWidth}px`);
    }
  }


  ngOnChanges(): void {
    if (this.courses && this.searchSettings) {
      this.searchResult = this.searchCourses(
        this.courses,
        this.searchSettings.term,
        this.searchSettings.searchIn
      );
      // reset view after search is executed
      this.viewResult = this.searchResult.slice(0, this.pageSize);
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
    }

    // only emit notify, when courses is not empty (courses contains queried Courses from database)
    if (this.courses.length !== 0) {
      this.notify.emit();
    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.viewResult];
    }
    this.allSelected = !this.allSelected;
  }

  onCourseSelected(course: Course) {
    if (!this.selectedItems.includes(course)) {
      this.selectedItems.push(course);
    }
  }

  onCourseDeselected(course: Course) {
    this.selectedItems = this.selectedItems.filter(c => c.id !== course.id);
  }

  // Method to select all visible courses
  selectAll() {
    this.selectedItems = [...this.viewResult]; // Select all currently visible courses
  }

  // adding several courses at once (bulk action)
  planSelectedCourses() {
    const plannedCourses: PlanCourse[] = [];
    const semester = this.selectedItems[0] ? this.selectedItems[0].semester : new Semester().name;

    this.selectedItems.forEach(univisCourse => {

      let plannedCourse: PlanCourse;

      // need to do this for the conversion from Course to PlanCourse
      if (univisCourse.mCourses && univisCourse.mCourses.length !== 0) {
        // hard fix: set contributeTo to the last modCourse, make selectable in the future
        const mcId = univisCourse.mCourses[univisCourse.mCourses.length-1].modCourse.mcId;
        const acronym = univisCourse.mCourses[univisCourse.mCourses.length-1].modCourse.identifier.acronym;
        const ects = univisCourse.mCourses[univisCourse.mCourses.length-1].modCourse.ects;
        const sws = univisCourse.mCourses[univisCourse.mCourses.length-1].modCourse.sws;

        plannedCourse = {
          id: univisCourse.id,
          name: univisCourse.name,
          contributeAs: mcId,
          contributeTo: acronym,
          status: 'open',
          sws: sws,
          ects: ects
        };
      } else {
        plannedCourse = {
          id: univisCourse.id,
          name: univisCourse.name,
          contributeAs: '',
          contributeTo: '',
          status: 'open',
          sws: univisCourse.sws,
          ects: univisCourse.ects
        };
      }

      plannedCourses.push(plannedCourse);

      this.allSelected = false;
    });

    this.store.dispatch(CoursePlanningActions.selectCourses({ courses: plannedCourses, isPastSemester: false, semester }));
    this.clearSelections();
  }

  // removing several courses at once (bulk action)
  unplanSelectedCourses() {
    const courseIds = this.selectedItems.map(course => course.id);
    const semester = this.selectedItems[0] ? this.selectedItems[0].semester : new Semester().name;

    if (courseIds.length > 0) {
      this.store.dispatch(CoursePlanningActions.deselectCourses({ courseIds, semester }));
    }
    this.clearSelections();
    this.allSelected = false;
  }

  clearSelections() {
    this.selectedItems = [];
  }

  handlePageEvent(event: PageEvent) {
    const start = event.pageIndex * event.pageSize;
    const end = start + event.pageSize;
    this.viewResult = this.searchResult.slice(start, end)
  }

  private searchCourses(
    courses: Course[],
    term: string,
    searchIn: string[]
  ): Course[] {
    if (term) {
      return this.fuseSearch.search(courses, term, searchIn);
    } else {
      return courses;
    }
  }
}
