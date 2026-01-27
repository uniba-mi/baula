import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
  selector: 'app-upload-student-data-dialog',
  templateUrl: './upload-student-data-dialog.component.html',
  styleUrl: './upload-student-data-dialog.component.scss',
  standalone: false
})
export class UploadStudentDataDialogComponent {
  flexNowImportConfirmed = false;
  studypathConfirmed = false;
  gradesConfirmed = false;
  fileToUpload: File | null = null;

  constructor(private store: Store) { }

  receiveChanges(confirmations: {
    flexNowImportConfirmed: boolean,
    studypathConfirmed: boolean,
    gradesConfirmed: boolean,
  }) {
    this.flexNowImportConfirmed = confirmations.flexNowImportConfirmed;
    this.studypathConfirmed = confirmations.studypathConfirmed;
    this.gradesConfirmed = confirmations.gradesConfirmed;
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getConsent() {
    return this.flexNowImportConfirmed ? {
      flexNowImportConfirmed: this.flexNowImportConfirmed,
      studypathConfirmed: this.studypathConfirmed,
      gradesConfirmed: this.gradesConfirmed
    } : undefined;
  }
}
