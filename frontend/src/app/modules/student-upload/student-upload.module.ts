import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentUploadComponent } from './student-upload/student-upload.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StudentUploadComponent],
  imports: [CommonModule, MatTooltipModule],
  exports: [StudentUploadComponent],
})
export class StudentUploadModule {}