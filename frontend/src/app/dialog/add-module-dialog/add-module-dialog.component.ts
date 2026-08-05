import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { getSelectedSemesterPlanSemesterById } from 'src/app/selectors/study-planning.selectors';
import { AlertType } from 'src/app/shared/classes/alert';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { Module } from '@interfaces/module';
import { RecsHelperService } from 'src/app/modules/recommendations/recs-helper.service';
import { PathModule } from '@interfaces/study-path';

@Component({
  selector: 'app-add-module-dialog',
  templateUrl: './add-module-dialog.component.html',
  styleUrls: ['./add-module-dialog.component.scss'],
  standalone: false,
})
export class AddModuleDialogComponent implements OnInit {
  private store = inject(Store);
  private planningValidation = inject(PlanningValidationService);
  private snackbar = inject(SnackbarService);
  private formBuilder = inject(FormBuilder);
  private recsHelperService = inject(RecsHelperService);

  @Input() modules: Module[];
  @Input() semesterPlanId: string;
  selectedModule: Module | undefined;
  semesterPlanSemester: string | undefined;
  displayPriorModuleWarning: boolean = false;
  warningMessage: string = '';
  selectedModuleName = new FormControl<string | Module>('');
  filteredModules: Observable<Module[]>;
  addModuleForm: FormGroup;

  spId: string;
  priorModuleWarningMessage: string;
  passedOrTakenModules: PathModule[];

  ngOnInit(): void {
    this.modules = this.modules.filter(
      (mod) => !mod.isOld && !mod.hasIssue && !mod.notExistingModule,
    );

    this.addModuleForm = this.formBuilder.group({
      moduleName: this.selectedModuleName,
    });

    this.filteredModules = this.selectedModuleName.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );

    // get passed modules from study path
    this.recsHelperService
      .getPassedOrTakenModulesFromStudyPath()
      .subscribe((mods) => {
        this.passedOrTakenModules = mods;
      });
  }

  private _filter(value: string | Module): Module[] {
    const filterValue = (
      typeof value === 'string' ? value : value.name
    ).toLowerCase();

    return this.modules.filter(
      (mod) =>
        mod.name.toLowerCase().includes(filterValue) ||
        mod.acronym.toLowerCase().includes(filterValue),
    );
  }

  displayModule(module: string | Module): string {
    return typeof module === 'string' ? module : `${module?.acronym} ${module?.name}`;
  }

  async selectModule(event?: MatAutocompleteSelectedEvent) {
    this.addModuleForm.controls['moduleName'].addValidators([
      Validators.required,
    ]);

    if (event) {
      this.selectedModule = event.option.value;
    }

    // set prior module warning to false
    this.displayPriorModuleWarning = false;

    this.store
      .select(getSelectedSemesterPlanSemesterById(this.semesterPlanId))
      .subscribe((semester) => (this.semesterPlanSemester = semester));

    // display warning if module not offered in the selected semester
    if (this.selectedModule && this.semesterPlanSemester) {
      let planningValidationResult = this.planningValidation.isModuleOffered(
        this.selectedModule,
        this.semesterPlanSemester,
      );
      if (!planningValidationResult.success) {
        this.snackbar.openSnackBar({
          type: AlertType.WARNING,
          message: planningValidationResult.message,
        });
      }
    }

    // display warning if priorModules have not been taken or passed
    if (this.selectedModule) {
      if (this.selectedModule.allPriorModules.length > 0) {
        let priorModuleCheck = this.planningValidation.priorModulesTaken(
          this.selectedModule,
        );
        if (!priorModuleCheck.success) {
          this.displayPriorModuleWarning = true;
          this.warningMessage = priorModuleCheck.message;
        }
      }
    }
  }

  clearInput() {
    this.selectedModuleName.setValue('');
    this.displayPriorModuleWarning = false;
  }

  // otherwise, typing stuff in the input is also valid and causes issues
  get isModuleSelected(): boolean {
    return !!this.selectedModule;
  }

  // provides dialog data for call in component
  getSelectedModuleFromDialog() {
    return {
      module: this.selectedModule,
    };
  }
}
