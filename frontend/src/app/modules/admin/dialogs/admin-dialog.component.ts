import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  AcademicDate,
  DateType,
} from '../../../../../../interfaces/academic-date';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ModuleCourse } from '../../../../../../interfaces/module-course';
import { ModuleCourse2CourseConnection } from '../../../../../../interfaces/connection';
import { Course } from '../../../../../../interfaces/course';
import { ImportLogMessage } from '../../../../../../interfaces/logs';

export interface AdminDialogData {
  dialogTitle?: String;
  dialogContentId: String;
  academicDate?: AcademicDate;
  dateType?: DateType;
  univisCrawl$?: Observable<ImportLogMessage>;
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AdminDialogComponent {
  dialogRef = inject<MatDialogRef<AdminDialogComponent>>(MatDialogRef);
  data = inject<AdminDialogData>(MAT_DIALOG_DATA);
}
