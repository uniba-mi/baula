import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { getSelectedSemesterplanSemesterById } from 'src/app/selectors/study-planning.selectors';
import { AlertType } from 'src/app/shared/classes/alert';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { Module } from '../../../../../interfaces/module';
import { getUserStudyprogrammes } from 'src/app/selectors/user.selectors';
import { RecHelperService } from 'src/app/modules/recs/rec-helper.service';
import { PathModule } from '../../../../../interfaces/studypath';
import { ModulePasses } from '../../../../../interfaces/recommendation';
import { ModService } from 'src/app/shared/services/module.service';
import { RecsRestService } from 'src/app/modules/recs/recs-rest.service';

@Component({
    selector: 'app-add-module-dialog',
    templateUrl: './add-module-dialog.component.html',
    styleUrls: ['./add-module-dialog.component.scss'],
    standalone: false
})
export class AddModuleDialogComponent implements OnInit {
  @Input() modules: Module[];
  @Input() semesterplanId: string;
  selectedModule: Module | undefined;
  semesterplanSemester: string | undefined;
  displayPriorModuleWarning: boolean = false;
  warningMessage: string = '';
  moduleNames: string[] = [];
  selectedModuleName = new FormControl('');
  filteredModules: Observable<Module[]>;
  addModuleForm: FormGroup;

  spId: string;
  displayKeyDriverWarning: boolean;
  priorModuleWarningMessage: string;
  successors$: Observable<ModulePasses[]>;
  passedOrTakenModules: PathModule[];
  cohortRecsAvailable: boolean;

  constructor(
    private store: Store,
    private planningValidation: PlanningValidationService,
    private snackbar: SnackbarService,
    private formBuilder: FormBuilder,
    private recHelperService: RecHelperService,
    private modService: ModService,
    private recsApi: RecsRestService
  ) {}

  ngOnInit(): void {
    this.addModuleForm = this.formBuilder.group({
      moduleName: this.selectedModuleName,
    });

    this.moduleNames = this.modules.map((mod) => mod.name);
    this.filteredModules = this.selectedModuleName.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    /* check if recommendations are available for the user's study program */
    this.store
      .select(getUserStudyprogrammes)
      .pipe(take(1))
      .pipe(
        switchMap((sps) => {
          if (sps) {
            this.spId = sps[0].spId;
            return this.recsApi.getCohortRecsAvailabilityInfo(this.spId);
          } else {
            return of(false);
          }
        })
      )
      .subscribe((cohortRecsAvailable) => {
        this.cohortRecsAvailable = cohortRecsAvailable;
      });

    // get passed modules from studypath
    this.recHelperService
      .getPassedOrTakenModulesFromStudypath()
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
    this.displayKeyDriverWarning = false;

    this.store
      .select(getSelectedSemesterplanSemesterById(this.semesterplanId))
      .subscribe((semester) => (this.semesterplanSemester = semester));

    // display warning if module not offered in the selected semester
    if (this.selectedModule && this.semesterplanSemester) {
      let planningValidationResult = this.planningValidation.isModuleOffered(
        this.selectedModule,
        this.semesterplanSemester
      );
      if (!planningValidationResult.success) {
        this.snackbar.openSnackBar({
          type: AlertType.WARNING,
          message: planningValidationResult.message,
        });
      }
    }

    if (this.cohortRecsAvailable) {
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

      // Fetch and display filtered recommendable successor modules
      if (this.selectedModule) {
        this.successors$ =
          this.recHelperService.getFilteredRecommendableSuccessors(
            this.spId,
            this.selectedModule.acronym,
            10 // number of desired results
          );
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
