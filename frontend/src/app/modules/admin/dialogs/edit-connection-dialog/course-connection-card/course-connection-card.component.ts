import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Course } from '../../../../../../../../interfaces/course';
import { CourseService } from 'src/app/shared/services/course.service';

@Component({
  selector: 'admin-course-connection-card',
  templateUrl: './course-connection-card.component.html',
  styleUrl: './course-connection-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CourseConnectionCardComponent {
  private cService = inject(CourseService);

  @Input() course: Course;
  // whether the course is connected to the module course -> decided by the dialog, since courses
  // taken from a connection do not carry their mCourses
  @Input() connected: boolean;
  // blocked while the dialog writes a connection
  @Input() disabled = false;
  @Output() connect = new EventEmitter<Course>();
  @Output() disconnect = new EventEmitter<Course>();

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
