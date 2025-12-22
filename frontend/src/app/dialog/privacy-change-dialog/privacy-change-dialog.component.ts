import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-privacy-change-dialog',
  standalone: false,
  templateUrl: './privacy-change-dialog.component.html',
  styleUrl: './privacy-change-dialog.component.scss'
})
export class PrivacyChangeDialogComponent {

  privacyChangeForm: FormGroup;
  selectedPrivacyChoice: string | null = null;

  constructor(private fb: FormBuilder) {
    this.privacyChangeForm = this.fb.group({
      privacyChange: [null, Validators.required],
    });
  }

  updateChoice() {
    this.selectedPrivacyChoice = this.privacyChangeForm.get('privacyChange')?.value;
  }

  getPrivacyChoiceFromDialog() {
    if (this.selectedPrivacyChoice) {
      return {
        choice: this.selectedPrivacyChoice,
      };
    } else {
      return;
    }
  }
}
