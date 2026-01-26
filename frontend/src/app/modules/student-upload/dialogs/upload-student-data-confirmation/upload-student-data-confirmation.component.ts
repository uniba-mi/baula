import { Component, EventEmitter, model, Output } from '@angular/core';

@Component({
  selector: 'app-upload-student-data-confirmation',
  standalone: false,
  templateUrl: './upload-student-data-confirmation.component.html',
  styleUrl: './upload-student-data-confirmation.component.scss'
})
export class UploadStudentDataConfirmationComponent {
  @Output() confirmFlexNowImport = new EventEmitter<{
    flexNowImportConfirmed: boolean,
    studypathConfirmed: boolean,
    gradesConfirmed: boolean,
  }>();

  readonly flexNowImportConfirmed = model(false);
  readonly StudypathConfirmed = model(false);
  readonly GradesConfirmed = model(false);

  emitChange() {
    this.confirmFlexNowImport.emit({
      flexNowImportConfirmed: this.flexNowImportConfirmed(),
      studypathConfirmed: this.StudypathConfirmed(),
      gradesConfirmed: this.GradesConfirmed()
    })
  }
}
