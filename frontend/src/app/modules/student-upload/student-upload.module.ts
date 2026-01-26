import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentUploadComponent } from './student-upload/student-upload.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadStudentDataConfirmationComponent } from './dialogs/upload-student-data-confirmation/upload-student-data-confirmation.component';

@NgModule({
  declarations: [StudentUploadComponent, UploadStudentDataConfirmationComponent],
  imports: [CommonModule, MatTooltipModule],
  exports: [StudentUploadComponent, UploadStudentDataConfirmationComponent],
})
export class StudentUploadModule {}