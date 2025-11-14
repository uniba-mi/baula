import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { Observable, Subscription } from 'rxjs';
import { Course } from '../../../../../../interfaces/course';
import { PlanCourse } from '../../../../../../interfaces/semester-plan';
import { ModService } from 'src/app/shared/services/module.service';
import { getModuleAcronyms } from 'src/app/selectors/module-overview.selectors';
import { getPlanCourses, getSelectedCourseIds } from 'src/app/selectors/study-planning.selectors';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';

@Component({
    selector: 'app-course-item',
    templateUrl: './course-item.component.html',
    styleUrls: ['./course-item.component.scss'],
    standalone: false
})
export class CourseItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() course: Course;
  @Input() isSelected: boolean; // Declare as Input property
  @Input() planCourses: PlanCourse[] | null | undefined;
  @Output() selectionChange = new EventEmitter<Course>(); // Emit selected course
  @Output() deselectionChange = new EventEmitter<Course>(); // Emit deselected course
  hover: boolean = false;
  isSelectable: boolean = true;
  modules: string[] | undefined;
  selectedCourseIds: string[];
  expandedCourseDescription: boolean = false;
  expandedCourseOrganisation: boolean = false;
  acronyms: string[];
  acronymSub: Subscription;

  constructor(private store: Store<State>, private modService: ModService, private validation: PlanningValidationService) { }

  ngOnInit(): void {
    this.acronymSub = this.store.select(getModuleAcronyms).subscribe(acr => {
      this.acronyms = acr;
      this.modules = [...new Set(this.extractModulesFromCourse(this.course))];
    })
    this.course.expandedContent = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes.planCourses && this.planCourses) {
        this.isSelectable = this.validation.isCoursePlannable(this.course, this.planCourses)
        this.selectedCourseIds = this.planCourses.map(el => el.id)
      }
  }

  ngOnDestroy(): void {
    this.acronymSub.unsubscribe();
  }

  selectCourse() {
    if (this.course.mCourses && this.course.mCourses.length !== 0) {
      // TODO: hard fix set contributeTo to last modCourse, make selectable in future
      const mcId = this.course.mCourses[this.course.mCourses.length-1].modCourse.mcId;
      const acronym = this.course.mCourses[this.course.mCourses.length-1].modCourse.identifier.acronym;
      const ects = this.course.mCourses[this.course.mCourses.length-1].modCourse.ects;
      const sws = this.course.mCourses[this.course.mCourses.length-1].modCourse.sws;
      this.store.dispatch(CoursePlanningActions.selectCourse({ course: this.course, contributeAs: mcId, contributeTo: acronym, ects, sws, isPastSemester: false }));
    } else {
      this.store.dispatch(CoursePlanningActions.selectCourse({ course: this.course, isPastSemester: false }));
    }
  }

  deselectCourse() {
    this.store.dispatch(CoursePlanningActions.deselectCourse({ semester: this.course.semester, courseId: this.course.id }));
  }

  // (de)select course emitted to parent
  toggleSelection(course: Course) {
    if (this.isSelected) {
      this.deselectionChange.emit(course);
    } else {
      this.selectionChange.emit(course);
    }
  }

  writeEMail(email: string) {
    window.open('mailto:' + email, '_self');
  }

  toggleCourseOrganisation(course: Course, mode: string) {
    const element = document.getElementById(`${course.id}-organisation`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedCourseOrganisation = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedCourseOrganisation = false;
      }
    }
  }

  toggleCourseDescription(course: Course, mode: string) {
    const element = document.getElementById(`${course.id}-description`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedCourseDescription = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedCourseDescription = false;
      }
    }
  }

  openModule(acronym: string) {
    this.modService.selectModuleFromAcronymString(acronym)
  }

  private extractModulesFromCourse(course: Course): string[] | undefined {
    let result: string[] = [];
    if (this.acronymSub) {
      this.acronymSub.unsubscribe()
    }
    if (course.mCourses && course.mCourses.length !== 0 && this.acronyms) {
      for (const mc of course.mCourses) {
        if (!result.includes(mc.modCourse.identifier.acronym) && this.acronyms.includes(mc.modCourse.identifier.acronym)) {
          result.push(mc.modCourse.identifier.acronym)
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
