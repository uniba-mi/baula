import { Injectable } from '@angular/core';
import { Course } from '../../../../../interfaces/course';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    public dialog: MatDialog,
    private store: Store<State>,
  ) { }

  // open details for given course, if selected true, than deselect button is displayed otherwise hidden
  openCourseDetails(course: Course, selected: boolean) {
    const dialog = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: `[${course.type}] ${course.name}`,
        course,
        deselectOption: selected,
        dialogContentId: 'course-details-dialog',
      },
    });

    dialog.afterClosed().subscribe((course: Course) => {
      if (course && selected) {
        this.store.dispatch(
          CoursePlanningActions.deselectCourse({ semester: course.semester, courseId: course.id })
        );
      }
    });
  }
}
