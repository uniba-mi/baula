import { Component, Input } from '@angular/core';
import { Course } from '../../../../../interfaces/course';

@Component({
    selector: 'app-resolve-collision-dialog',
    templateUrl: './resolve-collision-dialog.component.html',
    styleUrl: './resolve-collision-dialog.component.scss',
    standalone: false
})
export class ResolveCollisionDialogComponent {
  @Input() courses: Course[];
  expandedCourseDetails: boolean = false;
  coursesToDelete: string[] = [];

  setCourseToDelete(id: string) {
    // check if course is in array
    let index = this.coursesToDelete.findIndex(el => el === id)
    if (index >= 0) {
      this.coursesToDelete.splice(index, 1);
    } else {
      this.coursesToDelete.push(id);
    }
  }
}
