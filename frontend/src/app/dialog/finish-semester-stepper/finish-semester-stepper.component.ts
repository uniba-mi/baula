import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PathModule } from '../../../../../interfaces/study-path';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { ExtendedModuleGroup } from '../../../../../interfaces/module-group';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { Semester } from '../../../../../interfaces/semester';

@Component({
  selector: 'app-finish-semester-stepper',
  templateUrl: './finish-semester-stepper.component.html',
  styleUrl: './finish-semester-stepper.component.scss',
  standalone: false
})
export class FinishSemesterStepperComponent {

  @Input() missingModules: PathModule[];
  stepperForm: FormGroup;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  semesters$: Observable<Semester[]>
  private subscriptions: Subscription = new Subscription();
  showNoEditHint: boolean = false;
  showNoGradeHint: boolean = false;
  selectedModules: Set<string> = new Set<string>();
  formInitialised: boolean = false; // control initialisation of form
  formData: boolean = false;
  emptySelect: boolean = false;
  // Map to store the unique form control keys
  moduleFormKeys: Map<string, string> = new Map<string, string>();
  // Module index map to help with debugging duplicate acronyms
  moduleIndexMap: Map<string, number> = new Map<string, number>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private cdr: ChangeDetectorRef,
  ) {
    this.stepperForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);

    // select all missing modules by default
    this.missingModules.forEach(module => {
      const key = module.isUserGenerated ? module._id : module.acronym;
      if (key) {
        this.selectedModules.add(key);
      }
    });

    this.emptySelect = this.selectedModules.size === 0;
  }

  // prevent ExpressionChangedAfterItHasBeenCheckedError
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  startStepper(): void {
    this.formInitialised = true;
    if (this.selectedModules.size > 0) {
      this.initializeForm();
    } else {
      this.formData = false;
    }
  }

  stopStepper(): void {
    this.formInitialised = false;
  }

  private initializeForm(): void {
    const activeModules = this.getSelectedModules();

    if (activeModules.length > 0) {
      this.formData = true;
      this.stepperForm = this.fb.group({});
      this.moduleFormKeys.clear(); // Clear previous keys
      this.moduleIndexMap.clear(); // Clear index map

      activeModules.forEach((module, index) => {
        // Create a truly unique key for the form group
        let uniqueKey: string;

        if (module.isUserGenerated && module._id) {
          // For user-generated modules, use ID which is guaranteed unique
          uniqueKey = `id_${module._id}`;
        } else {
          // For other modules, track count of each acronym to make unique
          const count = this.moduleIndexMap.get(module.acronym) || 0;
          this.moduleIndexMap.set(module.acronym, count + 1);
          uniqueKey = `${module.acronym}_${count}`;
        }

        // Store mapping from selection key to form control key
        const selectionKey = module.isUserGenerated ? module._id : module.acronym;
        if (selectionKey) {
          this.moduleFormKeys.set(selectionKey, uniqueKey);
        }

        // do not edit acronyms and names for modules that are not user generated
        const isEditable = module.isUserGenerated;

        const moduleFormGroup = this.fb.group({
          acronym: [{ value: module.acronym, disabled: !isEditable }, Validators.required],
          name: [{ value: module.name, disabled: !isEditable }, Validators.required],
          notes: [module.notes],
          status: [module.status, Validators.required],
          ects: [module.ects, [
            Validators.required,
            Validators.min(1),
            Validators.max(30)
          ]],
          grade: [(module.grade).toString(), []],
          semester: module.semester,
          mgId: [module.mgId ? module.mgId : ''],
          isUserGenerated: [module.isUserGenerated], // retain property
          _id: [module._id], // retain property
          flexNowImported: [module.flexNowImported], // retain property
        });

        this.stepperForm.addControl(uniqueKey, moduleFormGroup);
        this.setupAcronymSubscription(moduleFormGroup.get('acronym') as FormControl, module.acronym);
        this.setupStatusChanges(moduleFormGroup);
      });
    } else {
      this.formData = false;
    }
  }

  // to remove the suggestions on subform change
  private setupAcronymSubscription(control: FormControl, initialAcronym: string): void {
    this.subscriptions.add(
      control.valueChanges.subscribe(value => {
        if (value !== initialAcronym) {
          this.showNoEditHint = false;
          this.showNoGradeHint = false;
        }
      })
    );
  }

  setModuleCompletion(module: PathModule, completed: boolean): void {
    const key = module.isUserGenerated ? module._id : module.acronym;

    if (!key) return;

    if (completed) {
      this.selectedModules.add(key);
    } else {
      this.selectedModules.delete(key);
    }

    this.emptySelect = this.selectedModules.size === 0;
  }

  isModuleSelected(module: PathModule): boolean {
    const key = module.isUserGenerated ? module._id : module.acronym;
    if (!key) return false;
    return this.selectedModules.has(key);
  }

  getSelectedModules(): PathModule[] {
    return this.missingModules.filter(module => {
      const key = module.isUserGenerated ? module._id : module.acronym;
      return key && this.selectedModules.has(key);
    });
  }

  private setupStatusChanges(formGroup: FormGroup): void {
    const statusControl = formGroup.get('status') as FormControl;
    const gradeControl = formGroup.get('grade') as FormControl;

    // handle comma input
    this.subscriptions.add(
      gradeControl.valueChanges.subscribe(value => {
        if (value && typeof value === 'string' && value.includes(',')) {
          const normalizedValue = value.replace(',', '.');
          gradeControl.setValue(normalizedValue, { emitEvent: false });
        }
      })
    );

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

  // Modified to use the moduleFormKeys map
  getFormGroup(formKey: string): FormGroup {
    return this.stepperForm.controls[formKey] as FormGroup;
  }

  // Get form key for a module - for use in the template
  getFormKey(module: PathModule, index: number): string {
    // First, check if we have a mapping for this module
    const selectionKey = module.isUserGenerated ? module._id : module.acronym;
    if (selectionKey && this.moduleFormKeys.has(selectionKey)) {
      return this.moduleFormKeys.get(selectionKey)!;
    }

    // If not found (shouldn't happen), create a key using the same logic as in initializeForm
    if (module.isUserGenerated && module._id) {
      return `id_${module._id}`;
    } else {
      const count = this.moduleIndexMap.get(module.acronym) || 0;
      return `${module.acronym}_${count}`;
    }
  }

  selectionChange(event: any) {
    this.showNoEditHint = false;
    this.showNoGradeHint = false;
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  getData() {
    this.stepperForm.updateValueAndValidity();

    // Return an array of modules instead of an object
    let pathModules: PathModule[] = [];

    if (!this.emptySelect && this.stepperForm.valid) {
      // Get raw form values
      const rawValues = this.stepperForm.getRawValue();

      // Transform the form values into an array
      pathModules = [];

      // Use the selected modules to get the right order and include all modules
      for (const module of this.getSelectedModules()) {
        const selectionKey = module.isUserGenerated ? module._id : module.acronym;
        if (selectionKey) {
          const formKey = this.moduleFormKeys.get(selectionKey);

          if (formKey && rawValues[formKey]) {

            // Add to array
            pathModules.push(rawValues[formKey]);
          }
        }
      }
    }

    const droppedModules = this.missingModules.filter((missingModule) => {
      return !(
        (missingModule._id && this.selectedModules.has(missingModule._id)) ||
        this.selectedModules.has(missingModule.acronym)
      );
    });

    return {
      emptySelect: this.emptySelect,
      pathModules,
      droppedModules,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}