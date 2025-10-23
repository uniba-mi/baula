import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { Status } from '../../../../../interfaces/user';
import { Observable } from 'rxjs';
import { Semester } from '../../../../../interfaces/semester';
import { map, take } from 'rxjs/operators';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-change-status-dialog',
    templateUrl: './change-status-dialog.component.html',
    styleUrls: ['./change-status-dialog.component.scss'],
    standalone: false
})
export class ChangeStatusDialogComponent implements OnInit, OnChanges {
  @Input() statusOptions: Status[];
  @Input() status: string;
  @Input() statusSemester: string | undefined;
  @Input() semesters$: Observable<Semester[]> | undefined;
  @Input() grade: number | undefined;
  selectedModuleStatus = new FormControl('', Validators.required);
  changeStatusForm: FormGroup;
  semesterCopy: string | undefined;
  activeSemester: string;
  minGrade: number = 1;
  maxGrade: number = 5;
  showNoEditHint: boolean = false;
  constructor(private store: Store, private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    this.changeStatusForm = this.formBuilder.group({
      semester: this.statusSemester,
      moduleStatus: this.selectedModuleStatus,
      grade: ['', [Validators.pattern(/^[1-5]((\.|,)[0-9])?$/)]],
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupFormValidators();

    if (this.grade !== undefined) {
      this.changeStatusForm.get('grade')?.setValue(this.grade);
    }

    if (this.semesters$) {
      this.semesters$ = this.semesters$.pipe(
        map(semesters => semesters.filter(semester => !semester.isFutureSemester()))
      );
    }

    this.store.select(getActiveSemester).pipe(take(1)).subscribe(semester => {
      this.activeSemester = semester;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] && this.changeStatusForm) {
      this.updateFormBasedOnStatus(changes['status'].currentValue);
      this.cdr.detectChanges();
    }
    if (changes['grade'] && changes['grade'].currentValue !== undefined) {
      this.changeStatusForm.get('grade')?.setValue(changes['grade'].currentValue);
      this.cdr.detectChanges();
    }
  }

  initForm(): void {
    this.changeStatusForm.get('grade')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.reformatAndValidateInput(value);
      }
    });

    this.selectedModuleStatus.valueChanges.subscribe(status => {
      this.updateFormBasedOnStatus(status || 'open');
    });

    this.fillForm();
  }

  reformatAndValidateInput(value: string): void {
    const formattedValue = value.replace(',', '.');
    if (formattedValue !== value) {
      this.changeStatusForm.get('grade')?.setValue(formattedValue, { emitEvent: false });
    }
  }

  setupFormValidators(): void {
    this.selectedModuleStatus.valueChanges.subscribe(status => {
      const safeStatus = status || 'open';
      this.updateFormBasedOnStatus(safeStatus);
    });
  }

  fillForm(): void {
    this.selectedModuleStatus.setValue(this.status);
  }

  updateFormBasedOnStatus(status: string): void {
    const gradeControl = this.changeStatusForm.get('grade');

    this.showNoEditHint = false;

    if (status === 'failed') {
      this.minGrade = 5;
      this.maxGrade = 5;
      gradeControl?.setValidators([Validators.required, Validators.min(this.minGrade), Validators.max(this.maxGrade)]);
      gradeControl?.setValue(5);
      gradeControl?.disable();
      this.showNoEditHint = true;
      this.cdr.detectChanges()
    } else if (status === 'passed') {
      this.minGrade = 1;
      this.maxGrade = 4;
      gradeControl?.setValidators([Validators.required, Validators.min(this.minGrade), Validators.max(this.maxGrade)]);
      gradeControl?.enable();
    } else {
      gradeControl?.clearValidators();
      gradeControl?.disable();
    }
    gradeControl?.updateValueAndValidity();
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getModuleStatus() {
    if (this.changeStatusForm.valid) {

      const status = this.selectedModuleStatus.value;
      let grade = this.changeStatusForm.controls['grade'].value;

      if (status === 'passed' || status === 'failed') {
        grade = this.changeStatusForm.controls['grade'].value;
      } else {
        grade = null;
      }

      return {
        status: this.selectedModuleStatus.value,
        semester: this.statusSemester,
        grade: grade,
      };
    }
    return null;
  }
}