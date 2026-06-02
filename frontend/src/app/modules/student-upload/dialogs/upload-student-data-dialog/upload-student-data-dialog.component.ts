import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
  selector: 'app-upload-student-data-dialog',
  templateUrl: './upload-student-data-dialog.component.html',
  styleUrl: './upload-student-data-dialog.component.scss',
  standalone: false,
})
export class UploadStudentDataDialogComponent {
  @Input() onlyStudypath: boolean;
  @Input() onlyMetaData: boolean;
  flexNowImportConfirmed = false;
  metadataConfirmed = false;
  studypathConfirmed = false;
  gradesConfirmed = false;
  fileToUpload: File | null = null;

  constructor(private store: Store) {}

  receiveChanges(confirmations: {
    flexNowImportConfirmed: boolean;
    metadataConfirmed: boolean;
    studypathConfirmed: boolean;
    gradesConfirmed: boolean;
  }) {
    this.flexNowImportConfirmed = confirmations.flexNowImportConfirmed;
    this.metadataConfirmed = confirmations.metadataConfirmed;
    this.studypathConfirmed = confirmations.studypathConfirmed;
    this.gradesConfirmed = confirmations.gradesConfirmed;
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getConsent() {
    if (this.flexNowImportConfirmed) {
      return {
        flexNowImportConfirmed: this.flexNowImportConfirmed,
        metadataConfirmed: this.metadataConfirmed,
        studypathConfirmed: this.studypathConfirmed,
        gradesConfirmed: this.gradesConfirmed,
      };
    } else {
      return undefined
    }
  }
}
