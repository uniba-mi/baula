import { Component, Inject } from '@angular/core';
import { AcademicDate, DateType } from '../../../../../../interfaces/academic-date';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ModuleCourse } from '../../../../../../interfaces/module-course';
import { ModuleCourse2CourseConnection } from '../../../../../../interfaces/connection';
import { Course } from '../../../../../../interfaces/course';

export interface AdminDialogData {
  dialogTitle?: String;
  dialogContentId: String;
  academicDate?: AcademicDate;
  dateType?: DateType;
  univisCrawl$?: Observable<string[]>;
  mCourse?: ModuleCourse;
  semester?: string;
  chair?: string;
  connection?: ModuleCourse2CourseConnection[];
  courses?: Course[];
}

@Component({
    selector: 'admin-dialog',
    templateUrl: './admin-dialog.component.html',
    styleUrl: './admin-dialog.component.scss',
    standalone: false
})
export class AdminDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AdminDialogData
  ) { }
}
