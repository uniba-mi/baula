import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PathModule } from '../../../../../../../interfaces/study-path';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { Store } from '@ngrx/store';
import { Observable, Subscription, map, take } from 'rxjs';
import { ExtendedModuleGroup } from '../../../../../../../interfaces/module-group';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { Semester } from '../../../../../../../interfaces/semester';
import { getSemesterList } from 'src/app/selectors/user.selectors';

@Component({
    selector: 'app-upload-student-data-stepper',
    templateUrl: './upload-student-data-stepper.component.html',
    styleUrl: './upload-student-data-stepper.component.scss',
    standalone: false
})
export class UploadStudentDataStepperComponent {

  @Input() missingModules: PathModule[];
  stepperForm: FormGroup;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  semesters$: Observable<Semester[]>
  similarGroups: ExtendedModuleGroup[] = [];
  private subscriptions: Subscription = new Subscription();
  showRecommendations: boolean = false;
  showSimilarGroups: boolean = false;
  showNoEditHint: boolean = false;
  showNoGradeHint: boolean = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
  ) {
    this.stepperForm = this.fb.group({});
  }

  ngOnInit(): void {

    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);
    this.semesters$ = this.store.select(getSemesterList);
    if (this.semesters$) {
      this.semesters$ = this.semesters$.pipe(
        map(semesters => semesters.filter(semester => !semester.isFutureSemester()))
      );
    }
    this.initializeForm();
  }

  private initializeForm(): void {
    this.stepperForm = this.fb.group({});
    this.missingModules.forEach(module => {

      const moduleFormGroup = this.fb.group({
        acronym: [module.acronym, Validators.required],
        name: [module.name, Validators.required],
        notes: [module.notes],
        status: [module.status, Validators.required],
        ects: [module.ects, [
          Validators.required,
          Validators.min(1),
          Validators.max(30)
        ]],
        grade: [(module.grade).toString(), []],
        semester: [module.semester, Validators.required],
        mgId: [module.mgId ? module.mgId : ''],
        // exams: this.fb.array(module.exams.map(exam => this.initExamGroup(exam))),
        isUserGenerated: [module.isUserGenerated],
        flexNowImported: [module.flexNowImported],
      });
      this.stepperForm.addControl(module.acronym, moduleFormGroup);
      this.setupAcronymSubscription(moduleFormGroup.get('acronym') as FormControl, module.acronym);
      this.setupStatusChanges(moduleFormGroup);
    });
  }

  // to remove the suggestions on subform change
  private setupAcronymSubscription(control: FormControl, initialAcronym: string): void {
    this.subscriptions.add(
      control.valueChanges.subscribe(value => {
        if (value !== initialAcronym) {
          this.similarGroups = [];
          this.showRecommendations = false;
          this.showNoEditHint = false;
          this.showNoGradeHint = false;
        }
      })
    );
  }

  private setupStatusChanges(formGroup: FormGroup): void {
    const statusControl = formGroup.get('status') as FormControl;
    const gradeControl = formGroup.get('grade') as FormControl;

    statusControl.valueChanges.subscribe(status => {
      this.showNoEditHint = false;
      this.showNoGradeHint = false;

      switch (status) {
        case 'taken':
          gradeControl.setValue(0);
          gradeControl.disable();
          this.showNoGradeHint = true;
          break;
        case 'passed':
          gradeControl.setValidators([Validators.required, Validators.min(1), Validators.max(4)]);
          gradeControl.enable();
          break;
        case 'failed':
          gradeControl.setValue(5);
          gradeControl.setValidators([Validators.required, Validators.min(5), Validators.max(5)]);
          gradeControl.disable();
          this.showNoEditHint = true;
          break;
        default:
          gradeControl.setValue(null);
          gradeControl.clearValidators();
          gradeControl.enable();
          break;
      }
      gradeControl.updateValueAndValidity();
    });
    statusControl.updateValueAndValidity();
  }

  // initExamGroup(exam: Exam): FormGroup {
  //   return this.fb.group({
  //     name: [exam.name, Validators.required],
  //     attempts: this.fb.array(exam.attempts.map(attempt => this.createAttemptGroup(attempt)))
  //   });
  // }

  // createAttemptGroup(attempt: ExamAttempt): FormGroup {
  //   return this.fb.group({
  //     semester: [attempt.semester, Validators.required],
  //     status: [attempt.status, Validators.required],
  //     grade: [attempt.grade, Validators.required]
  //   });
  // }

  getFormGroup(acronym: string): FormGroup {
    return this.stepperForm.get(acronym) as FormGroup;
  }

  // getExams(form: FormGroup): FormArray {
  //   return form.get('exams') as FormArray;
  // }

  // getAttempts(examGroup: AbstractControl): FormArray {
  //   return examGroup.get('attempts') as FormArray;
  // }

  selectionChange(event: any) {
    this.similarGroups = [];
    this.showRecommendations = false;
    this.showNoEditHint = false;
    this.showNoGradeHint = false;
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getData() {
    if (this.stepperForm.valid) {
      return this.stepperForm.value
    } else {
      return;
    }
  }

  selectSimilarGroup(mgId: string, acronym: string): void {
    const formGroup = this.getFormGroup(acronym);
    if (formGroup) {
      formGroup.get('mgId')?.setValue(mgId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

