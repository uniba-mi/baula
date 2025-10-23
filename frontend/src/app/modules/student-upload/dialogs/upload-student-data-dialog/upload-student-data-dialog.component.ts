import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
  selector: 'app-upload-student-data-dialog',
  templateUrl: './upload-student-data-dialog.component.html',
  styleUrl: './upload-student-data-dialog.component.scss',
  standalone: false
})
export class UploadStudentDataDialogComponent {

  consentForm: FormGroup;
  fileToUpload: File | null = null;

  constructor(private fb: FormBuilder, private store: Store) {
    this.consentForm = this.fb.group({
      agreeToTerms: [false, Validators.requiredTrue],
    });
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getConsent() {
    return this.consentForm.valid && this.consentForm.get('agreeToTerms')?.value;
  }
}
