import { Component, Input, OnInit } from '@angular/core';
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
import { Module } from '../../../../../interfaces/module';
import { RecsHelperService } from 'src/app/modules/recommendations/recs-helper.service';
import { PathModule } from '../../../../../interfaces/study-path';
import { ModService } from 'src/app/shared/services/module.service';

@Component({
  selector: 'app-add-module-dialog',
  templateUrl: './add-module-dialog.component.html',
  styleUrls: ['./add-module-dialog.component.scss'],
  standalone: false
})
export class AddModuleDialogComponent implements OnInit {
  @Input() modules: Module[];
  @Input() semesterPlanId: string;
  selectedModule: Module | undefined;
  semesterPlanSemester: string | undefined;
  displayPriorModuleWarning: boolean = false;
  warningMessage: string = '';
  moduleNames: string[] = [];
  selectedModuleName = new FormControl('');
  filteredModules: Observable<Module[]>;
  addModuleForm: FormGroup;

  spId: string;
  priorModuleWarningMessage: string;
  passedOrTakenModules: PathModule[];

  constructor(
    private store: Store,
    private planningValidation: PlanningValidationService,
    private snackbar: SnackbarService,
    private formBuilder: FormBuilder,
    private recsHelperService: RecsHelperService,
    private modService: ModService,
  ) { }

  ngOnInit(): void {
    this.addModuleForm = this.formBuilder.group({
      moduleName: this.selectedModuleName,
    });

    this.moduleNames = this.modules.map((mod) => mod.name);
    this.filteredModules = this.selectedModuleName.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    // get passed modules from study path
    this.recsHelperService
      .getPassedOrTakenModulesFromStudyPath()
      .subscribe((mods) => {
        this.passedOrTakenModules = mods;
      });
  }

  private _filter(value: string): Module[] {
    const filterValue = value.toLowerCase();

    return this.modules.filter(
      (mod) =>
        mod.name.toLowerCase().includes(filterValue) ||
        mod.acronym.toLowerCase().includes(filterValue)
    );
  }

  async selectModule(event?: MatAutocompleteSelectedEvent) {
    this.addModuleForm.controls['moduleName'].addValidators([
      Validators.required,
    ]);

    if (event) {
      const selectedValue = event.option.value;

      this.selectedModule =
        this.modules.find((mod) => mod.name === selectedValue) ||
        this.modules.find((mod) => mod.acronym === selectedValue);
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
        this.semesterPlanSemester
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
          this.selectedModule
        );
        if (!priorModuleCheck.success) {
          this.displayPriorModuleWarning = true;
          this.warningMessage = priorModuleCheck.message;
        }
      }
    }
  }

  selectModuleByAcronym(acronym: string) {
    this.selectedModule = this.modules.find((mod) => mod.acronym == acronym);

    if (this.selectedModule) {
      this.selectedModuleName.setValue(this.selectedModule.name);
    }

    this.selectModule();
  }

  viewModuleAcronym(acronym: string) {
    this.modService.selectModuleFromAcronymString(acronym);
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
    if (this.selectedModuleName) {
      this.selectedModule = this.modules.find(
        (mod) => mod.name == this.selectedModuleName.value
      );
      return {
        module: this.selectedModule,
      };
    } else {
      return;
    }
  }
}
