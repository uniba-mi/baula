import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Course } from '@interfaces/course';
import { ModuleCourse } from '@interfaces/module-course';

@Component({
    selector: 'app-course-details-dialog',
    templateUrl: './course-details-dialog.component.html',
    styleUrls: ['./course-details-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CourseDetailsDialogComponent {
  @Input() course: Course;
  @Input() deselectOption: boolean; // variable to check if course is selected to show deselect button
}
