import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Module } from '@interfaces/module';
import { ModuleCourse2CourseConnection } from '@interfaces/connection';
import { ModuleCourse } from '@interfaces/module-course';
import { MatDialog } from '@angular/material/dialog';
import {
  AdminDialogComponent,
  AdminDialogData,
} from '../../dialogs/admin-dialog.component';
import { Course } from '@interfaces/course';
import { ModuleConnectionContainer } from '../module-course-connection.component';
import { ModService } from 'src/app/shared/services/module.service';
import { CourseService } from 'src/app/shared/services/course.service';
import { RestService } from 'src/app/rest.service';
import { take } from 'rxjs';

@Component({
  selector: 'admin-connection-card',
  templateUrl: './connection-card.component.html',
  styleUrl: './connection-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ConnectionCardComponent {
  private dialog = inject(MatDialog);
  private modService = inject(ModService);
  private cService = inject(CourseService);
  private rest = inject(RestService);

  // contains module with their connection -> connection is the moduleCourse with the connected courses
  @Input() containers: ModuleConnectionContainer[];
  @Input() semester: string;
  @Input() courses: Course[];
  @Output() update = new EventEmitter<void>();

  // return no or yes depending if connection exist
  checkStatus(
    connection: ModuleCourse2CourseConnection[],
    id: string,
  ): boolean {
    if (connection.length == 0) {
      return false;
    } else {
      const existingConnection = connection.find((el) => el.mcId == id);
      if (existingConnection) {
        return true;
      } else {
        return false;
      }
    }
  }

  // opens the edit dialog
  openEditDialog(
    mCourse: ModuleCourse,
    module: Module,
    connection: ModuleCourse2CourseConnection[],
  ) {
    // the dialog gets this exact object and sets hasChanges on it when it writes something
    const data: AdminDialogData = {
      dialogTitle: 'Verknüpfung von Modul zu Lehrveranstaltung bearbeiten',
      dialogContentId: 'edit-connection-dialog',
      mCourse,
      semester: this.semester,
      chair: module.chair,
      moduleName: module.name,
      moduleAcronym: module.acronym,
      connection: connection.filter((el) => el.mcId == mCourse.mcId), //pass only connections of the selected modulCourse
      courses: this.courses,
    };
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data,
      minWidth: '80vw',
    });

    dialogRef.afterClosed().subscribe(() => {
      // only reload the board if the dialog actually changed a connection
      if (data.hasChanges) {
        this.update.emit();
      }
    });
  }

  // function to open details of the clicked module
  openModule(module: Module) {
    // modules of the 'all modules' scope come straight from the database and miss the derived
    // fields the details dialog needs -> load the complete module before opening it
    if (module.extractedPrevModules) {
      this.modService.openDetailsDialog(module);
      return;
    }
    this.rest
      .getModuleByAcronymAndVersion(module.acronym, module.version)
      .pipe(take(1))
      .subscribe((completeModule) =>
        this.modService.openDetailsDialog(completeModule),
      );
  }

  // function to open details of the clicked course
  openCourse(course: Course) {
    this.cService.openCourseDetails(course, false);
  }
}
