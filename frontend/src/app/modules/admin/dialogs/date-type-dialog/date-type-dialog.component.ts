import { Component, Input } from '@angular/core';
import { DateType } from '../../../../../../../interfaces/academic-date';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'admin-date-type-dialog',
    templateUrl: './date-type-dialog.component.html',
    styleUrl: './date-type-dialog.component.scss',
    standalone: false
})
export class DateTypeDialogComponent {
  @Input() dateType: DateType | undefined

  constructor(private fb: FormBuilder) { }

  dateTypeForm = this.fb.group({
    name: ['', Validators.required],
    desc: [''],
  })

  ngOnInit(): void {
    if(this.dateType) {
      this.dateTypeForm.patchValue(this.dateType)
    }
  }
}
