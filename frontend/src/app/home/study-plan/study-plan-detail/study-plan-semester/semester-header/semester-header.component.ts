import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Module } from '../../../../../../../../interfaces/module';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  map,
  Observable,
  Subject,
  take,
  takeWhile,
} from 'rxjs';
import { getAllDistinctModules } from 'src/app/selectors/module-overview.selectors';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {
  SemesterPlan,
  MetaSemester,
} from '../../../../../../../../interfaces/semester-plan';
import { Semester } from '../../../../../../../../interfaces/semester';
import {
  SemesterPlanActions,
  UserGeneratedModuleActions,
} from 'src/app/actions/study-planning.actions';
import { UserGeneratedModuleTemplate } from '../../../../../../../../interfaces/user-generated-module';
import { StudyPathActions } from 'src/app/actions/user.actions';
import {
  PathModule,
  SemesterStudyPath,
} from '../../../../../../../../interfaces/study-path';
import {
  getActiveStudyPlanId,
  getSelectedStudyPlanId,
} from 'src/app/selectors/study-planning.selectors';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';
import { getLastConsentByType, getUser, getUserType } from 'src/app/selectors/user.selectors';
import { Consent } from '../../../../../../../../interfaces/user';
import { StudyPlanService } from 'src/app/shared/services/study-plan.service';

@Component({
  selector: 'app-semester-header',
  standalone: false,
  templateUrl: './semester-header.component.html',
  styleUrl: './semester-header.component.scss',
})
export class SemesterHeaderComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private studyPlanService = inject(StudyPlanService);
  private flexnowService = inject(FlexnowService);

  @Input() metaSemester: MetaSemester;
  @Input() semesterNumber: number;
  @Input() studyPlanId: string;
  @Input() semesterPlan: SemesterPlan;
  @Input() semesterStudyPath$: Observable<SemesterStudyPath[]>;
  @Input() isEligibleForFinish: boolean;
  @Input() isExpanded: boolean;
  @Output() toggleExpanded = new EventEmitter<string>(); // emits semester name
  @Output() finishSemester = new EventEmitter<SemesterPlan>();

  private unsubscribe$ = new Subject<void>();

  closeMode: string;
  activeSemesters$: Observable<string[]>;
  semesters$: Observable<Semester[]>;
  modules$: Observable<Module[]>;
  modules: Module[];
  pathModule: PathModule | undefined;
  showFinishSemesterHint: boolean = false;
  lastFlexnowApiConsent$: Observable<Consent | null>;
  lastFlexNowStudypathConsent$: Observable<Consent | null>;
  flexNowImportAvailabe$: Observable<boolean>;

  constructor() {
    this.lastFlexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.lastFlexNowStudypathConsent$ = this.store.select(
      getLastConsentByType('upload-exam-data'),
    );
  }

  ngOnInit() {
    // as input for addModuleDialog
    this.modules$ = this.store.select(getAllDistinctModules);
    this.modules$
      .pipe(takeWhile((mod) => mod.length === 0, true))
      .subscribe((modules) => {
        this.modules = modules;
      });

    this.flexNowImportAvailabe$ = this.store.select(getUser).pipe(
      map((user) => {
        return this.flexnowService.flexNowImportEnabled(user)
      })
    )

    combineLatest([
      this.store.select(getActiveStudyPlanId),
      this.store.select(getSelectedStudyPlanId),
    ]).subscribe(([activeStudyPlanId, selectedStudyPlanId]) => {
      if (activeStudyPlanId && selectedStudyPlanId) {
        this.initializeFinishSemesterLogic(
          activeStudyPlanId,
          selectedStudyPlanId,
        );
      }
    });
  }

  initializeFinishSemesterLogic(
    activeStudyPlanId: string,
    currentStudyPlanId: string,
  ): void {
    if (
      this.checkForIsPastSemesterMismatches(this.semesterPlan) &&
      activeStudyPlanId === currentStudyPlanId
    ) {
      this.showFinishSemesterHint = true;
    } else {
      this.showFinishSemesterHint = false;
    }
  }

  // generates new semester from semesterPlan.semester property and compares with isPastSemester property of plan
  checkForIsPastSemesterMismatches(semesterPlan: SemesterPlan): boolean {
    const semester = new Semester(semesterPlan.semester);
    const isPast = semester.isPastSemester();

    return isPast !== semesterPlan.isPastSemester;
  }

  onToggleExpand() {
    this.toggleExpanded.emit(this.metaSemester.semester);
  }

  async syncWithFlexNow() {
    this.flexnowService.triggerFlexNowDataLoading(
      'update-studypath',
      this.metaSemester.semester,
    );
  }

  isFutureSemester(semesterName: string): boolean {
    const semester = new Semester(semesterName);
    return semester.isFutureSemester();
  }

  openAddPathModuleDialog(semester: string, pathModule?: PathModule) {
    // either exists (update) or create new with the following details
    const pathModuleData: PathModule = pathModule || {
      acronym: '',
      name: '',
      ects: 0,
      grade: 0,
      mgId: undefined,
      status: 'open',
      semester: semester,
      isUserGenerated: true,
      flexNowImported: false,
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: pathModule ? 'Leistung bearbeiten' : 'Leistung hinzufügen',
        dialogContentId: 'edit-path-module-dialog',
        pathModule: pathModuleData,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((pathModule) => {
        if (pathModule) {
          const newPathModule = {
            ...pathModule,
            semester: pathModule.semester ? pathModule.semester : semester,
            grade: Number(pathModule.grade),
            ects: Number(pathModule.ects),
            mgId: pathModule.mgId ? pathModule.mgId : 'init',
            isUserGenerated: true,
            flexNowImported: pathModule.flexNowImported
              ? pathModule.flexNowImported
              : false,
          };

          this.store.dispatch(
            StudyPathActions.updateModuleInStudyPath({ module: newPathModule }),
          );
        }
      });
  }

  openAimedEctsDialog(event: any, semesterPlanId: string, aimedEcts: number) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Zu erreichende ECTS bearbeiten',
        dialogContentId: 'update-aimed-ects-dialog',
        aimedEcts: aimedEcts,
      },
    });

    dialogRef.afterClosed().subscribe((aimedEcts) => {
      this.store
        .select(getCloseDialogMode)
        .subscribe((mode) => (this.closeMode = mode));
      if (this.closeMode === 'data') {
        this.updateAimedEcts(this.studyPlanId, semesterPlanId, aimedEcts);
      } else {
        return;
      }
    });
  }

  updateAimedEcts(
    studyPlanId: string,
    semesterPlanId: string,
    aimedEcts: number,
  ) {
    this.store.dispatch(
      SemesterPlanActions.updateAimedEcts({
        studyPlanId,
        semesterPlanId,
        aimedEcts,
      }),
    );
    this.dialog.closeAll();
  }

  openAddModuleDialog(ppId: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Modul hinzufügen',
        dialogContentId: 'add-module-dialog',
        modules: this.modules,
        semesterPlanId: ppId,
      },
      maxWidth: '80vh',
      width: '80vh',
      maxHeight: '80vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.studyPlanService.addModuleToPlan(
          result.module,
          ppId,
          this.studyPlanId,
        );
      }
    });
  }

  openUserGeneratedModuleDialog(ppId: string) {
    // add new user generated module
    const newModule: UserGeneratedModuleTemplate = {
      name: '',
      ects: 0,
      notes: '',
      mgId: undefined,
      acronym: '',
      status: 'open',
      flexNowImported: false,
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Platzhalter anlegen',
        dialogContentId: 'add-user-generated-module-dialog',
        module: newModule,
      },
    });

    dialogRef.afterClosed().subscribe((module) => {
      if (module) {
        const inputModule: UserGeneratedModuleTemplate = {
          name: module.name,
          ects: Number(module.ects),
          notes: module.notes,
          mgId: undefined,
          acronym: module.acronym,
          status: 'open',
          flexNowImported: false,
        };
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          this.store.dispatch(
            UserGeneratedModuleActions.createUserGeneratedModule({
              studyPlanId: this.studyPlanId,
              semesterPlanId: this.semesterPlan._id,
              module: inputModule,
            }),
          );
        }
      }
    });
  }

  onFinishSemester(event: any): void {
    event.stopPropagation();
    if (this.isEligibleForFinish) {
      this.finishSemester.emit(this.semesterPlan);
    } else {
      return;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
