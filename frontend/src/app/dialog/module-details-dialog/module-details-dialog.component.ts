import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Module } from '../../../../../interfaces/module';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../dialog.component';
import { getModuleFeedback, getUserStudyPath, isModuleInStudyPath } from 'src/app/selectors/user.selectors';
import { ModuleFeedback } from '../../../../../interfaces/user';
import { Observable, Subject, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatTabGroup } from '@angular/material/tabs';
import { getAllModules } from 'src/app/selectors/module-overview.selectors';
import { StudyPath } from '../../../../../interfaces/study-path';
import { SemesterPlan } from '../../../../../interfaces/semester-plan';
import { getSemesterPlansOfActiveStudyPlan } from 'src/app/selectors/study-planning.selectors';
import { ModuleDetailsDependencyVisNodeSchema } from '../../../../../interfaces/visualization-data';
import { AnalyticsService } from 'src/app/shared/services/analytics.service';

@Component({
  selector: 'app-module-details-dialog',
  templateUrl: './module-details-dialog.component.html',
  styleUrls: ['./module-details-dialog.component.scss'],
  standalone: false,
})
export class ModuleDetailsDialogComponent implements OnInit, OnDestroy {
  @Input() selectedModule: Module;
  @Input() dialog: MatDialogRef<DialogComponent>;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  private destroy$ = new Subject<void>();

  feedback$!: Observable<ModuleFeedback | null>;
  moduleInStudyPath$: Observable<Boolean>;
  studyPath$: Observable<StudyPath>;
  semesterPlans$: Observable<SemesterPlan[] | undefined>;
  activeTab!: string;

  // variables for visualization
  focusModule: ModuleDetailsDependencyVisNodeSchema;
  priorModules: ModuleDetailsDependencyVisNodeSchema[] = [];
  extractedPriorModules: ModuleDetailsDependencyVisNodeSchema[] = [];
  advancedModules: ModuleDetailsDependencyVisNodeSchema[] = [];
  allModules: Module[] = []

  // tracking time
  private creationTime: number;

  constructor(private store: Store, private analytics: AnalyticsService) { }

  ngOnInit(): void {
    this.feedback$ = this.store.select(getModuleFeedback(this.selectedModule.acronym));
    this.moduleInStudyPath$ = this.store.select(isModuleInStudyPath(this.selectedModule.acronym));
    this.studyPath$ = this.store.select(getUserStudyPath);
    this.semesterPlans$ = this.store.select(getSemesterPlansOfActiveStudyPlan);

    // retrieve activeTab from the dialog data
    const dialogData = this.dialog._containerInstance._config.data;
    this.activeTab = dialogData?.activeTab || 'details';

    this.store.select(getAllModules).pipe(take(1)).subscribe((modules) => {
      const prevModules = this.selectedModule.prevModules as Module[];
      const extractedPriorModules = this.selectedModule.extractedPrevModules;
      this.allModules = modules;
      for (let module of modules) {
        // check if module is focus module
        if (module.acronym === this.selectedModule.acronym) {
          this.focusModule = {
            ...module,
            id: module.acronym,
            type: module.type === 'Pflichtmodul' ? 'Pflichtmodul' : 'Wahlmodul',
            isInStudentsMhb: module.isOld ? false : true,
            advancedModule: {
              isAdvancedModule: false,
            }
          };
          // check if module is prior module
        } else if (prevModules.some((prevModule) => prevModule.acronym === module.acronym)) {
          this.priorModules.push({
            ...module,
            id: module.acronym,
            type: module.type === 'Pflichtmodul' ? 'Pflichtmodul' : 'Wahlmodul',
            isInStudentsMhb: module.isOld ? false : true,
            advancedModule: {
              isAdvancedModule: false,
            }
          });
          // check if module is advanced module
        } else if (module.allPriorModules.some((priorModule) => priorModule === this.selectedModule.acronym)) {
          this.advancedModules.push({
            ...module,
            id: module.acronym,
            type: module.type === 'Pflichtmodul' ? 'Pflichtmodul' : 'Wahlmodul',
            isInStudentsMhb: module.isOld ? false : true,
            advancedModule: {
              isAdvancedModule: true,
              hasAdditionalPriorModules: module.allPriorModules.length > 1
            }
          });
        } else if (extractedPriorModules.includes(module.acronym)) {
          this.extractedPriorModules.push({
            ...module,
            id: module.acronym,
            type: module.type === 'Pflichtmodul' ? 'Pflichtmodul' : 'Wahlmodul',
            isInStudentsMhb: module.isOld ? false : true,
            advancedModule: {
              isAdvancedModule: false,
            }
          });
        }
      }
      // TODO this currently leads to only show modules that are in the module handbook
    });

    // set active tab
    setTimeout(() => {
      const tabIndex = this.activeTab === 'feedback' ? 2 : 0;
      this.tabGroup.selectedIndex = tabIndex;
    });
  }

  ngOnDestroy() {

    // tracking
    const destroyTime = Date.now();
    const lifetime = destroyTime - this.creationTime;

    this.analytics.trackEvent('DialogLifecycle', {
      action: 'DialogLifeTime',
      dialog: `Module Details Dialog ${this.selectedModule.acronym}`,
      lifetime: lifetime
    });

    // destroying components
    this.destroy$.next();
    this.destroy$.complete();
  }

}


