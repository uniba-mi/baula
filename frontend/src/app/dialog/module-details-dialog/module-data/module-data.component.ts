import { Observable } from 'rxjs';
import { User } from '../../../../../../interfaces/user';
import { Semester } from '../../../../../../interfaces/semester';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { of, Subject } from 'rxjs';
import { AlertType } from 'src/app/shared/classes/alert';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { getUser, getUserStudyprogrammes } from 'src/app/selectors/user.selectors';
import {
  getSemesterPlanSemesterByStudyPlanId,
  getActiveStudyPlan,
  getFilteredStudyPlans,
  getPlannedSemestersForModule,
  getActiveSemester,
} from 'src/app/selectors/study-planning.selectors';
import {
  getAllModules,
  getModuleClasses,
  getSelectedModule,
  getStructuredModuleGroups,
} from 'src/app/selectors/module-overview.selectors';
import { Router } from '@angular/router';
import { ModService } from 'src/app/shared/services/module.service';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';
import { map, take, takeUntil, takeWhile } from 'rxjs/operators';
import { StudyPlanActions } from 'src/app/actions/study-planning.actions';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnknownModulesActions } from 'src/app/actions/module-overview.actions';
import { ModuleCourse } from '../../../../../../interfaces/module-course';
import { SemesterPlan } from '../../../../../../interfaces/semester-plan';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { MatDialogRef } from '@angular/material/dialog';
import { Module } from '../../../../../../interfaces/module';
import { Exam } from '../../../../../../interfaces/exam';
import { DialogComponent } from '../../dialog.component';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { StudyPlanService } from 'src/app/shared/services/study-plan.service';

@Component({
  selector: 'app-module-data',
  templateUrl: './module-data.component.html',
  styleUrl: './module-data.component.scss',
  standalone: false,
})
export class ModuleDataComponent implements OnInit, OnDestroy {

  @Input() selectedModule: Module;
  @Input() dialog: MatDialogRef<DialogComponent>;

  form: FormGroup;

  expandedClasses: boolean = false;
  expandedExams: boolean = false;
  expandedModuleContent: boolean = false;
  expandedExamDescription: boolean = false;
  expandedModuleGoals: boolean = false;
  userStudiesLA: boolean = false;

  semesters$: Observable<Semester[]>;
  user$: Observable<User>;
  studyPlans$: Observable<StudyPlan[]>;
  selectedSemesterPlanId: string;
  selectedStudyPlan: StudyPlan;

  moduleClasses: ModuleCourse[];
  semesterPlanSemester$: Observable<string | undefined>;
  semesterPlanSemester: string | undefined;
  semesterPlan$: Observable<SemesterPlan | undefined>;
  allModules: string[] | undefined;

  warningMessage: string;
  moduleClasses$: Observable<ModuleCourse[] | undefined>;
  moduleGroups$: Observable<ExtendedModuleGroup[] | undefined>;
  activeStudyPlan$: Observable<StudyPlan | undefined>;
  activeStudyPlan: StudyPlan | undefined;
  activeSemester: string | undefined;
  activeSemesterId: string;
  plannedSemesters$: Observable<string[] | null>;
  activeRoute: string;

  private destroy$ = new Subject<void>();

  //recommendations
  programId: string; // CURRENT assumption: first study programme
  avgSemester: number;
  sucSemester: number;
  displayPriorModuleWarning: boolean;
  priorModuleWarningMessage: string;

  constructor(
    private store: Store<State>,
    private snackbar: SnackbarService,
    private modService: ModService,
    private planningValidation: PlanningValidationService,
    private router: Router,
    private studyPlanService: StudyPlanService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      selectedStudyPlanId: [null],
      selectedSemesterPlanId: [null]
    });
  }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user.sps) {
        for (let sp of user.sps) {
          // assumption that teacher education sps start with LA and if EWS part is referenced ends with EWS
          if (sp.spId.startsWith('LA') && sp.spId.endsWith('EWS')) {
            this.userStudiesLA = true;
          }
        }
        // Currently, only the first programme is used
        this.programId = user.sps[0].spId;
      }
    });

    // study plans without past semesters
    this.studyPlans$ = this.store.select(getFilteredStudyPlans);
    this.moduleClasses$ = this.store.select(getModuleClasses);
    this.moduleGroups$ = this.store.select(getStructuredModuleGroups);

    // find active study plan
    this.activeStudyPlan$ = this.store.select(getActiveStudyPlan);

    // retrieve and set active plan
    this.activeStudyPlan$
      .pipe(takeWhile((activePlan) => !!activePlan))
      .subscribe((activePlan) => {
        if (activePlan) {
          this.activeStudyPlan = activePlan;
          this.selectedStudyPlan = activePlan;
          this.form.patchValue({
            selectedStudyPlanId: activePlan._id,
          });

          // display semesters where module has already been planned to user
          this.getPlannedSemesters();
        }
      });

    // set current semester for highlighting later
    this.store.select(getActiveSemester).pipe(take(1)).subscribe((semester) => {
      this.activeSemester = semester;
    });

    this.store.select(getAllModules).pipe(takeUntil(this.destroy$)).subscribe((modules) => {
      this.allModules = modules.map(module => module.acronym);
    });

    // initial highlighting
    this.checkConstraints();
  }

  ngAfterViewInit(): void {
    this.setUpClickableAcronyms();
    this.applyStylesToAcronyms(); // otherwise styles won't be applied
  }

  updateHighlightingOptions() {
    if (this.selectedStudyPlan && this.selectedStudyPlan.semesterPlans) {
      const matchingPlan = this.selectedStudyPlan.semesterPlans.find(plan => plan.semester === this.activeSemester);
      if (matchingPlan) {

        // for highlighting option in dropdown
        this.activeSemesterId = matchingPlan._id;
      }
    }
  }

  // for notification when modules might have already been planned in active plan
  getPlannedSemesters(): void {
    this.plannedSemesters$ = this.store.select(
      getPlannedSemestersForModule(this.selectedModule.acronym)
    );
  }

  // set up clickable acronyms after the view has initialized
  private setUpClickableAcronyms(): void {
    const priorKnowledgeElements = document.querySelectorAll('.module-information-priorKnowledge');
    if (priorKnowledgeElements && priorKnowledgeElements.length > 0) {
      for (let i = 0; i < priorKnowledgeElements.length; i++) {
        priorKnowledgeElements[i].addEventListener('click', (event) => this.handleAcronymClick(event));
      }
    }
  }

  // handle clicks on acronyms
  handleAcronymClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-acronym')) {
      const acronym = target.innerText.trim();
      this.dialog.close('next');
      this.selectModuleWithAcronym(acronym);
    }
  }

  // highlight acronyms
  highlightAcronyms(acronyms: string[], text: string): string {
    if (!acronyms || acronyms.length === 0 || !text) {
      return text; // Return original text if no acronyms or text is empty
    }
    
    acronyms.forEach(acronym => {
      const regex = new RegExp(`\\b${acronym}\\b`, 'g');
      text = text.replace(regex, `<span class="clickable-acronym" role="button" tabindex="0">${acronym}</span>`);
    });
    return text;
  }

  // styles application after view init (doesn't apply otherwise)
  private applyStylesToAcronyms(): void {
    const acronyms = document.querySelectorAll('.clickable-acronym');
    acronyms.forEach(acronym => {
      (acronym as HTMLElement).style.padding = '0.25rem';
      (acronym as HTMLElement).style.borderRadius = '10px';
      (acronym as HTMLElement).style.border = '1px solid #ddf3f5';
      (acronym as HTMLElement).style.backgroundColor = '#f3feff';

      // check if module is unknown and load it
      const acronymText = acronym.textContent;
      if (acronymText && this.allModules && !this.allModules.includes(acronymText)) {
        this.store.dispatch(UnknownModulesActions.loadUnknownModule({ acronym: acronymText }));
      }
    });
  }

  getFullModuleGroup(mgId: string | undefined): Observable<string | null> {
    if (!mgId) {
      return of(null);
    }
    return this.moduleGroups$.pipe(
      map(groups => {
        const group = groups?.find(g => g.mgId === mgId);
        if (group) {
          return String(group.name);
        } else {
          return null;
        }
      })
    );
  }

  // select prior modules
  selectModuleWithAcronym(moduleAcronym: string) {
    // if only string was passed, search module information in store by string match
    this.modService.selectModuleFromAcronymString(moduleAcronym);

    // get selectedModule from state
    this.store.select(getSelectedModule).subscribe((module) => {
      if (module) {
        this.selectedModule = module;
      }
    });
  }

  // check if module is offered in the selected study plan semester
  checkConstraints() {

    const selectedStudyPlanId = this.form.get('selectedStudyPlanId')?.value;
    const selectedSemesterPlanId = this.form.get('selectedSemesterPlanId')?.value;

    // set selected study plan
    this.studyPlans$.pipe(take(1)).subscribe((studyPlans) => {
      const selectedStudyPlan = studyPlans.find(plan => plan._id === selectedStudyPlanId);
      if (selectedStudyPlan) {
        this.selectedStudyPlan = selectedStudyPlan;
      }
    });

    // update highlighting in dropdown
    this.updateHighlightingOptions();

    this.store.dispatch(
      StudyPlanActions.selectStudyPlan({ studyPlanId: selectedStudyPlanId })
    );

    // get selected semester plan semester
    this.semesterPlanSemester$ = this.store.select(
      getSemesterPlanSemesterByStudyPlanId(
        selectedStudyPlanId,
        selectedSemesterPlanId
      )
    );
    this.semesterPlanSemester$.subscribe(
      (semester) => (this.semesterPlanSemester = semester)
    );

    // if both study plan and semester are selected
    if (selectedSemesterPlanId && selectedStudyPlanId) {
      // display warnings if modules are not offered in the selected semester

      if (this.semesterPlanSemester != undefined) {
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
      } else {
        return;
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
  }

  unsetSelectedModule() {
    this.modService.unsetSelectedModule();
  }

  toggleContent(module: Module, mode: string) {
    const element = document.getElementById(`${module.mId}-content`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedModuleContent = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedModuleContent = false;
      }
    }
  }

  addModuleToPlan(selectedModule: Module): void {
    const selectedStudyPlanId = this.form.get('selectedStudyPlanId')?.value;
    const selectedSemesterPlanId = this.form.get('selectedSemesterPlanId')?.value;
    if (selectedStudyPlanId && selectedSemesterPlanId) {
      this.studyPlanService.addModuleToPlan(selectedModule, selectedSemesterPlanId, selectedStudyPlanId);
    }
  }

  toggleExamDescription(exam: Exam, mode: string) {
    const element = document.getElementById(`${exam.meId}-description`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedExamDescription = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedExamDescription = false;
      }
    }
  }

  toggleModuleGoals(module: Module, mode: string) {
    const element = document.getElementById(`${module.mId}-goals`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedModuleGoals = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedModuleGoals = false;
      }
    }
  }

  findCourses(module: string, types?: string) {
    this.router.navigate(['app', 'semester'], {
      queryParams: {
        module,
        types,
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
