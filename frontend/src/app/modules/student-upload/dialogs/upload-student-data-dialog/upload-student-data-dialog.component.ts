import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
  selector: 'app-upload-student-data-dialog',
  templateUrl: './upload-student-data-dialog.component.html',
  styleUrl: './upload-student-data-dialog.component.scss',
  standalone: false,
})
export class UploadStudentDataDialogComponent {
  private store = inject(Store);

  @Input() onlyStudypath: boolean;
  @Input() onlyMetaData: boolean;
  flexNowImportConfirmed = false;
  metadataConfirmed = false;
  studypathConfirmed = false;
  fileToUpload: File | null = null;

  receiveChanges(confirmations: {
    flexNowImportConfirmed: boolean;
    metadataConfirmed: boolean;
    studypathConfirmed: boolean;
  }) {
    this.flexNowImportConfirmed = confirmations.flexNowImportConfirmed;
    this.metadataConfirmed = confirmations.metadataConfirmed;
    this.studypathConfirmed = confirmations.studypathConfirmed;
  }

  close() {
    const mode = this.flexNowImportConfirmed ? 'data' : 'noData';
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getConsent() {
    if (this.flexNowImportConfirmed) {
      return {
        flexNowImportConfirmed: this.flexNowImportConfirmed,
        metadataConfirmed: this.metadataConfirmed,
        studypathConfirmed: this.studypathConfirmed,
      };
    } else {
      return undefined;
    }
  }
}
