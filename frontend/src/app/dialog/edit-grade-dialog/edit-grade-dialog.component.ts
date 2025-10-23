import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
    selector: 'app-edit-grade-dialog',
    templateUrl: './edit-grade-dialog.component.html',
    styleUrl: './edit-grade-dialog.component.scss',
    standalone: false
})
export class EditGradeDialogComponent {
  @Input() grade: number | undefined;
  @Input() minGrade: number;
  @Input() maxGrade: number;

  gradeForm: FormGroup;
  showNoEditHint: boolean = false;

  constructor(private store: Store, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    const initialGrade = this.grade !== undefined ? this.grade.toString().replace(',', '.') : '';
    this.gradeForm = this.formBuilder.group({
      grade: [initialGrade, [
        Validators.required,
        Validators.min(this.minGrade),
        Validators.max(this.maxGrade),
        Validators.pattern(/^[1-5]((\.|,)[0-9])?$/),
      ]]
    });

    // disable input if minGrade and maxGrade are 5
    if (this.minGrade === 5 && this.maxGrade === 5) {
      this.gradeForm.get('grade')?.disable();
      this.gradeForm.get('grade')?.setValue(5);
      this.showNoEditHint = true;
    }

    this.gradeForm.get('grade')?.valueChanges.subscribe(value => {
      this.reformatAndValidateInput(value);
    });
  }

  private reformatAndValidateInput(value: string): void {
    const formattedValue = value.replace(',', '.');
    if (formattedValue !== this.gradeForm.get('grade')?.value) {
      this.gradeForm.get('grade')?.setValue(formattedValue, { emitEvent: false });
      this.gradeForm.get('grade')?.updateValueAndValidity();
    }
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }
}
