import { Component, Input, OnInit } from '@angular/core';
import { AcademicDate, DateType } from '../../../../../../../interfaces/academic-date';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Semester } from '../../../../../../../interfaces/semester';
import { RestService } from 'src/app/rest.service';

@Component({
    selector: 'admin-academic-dates-dialog',
    templateUrl: './academic-dates-dialog.component.html',
    styleUrl: './academic-dates-dialog.component.scss',
    standalone: false
})
export class AcademicDatesDialogComponent implements OnInit {
  @Input() academicDate: AcademicDate | undefined
  dateTypes$: Observable<DateType[]>
  semesterlist: Semester[]

  constructor(private fb: FormBuilder, private rest: RestService) { }

  academicDateForm = this.fb.group({
    startdate: ['', Validators.required],
    enddate: ['', Validators.required],
    starttime: [''],
    endtime: [''],
    desc: [''],
    semester: ['', Validators.required],
    dateType: this.fb.group({
      typeId: [0, Validators.required],
      name: [''],
      desc: ['']
    })
  })

  ngOnInit(): void {
    this.dateTypes$ = this.rest.getDateTypes();
    this.semesterlist = new Semester().getSemesterList(10)

    if(this.academicDate) {
      this.academicDateForm.patchValue(this.academicDate)
    }
  }

}
