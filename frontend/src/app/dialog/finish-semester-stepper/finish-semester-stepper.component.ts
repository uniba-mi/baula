import { ChangeDetectorRef, Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PathModule } from '@interfaces/study-path';
import {
  getModules,
  getStructuredModuleGroups,
} from 'src/app/selectors/module-overview.selectors';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  concatMap,
  map,
  Observable,
  of,
  shareReplay,
  Subscription,
  take,
} from 'rxjs';
import { ExtendedModuleGroup } from '@interfaces/module-group';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { Semester } from '@interfaces/semester';
import { getUser } from 'src/app/selectors/user.selectors';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';
import { mergeFlexNowModulesIntoMissingModules } from 'src/app/shared/helpers/flex-now-merge.helper';
import { ModService } from 'src/app/shared/services/module.service';

@Component({
  selector: 'app-finish-semester-stepper',
  templateUrl: './finish-semester-stepper.component.html',
  styleUrl: './finish-semester-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FinishSemesterStepperComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private flexNowService = inject(FlexnowService);
  private modService = inject(ModService);

  @Input() missingModules: PathModule[];
  @Input() semester: string | undefined;
  stepperForm: FormGroup;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  semesters$: Observable<Semester[]>;
  private subscriptions: Subscription = new Subscription();
  showNoEditHint: boolean = false;
  showNoGradeHint: boolean = false;
  selectedModules: Set<string> = new Set<string>();
  formInitialised: boolean = false; // control initialisation of form
  formData: boolean = false;
  emptySelect: boolean = false;

  flexNowSyncEnabled$: Observable<boolean>;
  flexNowSyncLoading: boolean = false;
  flexNowSyncError: string | null = null;
  flexNowSyncDone: boolean = false;
  // Map to store the unique form control keys
  moduleFormKeys: Map<string, string> = new Map<string, string>();
  // Module index map to help with debugging duplicate acronyms
  moduleIndexMap: Map<string, number> = new Map<string, number>();
  // caches the module-group-wizard suggestion observable per acronym, since
  // findModuleGroups() now goes over HTTP - without this, calling it directly in the
  // template would fire a new request on every change detection cycle
  private moduleGroupSuggestions = new Map<string, Observable<string[]>>();

  constructor() {
    this.stepperForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);

    this.flexNowSyncEnabled$ = this.store.select(getUser).pipe(
      map((user) => this.flexNowService.flexNowImportEnabled(user)),
    );

    // select all missing modules by default
    this.missingModules.forEach((module) => {
      const key = this.getModuleKey(module);
      if (key) {
        this.selectedModules.add(key);
      }
    });

    this.emptySelect = this.selectedModules.size === 0;
  }

  // user-generated modules are normally keyed by their persisted _id, but a
  // module freshly merged in from FlexNow (via syncWithFlexNow) has no _id yet
  // until it's actually saved - fall back to acronym so selection tracking works.
  // Also used as the @for track expression in the template (public for that reason):
  // syncWithFlexNow() replaces matched entries with new object references (spread),
  // so tracking by object identity would make Angular treat an updated module as
  // removed+re-added on every sync instead of recognizing it as the same row.
  getModuleKey(module: PathModule): string | undefined {
    return module.isUserGenerated ? module._id ?? module.acronym : module.acronym;
  }

  // module group ids this acronym was ever assigned to (current + older MHB versions) -
  // feeds the module-group-wizard's acronym-based suggestions; cached per acronym since
  // it now goes over HTTP and the template calls this on every change detection cycle
  getPossibleMgIdsForAcronym(acronym: string): Observable<string[]> {
    if (!this.moduleGroupSuggestions.has(acronym)) {
      this.moduleGroupSuggestions.set(
        acronym,
        this.modService.findModuleGroups(acronym).pipe(shareReplay(1)),
      );
    }
    return this.moduleGroupSuggestions.get(acronym)!;
  }

  syncWithFlexNow(): void {
    if (!this.semester || this.flexNowSyncLoading) return;

    this.flexNowSyncLoading = true;
    this.flexNowSyncError = null;

    this.flexNowService
      .ensureStudypathReadConsent()
      .pipe(
        concatMap((hasConsent) => {
          if (!hasConsent) {
            return of(null);
          }
          return combineLatest([
            this.flexNowService.getFlexNowDataForSemester(this.semester ?? new Semester().name),
            this.store.select(getModules),
          ]);
        }),
        take(1),
      )
      .subscribe({
        next: (result) => {
          this.flexNowSyncLoading = false;

          // consent dialog was cancelled - button stays usable, nothing else to do
          if (!result) return;

          const [flexNowModules, mhbModules] = result;
          if (flexNowModules === null) {
            this.flexNowSyncError =
              'FlexNow-Abgleich fehlgeschlagen. Bitte versuche es später erneut.';
            return;
          }

          const mhbAcronyms = new Set(mhbModules.map((mod) => mod.acronym));
          const { merged } = mergeFlexNowModulesIntoMissingModules(
            this.missingModules,
            flexNowModules,
            mhbAcronyms,
          );

          this.missingModules = merged;
          merged.forEach((module) => {
            const key = this.getModuleKey(module);
            if (key) {
              this.selectedModules.add(key);
            }
          });
          this.emptySelect = this.selectedModules.size === 0;
          this.flexNowSyncDone = true;
        },
        error: () => {
          this.flexNowSyncLoading = false;
          this.flexNowSyncError =
            'FlexNow-Abgleich fehlgeschlagen. Bitte versuche es später erneut.';
        },
      });
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
        const selectionKey = this.getModuleKey(module);
        if (selectionKey) {
          this.moduleFormKeys.set(selectionKey, uniqueKey);
        }

        // do not edit acronyms and names for modules that are not user generated
        const isEditable = module.isUserGenerated;
        // status, ects and grade come from FlexNow and would be overwritten on the
        // next sync anyway, so don't let the user edit them here
        const isFlexNowImported = !!module.flexNowImported;

        const moduleFormGroup = this.fb.group({
          acronym: [
            { value: module.acronym, disabled: !isEditable },
            Validators.required,
          ],
          name: [
            { value: module.name, disabled: !isEditable },
            Validators.required,
          ],
          notes: [module.notes],
          status: [
            { value: module.status, disabled: isFlexNowImported },
            Validators.required,
          ],
          ects: [
            {
              value: module.ects !== undefined ? module.ects : '',
              disabled: isFlexNowImported,
            },
            [Validators.required, Validators.min(0), Validators.max(30)],
          ],
          grade: [
            { value: module.grade.toString(), disabled: isFlexNowImported },
            [],
          ],
          semester: module.semester,
          mgId: [module.mgId ? module.mgId : ''],
          isUserGenerated: [module.isUserGenerated], // retain property
          _id: [module._id], // retain property
          flexNowImported: [module.flexNowImported], // retain property
        });

        this.stepperForm.addControl(uniqueKey, moduleFormGroup);
        this.setupAcronymSubscription(
          moduleFormGroup.get('acronym') as FormControl,
          module.acronym,
        );
        this.setupStatusChanges(moduleFormGroup, isFlexNowImported);
        this.clearMgIdIfAmbiguous(moduleFormGroup, module.acronym);
      });
    } else {
      this.formData = false;
    }
  }

  // to remove the suggestions on subform change
  private setupAcronymSubscription(
    control: FormControl,
    initialAcronym: string,
  ): void {
    this.subscriptions.add(
      control.valueChanges.subscribe((value) => {
        if (value !== initialAcronym) {
          this.showNoEditHint = false;
          this.showNoGradeHint = false;
        }
      }),
    );
  }

  // a module's stored mgId may have been prefilled based on the current MHB alone
  // being unambiguous (e.g. a prior FlexNow import), but the wizard now also
  // considers historical MHB versions and can find more than one still-valid
  // candidate - in that case the prefill would be misleading, so clear it back to
  // "not chosen" and let the wizard/user decide instead
  private clearMgIdIfAmbiguous(moduleFormGroup: FormGroup, acronym: string): void {
    this.subscriptions.add(
      combineLatest([
        this.getPossibleMgIdsForAcronym(acronym),
        this.structuredModuleGroups$,
      ])
        .pipe(take(1))
        .subscribe(([possibleMgIds, structuredModuleGroups]) => {
          const candidateMgIds = possibleMgIds.filter((id) =>
            structuredModuleGroups.some((group) => group.mgId === id),
          );

          const mgIdControl = moduleFormGroup.get('mgId');
          const currentValue = mgIdControl?.value;
          if (
            candidateMgIds.length !== 1 &&
            currentValue &&
            currentValue !== 'init'
          ) {
            mgIdControl?.setValue('init');
          }
        }),
    );
  }

  setModuleCompletion(module: PathModule, completed: boolean): void {
    const key = this.getModuleKey(module);

    if (!key) return;

    if (completed) {
      this.selectedModules.add(key);
    } else {
      this.selectedModules.delete(key);
    }

    this.emptySelect = this.selectedModules.size === 0;
  }

  isModuleSelected(module: PathModule): boolean {
    const key = this.getModuleKey(module);
    if (!key) return false;
    return this.selectedModules.has(key);
  }

  getSelectedModules(): PathModule[] {
    return this.missingModules.filter((module) => {
      const key = this.getModuleKey(module);
      return key && this.selectedModules.has(key);
    });
  }

  private setupStatusChanges(
    formGroup: FormGroup,
    isFlexNowImported: boolean,
  ): void {
    const statusControl = formGroup.get('status') as FormControl;
    const gradeControl = formGroup.get('grade') as FormControl;

    // handle comma input
    this.subscriptions.add(
      gradeControl.valueChanges.subscribe((value) => {
        if (value && typeof value === 'string' && value.includes(',')) {
          const normalizedValue = value.replace(',', '.');
          gradeControl.setValue(normalizedValue, { emitEvent: false });
        }
      }),
    );

    statusControl.valueChanges.subscribe((status) => {
      this.showNoEditHint = false;
      this.showNoGradeHint = false;

      switch (status) {
        case 'taken':
          gradeControl.setValue(0);
          gradeControl.disable();
          this.showNoGradeHint = true;
          break;
        case 'passed':
          gradeControl.setValidators([Validators.min(1), Validators.max(4)]);
          if (!isFlexNowImported) {
            gradeControl.enable();
          }
          break;
        case 'failed':
          gradeControl.setValue(5);
          gradeControl.setValidators([Validators.min(5), Validators.max(5)]);
          gradeControl.disable();
          this.showNoEditHint = true;
          break;
        default:
          gradeControl.setValue(null);
          gradeControl.clearValidators();
          if (!isFlexNowImported) {
            gradeControl.enable();
          }
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
    const selectionKey = this.getModuleKey(module);
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
        const selectionKey = this.getModuleKey(module);
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
