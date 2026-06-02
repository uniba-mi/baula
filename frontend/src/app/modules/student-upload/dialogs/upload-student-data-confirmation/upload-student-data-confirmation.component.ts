import { Component, EventEmitter, Input, model, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-upload-student-data-confirmation',
  standalone: false,
  templateUrl: './upload-student-data-confirmation.component.html',
  styleUrl: './upload-student-data-confirmation.component.scss'
})
export class UploadStudentDataConfirmationComponent implements OnInit {
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

  ngOnInit(): void {
    if(this.onlyStudypath) {
      this.StudypathConfirmed.set(true)
    }
  }

  emitChange() {
    this.confirmFlexNowImport.emit({
      flexNowImportConfirmed: this.FlexNowImportConfirmed(),
      metadataConfirmed: this.onlyStudypath ? false : true,
      studypathConfirmed: this.StudypathConfirmed(),
      gradesConfirmed: this.GradesConfirmed()
    })
  }
}
