import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadSelectedCourses } from 'src/app/modules/bilapp/state/actions/course.actions';
import { deleteHoverBars, setHoverBars, setHoverSelectBars } from 'src/app/modules/compvis/state/chart.actions';
import { State } from 'src/app/reducers';
import { PlanCourse } from '../../../../../../../../../../interfaces/semester-plan';
import { Course } from '../../../../../../../../../../interfaces/course';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';
import { CourseService } from 'src/app/shared/services/course.service';

@Component({
    selector: 'app-course-item',
    templateUrl: './course-item.component.html',
    styleUrls: ['./course-item.component.scss'],
    standalone: false
})
export class CourseItemComponent implements OnInit {
  @Input() course: Course;
  @Input() selectedCourses: PlanCourse[]; 
  @Input() moduleId: string;
  collapsed = false;

  
  constructor(private store: Store<State>, private cService: CourseService) { }

  ngOnInit(): void { 
    this.collapsed = this.selectedCourses.find(el => el.id == this.course.id) ? true : false;
  }

  selectCourse(course: Course, mcId: string) {
    // check if course is selected
    // TODO: Here maybe an error occurs when different courses has same ids, since semester is missing
    const selectedCourse = this.selectedCourses.find(el => el.id == course.id)

    // find fitting mCourse
    const mCourse = course.mCourses?.find(el => el.modCourse.mcId == mcId);
    let acronym = undefined;
    let ects = undefined;
    let sws = undefined;
    if(mCourse) {
      acronym = mCourse.modCourse.identifier.acronym;
      ects = mCourse.modCourse.ects;
      sws = mCourse.modCourse.sws;
    }
    // if course ID is not part of the selectedCourseIDs add it
    // check if this course is already selected
    if ( selectedCourse && selectedCourse.contributeAs == mcId) {
      this.store.dispatch(CoursePlanningActions.deselectCourse( { semester: course.semester, courseId: course.id } ));
    } /* else if (this.selectedCourses.find(el => el.id == course.id && el.contributeAs != mcId )) {
      this.store.dispatch(deselectCourse( { course } ));
      this.store.dispatch(selectCourse({ course, contributeAs: mcId, contributeTo: acronym, ects, sws }));
    } */ else {
      this.store.dispatch(CoursePlanningActions.selectCourse({ course, contributeAs: mcId, contributeTo: acronym, ects, sws, isPastSemester: false }));
    }

    // Deselect Hover if course is selected
    this.store.dispatch(deleteHoverBars());
    // reload saved courses
    this.store.dispatch(loadSelectedCourses());

    //Disable Selection of other Courses with same ID
    const inputs = document.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if(input.name == course.id && input.alt !== this.moduleId) {
          input.checked = false;
          input.disabled = !input.disabled;
        }
    }
  }

  checkSelectedCourses(currentCourse: Course, mcId: string): boolean {
    const course = this.selectedCourses.find(el => el.id == currentCourse.id && el.contributeAs == mcId)
    if(course) {
      return true;
    }
    return false;
  }

  checkIfDisabled(course: Course, mcId: string): boolean {
    const selectedCourse = this.selectedCourses.find(el => el.id == course.id)
    if(selectedCourse && selectedCourse.contributeAs == mcId) {
      return false;
    } else if (selectedCourse && selectedCourse.contributeAs !== mcId) {
      return true;
    } else {
      return false;
    }
  }


  async hoverSelectCourse(course: Course, mcId: string) {
    if(window.matchMedia('(hover: hover)').matches) {
      if (!this.checkSelectedCourses(course, mcId)) {
        this.store.dispatch(setHoverBars({ course, contributesTo: mcId }));
      } else {
        this.store.dispatch(setHoverSelectBars({ course, contributesTo: mcId }));
      }
    }
  }

  async hoverDeselectCourse() {
    if(window.matchMedia('(hover: hover)').matches) {
      this.store.dispatch(deleteHoverBars());
    }
    //this.store.dispatch(hoverDeselectCourse());
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  openDialog(event: Event, course: Course) {
    event.stopPropagation()
    this.cService.openCourseDetails(course, false)
  }

}
