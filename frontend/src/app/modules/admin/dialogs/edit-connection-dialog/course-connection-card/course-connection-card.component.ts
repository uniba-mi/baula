import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ModuleCourse } from '../../../../../../../../interfaces/module-course';
import { Course } from '../../../../../../../../interfaces/course';
import { CourseService } from 'src/app/shared/services/course.service';

@Component({
  selector: 'admin-course-connection-card',
  templateUrl: './course-connection-card.component.html',
  styleUrl: './course-connection-card.component.scss',
  standalone: false,
})
export class CourseConnectionCardComponent {
  private cService = inject(CourseService);

  @Input() course: Course;
  @Input() mCourse: ModuleCourse;
  @Output() connect = new EventEmitter<Course>();
  @Output() disconnect = new EventEmitter<Course>();

  checkCourse(course: Course): boolean {
    let courseConnected = course.mCourses?.find(
      (el) => el.modCourse.mcId === this.mCourse.mcId,
    );
    return courseConnected ? false : true;
  }

  connectModule() {
    this.connect.emit(this.course);
  }

  disconnectModule() {
    this.disconnect.emit(this.course);
  }

  openCourse() {
    this.cService.openCourseDetails(this.course, false);
  }
}
