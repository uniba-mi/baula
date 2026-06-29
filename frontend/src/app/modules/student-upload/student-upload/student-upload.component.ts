import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getModules,
  getStructuredModuleGroups,
} from 'src/app/selectors/module-overview.selectors';
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import { MatDialog } from '@angular/material/dialog';
import { Consent, User } from '../../../../../../interfaces/user';
import { forkJoin, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import {
  getLastConsentByType,
  getSemesterList,
  getUser,
} from 'src/app/selectors/user.selectors';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { Module } from '../../../../../../interfaces/module';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { Semester } from '../../../../../../interfaces/semester';
import { UserGeneratedModuleActions } from 'src/app/actions/study-planning.actions';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';

@Component({
  selector: 'app-student-upload',
  templateUrl: './student-upload.component.html',
  styleUrls: ['./student-upload.component.scss'],
  standalone: false,
})
export class StudentUploadComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private flexnowService = inject(FlexnowService);

  @Input() user: User;
  private unsubscribe$ = new Subject<void>();
  modules$: Observable<Module[]>;
  modules: Module[] = [];
  closeMode: string;
  importMetadataConsent$: Observable<Consent | null>;
  importStudypathConsent$: Observable<Consent | null>;
  importGradeConsent$: Observable<Consent | null>;
  integrateFnDataConsent$: Observable<Consent | null>;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  studyPlans$: Observable<StudyPlan[]>;
  semesters$: Observable<Semester[]>;
  flexNowAvailable$: Observable<boolean>;

  constructor() {
    this.integrateFnDataConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.importMetadataConsent$ = this.store.select(
      getLastConsentByType('upload-meta-data'),
    );
    this.importStudypathConsent$ = this.store.select(
      getLastConsentByType('upload-exam-data'),
    );
    this.importGradeConsent$ = this.store.select(
      getLastConsentByType('include-grades'),
    );
    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);
  }

  ngOnInit(): void {
    this.flexNowAvailable$ = this.store.select(getUser).pipe(
      map(user => this.flexnowService.flexNowImportEnabled(user))
    )
    this.modules$ = this.store.select(getModules);
    this.modules$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((modules: Module[]) => (this.modules = modules));

    this.semesters$ = this.store.select(getSemesterList);
  }

  checkFlexNowAvailability(user: User): boolean {
    return this.flexnowService.flexNowImportEnabled(user);
  }

  importCompleteFlexNowData() {
    this.flexnowService.triggerFlexNowDataLoading('update-user');
  }

  openConsentWithdrawalDialog() {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Einwilligung widerrufen?',
      actionType: 'delete',
      warningMessage:
        'Die Daten werden unwiederbringlich gelöscht, eine Wiederherstellung ist nicht möglich.',
      confirmationItem:
        'deine Einwilligung inklusive deines gesamten Studienverlauf mit Belegungen und Noten',
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
        ctype: 'upload-meta-data',
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

  openConsentDialog(): Observable<{
    flexNowImportConfirmed: boolean;
    metadataConfirmed: boolean;
    studypathConfirmed: boolean;
    gradesConfirmed: boolean;
  }> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
        onlyMetaData: false,
        onlyStudypath: false,
      },
    });

    return dialogRef.afterClosed().pipe(map((result) => result));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
