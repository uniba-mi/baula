import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getModuleByAcronym,
  getModules,
  getStructuredModuleGroups,
} from 'src/app/selectors/module-overview.selectors';
import {
  Exam,
  ExamAttempt,
  PathModule,
} from '../../../../../../interfaces/study-path';
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { Consent, User } from '../../../../../../interfaces/user';
import {
  Observable,
  Subject,
  firstValueFrom,
  map,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import {
  getLastConsentByType,
  getSemesterList,
} from 'src/app/selectors/user.selectors';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { Module } from '../../../../../../interfaces/module';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { UserGeneratedModuleTemplate } from '../../../../../../interfaces/user-generated-module';
import { Semester } from '../../../../../../interfaces/semester';
import {
  ModulePlanningActions,
  UserGeneratedModuleActions,
} from 'src/app/actions/study-planning.actions';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import {
  getSemesterPlansOfActiveStudyPlan,
  getStudyPlans,
} from 'src/app/selectors/study-planning.selectors';
import { SemesterPlan } from '../../../../../../interfaces/semester-plan';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';

@Component({
  selector: 'app-student-upload',
  templateUrl: './student-upload.component.html',
  styleUrls: ['./student-upload.component.scss'],
  standalone: false,
})
export class StudentUploadComponent {
  @Input() user: User;
  private unsubscribe$ = new Subject<void>();
  modules$: Observable<Module[]>;
  modules: Module[] = [];
  closeMode: string;
  flexnowApiConsent$: Observable<Consent | null>;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  studyPlans$: Observable<StudyPlan[]>;
  semesters$: Observable<Semester[]>;

  constructor(
    private store: Store,
    private transformationService: TransformationService,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private flexnowService: FlexnowService,
  ) {
    this.flexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);
  }

  ngOnInit(): void {
    this.modules$ = this.store.select(getModules);
    this.modules$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((modules: Module[]) => (this.modules = modules));

    this.semesters$ = this.store.select(getSemesterList);
  }

  openDeleteStudyPathDialog() {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Gesamte Studienhistorie löschen?',
      actionType: 'delete',
      warningMessage:
        'Die Daten werden unwiederbringlich gelöscht, eine Wiederherstellung ist nicht möglich.',
      confirmationItem:
        'deinen gesamten Studienverlauf mit Belegungen und Noten',
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.deleteStudyPath();
      },
    };

    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  importCompleteFlexNowData() {
    this.flexnowService.triggerFlexNowDataLoading(
      'create-user',
    );
  }

  openConsentWithdrawalDialog() {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Einwilligung widerrufen?',
      actionType: 'delete',
      confirmationItem: 'deine Einwilligung',
      confirmButtonLabel: 'Bestätigen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.deleteStudyPath();
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  deleteStudyPath() {
    this.store.dispatch(StudyPathActions.deleteStudyPath());

    // remove modules flagged with flexNowImported from all study plans
    this.store
      .select(getStudyPlans)
      .pipe(
        take(1),
        tap((studyPlans) => {
          studyPlans.forEach((studyPlan) => {
            studyPlan.semesterPlans.forEach((semesterPlan) => {
              const modulesToDelete = semesterPlan.userGeneratedModules
                .filter((module) => module.flexNowImported)
                .map((module) => module._id);

              if (modulesToDelete.length > 0) {
                this.store.dispatch(
                  UserGeneratedModuleActions.deleteUserGeneratedModules({
                    studyPlanId: studyPlan._id,
                    semesterPlanId: semesterPlan._id,
                    moduleIds: modulesToDelete,
                  }),
                );
              }
            });
          });
        }),
      )
      .subscribe();

    this.store.dispatch(
      UserActions.addConsent({
        ctype: 'flexnow-api',
        hasConfirmed: false,
        hasResponded: true,
        timestamp: new Date(),
      }),
    );
    this.store.dispatch(
      UserActions.addConsent({
        ctype: 'upload-exam-data',
        hasConfirmed: false,
        hasResponded: true,
        timestamp: new Date(),
      }),
    );
    this.store.dispatch(
      UserActions.addConsent({
        ctype: 'include-grades',
        hasConfirmed: false,
        hasResponded: true,
        timestamp: new Date(),
      }),
    );
    this.dialog.closeAll();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
