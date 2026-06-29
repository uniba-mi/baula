import { Component, EventEmitter, Input, model, Output } from '@angular/core';

@Component({
  selector: 'app-upload-student-data-confirmation',
  standalone: false,
  templateUrl: './upload-student-data-confirmation.component.html',
  styleUrl: './upload-student-data-confirmation.component.scss'
})
export class UploadStudentDataConfirmationComponent {
  @Input() onlyStudypath: boolean;
  @Input() onlyMetaData: boolean;
  @Output() confirmFlexNowImport = new EventEmitter<{
    flexNowImportConfirmed: boolean,
    metadataConfirmed: boolean,
    studypathConfirmed: boolean,
    gradesConfirmed: boolean,
  }>();

  readonly FlexNowImportConfirmed = model(false);
  readonly StudypathConfirmed = model(false);
  readonly GradesConfirmed = model(false);

  confirmGrade() {
    if(!this.StudypathConfirmed()) {
      this.StudypathConfirmed.set(this.GradesConfirmed())
    }
    this.emitChange()
  }

  confirmPath() {
    if(this.GradesConfirmed() && !this.StudypathConfirmed()) {
      this.GradesConfirmed.set(false)
    }
    this.emitChange()
  }

  emitChange() {
    this.confirmFlexNowImport.emit({
      flexNowImportConfirmed: this.onlyStudypath && !this.StudypathConfirmed() ? false : this.FlexNowImportConfirmed(),
      metadataConfirmed: this.onlyStudypath ? false : true,
      studypathConfirmed: this.StudypathConfirmed(),
      gradesConfirmed: this.GradesConfirmed()
    })
  }
}
