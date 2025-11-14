import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { PathModule } from '../../../../../interfaces/study-path';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { Observable } from 'rxjs';
import { ExtendedModuleGroup } from '../../../../../interfaces/module-group';

@Component({
  selector: 'app-edit-path-module-dialog',
  templateUrl: './edit-path-module-dialog.component.html',
  styleUrls: ['./edit-path-module-dialog.component.scss'],
  standalone: false
})
export class EditPathModuleDialogComponent implements OnInit {
  @Input() pathModule: PathModule;
  pathModuleForm: FormGroup;
  gradeControl: FormControl;
  showNoEditHint: boolean = false;
  showNoGradeHint: boolean = false;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;

  constructor(private store: Store, private fb: FormBuilder) { }

  ngOnInit(): void {

    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);
    this.initializeForm();
  }

  private initializeForm(): void {
    this.pathModuleForm = this.fb.group({
      _id: [this.pathModule?._id || null], // hidden to preserve
      acronym: [this.pathModule?.acronym || '', Validators.required],
      name: [this.pathModule?.name || '', Validators.required],
      status: [this.pathModule?.status || 'open', Validators.required],
      ects: [this.pathModule?.ects || '', [
        Validators.required,
        Validators.min(1),
        Validators.max(30),
      ]],
      grade: [this.pathModule?.grade ? this.pathModule.grade.toString() : '', [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
        Validators.pattern(/^[1-5]((\.|,)[0-9])?$/),
      ]],
      mgId: [this.pathModule?.mgId || ''],
    });

    if (this.pathModule!.flexNowImported) {
      this.pathModuleForm.get('acronym')?.disable();
    }

    this.gradeControl = this.pathModuleForm.get('grade') as FormControl;
    this.gradeControl.valueChanges.subscribe(value => {
      if(value) {
        this.reformatAndValidateInput(value);
      }
    });

    this.setupStatusChanges(this.pathModuleForm);
  }

  private setupStatusChanges(formGroup: FormGroup): void {
    const statusControl = formGroup.get('status') as FormControl;

    statusControl.valueChanges.subscribe(status => {
      this.showNoEditHint = false;
      this.showNoGradeHint = false;

      switch (status) {
        case 'taken':
          this.gradeControl.setValue('0');
          this.gradeControl.disable();
          this.showNoGradeHint = true;
          break;
        case 'passed':
          this.gradeControl.setValidators([Validators.required, Validators.min(1), Validators.max(4)]);
          this.gradeControl.enable();
          break;
        case 'failed':
          this.gradeControl.setValue('5');
          this.gradeControl.setValidators([Validators.required, Validators.min(5), Validators.max(5)]);
          this.gradeControl.disable();
          this.showNoEditHint = true;
          break;
        default:
          this.gradeControl.setValue(null);
          this.gradeControl.clearValidators();
          this.gradeControl.enable();
          break;
      }
      this.gradeControl.updateValueAndValidity();
    });
    statusControl.updateValueAndValidity();
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getData() {
    if (this.pathModuleForm.valid) {
      return this.pathModuleForm.getRawValue(); // includes disabled controls
    } else {
      return;
    }
  }

  private reformatAndValidateInput(value: string): void {
    const formattedValue = value.replace(',', '.');
    if (formattedValue !== this.gradeControl.value) {
      this.gradeControl.setValue(formattedValue, { emitEvent: false });
      this.gradeControl.updateValueAndValidity();
    }
  }
}
