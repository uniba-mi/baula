import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { DateType } from '@interfaces/academic-date';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'admin-date-type-dialog',
  templateUrl: './date-type-dialog.component.html',
  styleUrl: './date-type-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DateTypeDialogComponent {
  private fb = inject(FormBuilder);

  @Input() dateType: DateType | undefined;

  dateTypeForm = this.fb.group({
    name: ['', Validators.required],
    desc: [''],
  });

  ngOnInit(): void {
    if (this.dateType) {
      this.dateTypeForm.patchValue(this.dateType);
    }
  }
}
