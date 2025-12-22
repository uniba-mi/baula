import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Module } from '../../../../../../../interfaces/module';
import { ModuleCourse2CourseConnection } from '../../../../../../../interfaces/connection';
import { ModuleCourse } from '../../../../../../../interfaces/module-course';
import { MatDialog } from '@angular/material/dialog';
import { AdminDialogComponent } from '../../dialogs/admin-dialog.component';
import { Course } from '../../../../../../../interfaces/course';
import { ModService } from 'src/app/shared/services/module.service';
import { CourseService } from 'src/app/shared/services/course.service';

@Component({
    selector: 'admin-connection-card',
    templateUrl: './connection-card.component.html',
    styleUrl: './connection-card.component.scss',
    standalone: false
})
export class ConnectionCardComponent {
  @Input() containers: { module: Module, connection: ModuleCourse2CourseConnection[] }[]; // contains module with their connection -> connection is the moduleCourse with the connected courses
  @Input() semester: string;
  @Input() courses: Course[];
  @Output() update = new EventEmitter<void>(); // fires when dialog is closed to enable reload of connections

  constructor(private dialog: MatDialog, private modService: ModService, private cService: CourseService) {}

  // return no or yes depending if connection exist
  checkStatus(connection: ModuleCourse2CourseConnection[], id: string): boolean {
    if(connection.length == 0) {
      return false
    } else {
      const existingConnection = connection.find(el => el.mcId == id);
      if(existingConnection) {
        return true
      } else {
        return false
      }
    }
  }

  // opens the edit dialog
  openEditDialog(mCourse: ModuleCourse, chair: string, connection: ModuleCourse2CourseConnection[]) {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Verknüfpung von Modul zu Lehrveranstaltung bearbeiten',
        dialogContentId: 'edit-connection-dialog',
        mCourse,
        semester: this.semester,
        chair,
        connection: connection.filter(el => el.mcId == mCourse.mcId), //pass only connections of the selected modulCourse
        courses: this.courses
      },
      minWidth: '80vw'
    });

    dialogRef.afterClosed().subscribe(() => {
      // fire update event to enable reload in the parent component
      this.update.emit();
    })
  }

  // function to open details of the clicked module
  openModule(module: Module) {
    this.modService.openDetailsDialog(module)
  }

  // function to open details of the clicked course
  openCourse(course: Course) {
    this.cService.openCourseDetails(course, false);
  }
}
