import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Semester } from '../../../../interfaces/semester';
import { User } from '../../../../interfaces/user';
import {
  StudyPlanActions,
  TimetableActions,
} from '../actions/study-planning.actions';
import { UserActions } from '../actions/user.actions';
import { DialogComponent } from '../dialog/dialog.component';
import { getUser } from '../selectors/user.selectors';
import {
  ModuleHandbookActions,
  selectStudyProgramme,
} from '../actions/module-overview.actions';
import {
  getActiveStudyPlanId,
  getStudyPlans,
} from '../selectors/study-planning.selectors';
import { filter, take, takeWhile, tap } from 'rxjs/operators';
import { StudyPlan } from '../../../../interfaces/study-plan';
import { UserUpdateService } from '../shared/services/user-update.service';
import { getModules } from '../selectors/module-overview.selectors';
import { RestService } from '../rest.service';
import { SemesterPlanTemplate } from '../../../../interfaces/semester-plan';
import { IndexedDbService } from '../shared/services/indexed-db.service';
import { Router } from '@angular/router';
import { SurveyComponent } from '../modules/long-term-evaluation/survey/survey.component';
import { LongTermEvaluation } from '../../../../interfaces/long-term-evaluation';
import { StudyPlanService } from '../shared/services/study-plan.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  semesters$: Observable<Semester[]>;
  user$: Observable<User>;
  user: User;
  activeId: string;
  userSubscription: Subscription;
  isFirstSemesterStudent: boolean = false;
  studyPlanTemplate$: Observable<StudyPlan | undefined>;
  templatesAvailable: boolean = false;
  notificationActive: boolean = false;
  privacyDialogActive: boolean = true;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private studyPlanService: StudyPlanService,
    private userUpdateService: UserUpdateService,
    private api: RestService,
    private indexedDB: IndexedDbService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.userSubscription = this.user$.subscribe((user) => {
      this.handleUserSession(user);
    });
    // initial load of courses -> trigger load into indexedDb
    this.indexedDB
      .searchCourses(new Semester().name, undefined)
      .then(() => console.info('Lehrveranstaltungen wurden geladen!'))
      .catch((error) =>
        console.error(
          'Beim Laden der Lehrveranstaltungen ist ein Fehler aufgetreten! ' +
            error
        )
      );
  }

  handleUserSession(user: User) {
    // check for default user
    if (user._id !== '') {
      if (user.sps && user.sps.length !== 0) {
        this.user = user;
        this.loadUserData(user);
        const notificationEnabled = user.hints?.find(
          (hint) => hint.key === 'notification-dialog' && !hint.hasConfirmed
        );
        if (notificationEnabled && this.notificationActive && !user.roles.includes('demo')) {
          this.openNotificationDialog();
        }
        if (this.router.url.endsWith('app')) {
          this.router.navigate(['app', 'dashboard']);
        }
      } else {
        this.user = user;
        this.openUserDialog(user);
      }
    } else {
      this.store.dispatch(UserActions.checkUserData());
    }
  }

  loadUserData(user: User) {
    // check for demo user and open welcome dialog with information about demo user
    if (user.roles.includes('demo')) {
      this.dialog.open(DialogComponent, {
        data: {
          dialogContentId: 'demo-user-dialog',
        },
        minWidth: '50vw',
      });
    }

    // load modulhandbook
    if (user.sps) {
      this.store.dispatch(
        ModuleHandbookActions.loadModuleHandbook({
          id: user.sps[0].mhbId,
          version: user.sps[0].mhbVersion,
        })
      );
    }

    // update user settings like dashboardsetting and hints
    this.userUpdateService
      .updateUserSettings(user)
      .pipe(take(1))
      .subscribe((updatedUser) => {
        // update privacy change consent
        const privacyConsents =
          updatedUser.consents?.filter(
            (consent) => consent.ctype === '2512-privacy-change'
          ) || [];

        const latestPrivacyConsent =
          privacyConsents[privacyConsents.length - 1];
        if (
          ((latestPrivacyConsent && !latestPrivacyConsent.hasConfirmed) ||
            !latestPrivacyConsent) &&
          this.privacyDialogActive &&
          !user.roles.includes('demo')
        ) {
          this.openPrivacyChangeDialog();
        } else if (
          user.authType === 'saml' &&
          this.isTimestampOlderThanAWeek(user.createdAt ?? new Date())
        ) {
          // only opens bakule survey, when privacy dialog is not opened, user is not demo user and is created more than one week ago
          this.openBaKuLeSurveyDialog();
        }
      });

    this.store
      .select(getModules)
      .pipe(takeWhile((modules) => modules.length === 0, true))
      .subscribe((modules) => {
        if (modules.length !== 0) {
          // additional load study plans
          this.store.dispatch(StudyPlanActions.loadStudyPlans());

          // delay the loading of active study plan until study plans are loaded
          this.store
            .select(getStudyPlans)
            .pipe(
              filter((studyPlans) => studyPlans && studyPlans.length > 0),
              take(1),
              tap(() => {
                this.store
                  .select(getActiveStudyPlanId)
                  .pipe(
                    takeWhile((id) => id === '', true),
                    take(1)
                  )
                  .subscribe((activeId) => {
                    if (activeId === '') {
                      this.store.dispatch(
                        StudyPlanActions.loadActiveStudyPlan()
                      );
                      // load semester plan
                      const semester = new Semester().name;
                      this.store.dispatch(
                        TimetableActions.updateActiveSemester({ semester })
                      );
                    }
                  });
              })
            )
            .subscribe((studyPlans) => {
              // legacy update of study plans
              this.studyPlanService.updateStudyPlans(studyPlans);
              this.studyPlanService.checkIfSemesterIsFinished(studyPlans);
            });
        }
      });

    // unsubscribe the userSubscription to prevent multiple reload, when user is changed in reducers
    this.userSubscription.unsubscribe();
  }

  openUserDialog(user: User) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'add-user-dialog',
        user: user,
      },
      minWidth: '40vw',
      backdropClass: ['bg-blue', 'bg-gradient'],
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((user) => {
      // set user values
      this.user = user;
      this.store.dispatch(UserActions.setUserData({ user }));
      // dispatch change of sp and mhb to store
      this.store.dispatch(
        selectStudyProgramme({ studyProgramme: user.sps[0].spId })
      );

      // set first semester info and load study plan uni template
      const currentSemester = Semester.getCurrentSemesterName();
      const currentSemesterType = currentSemester.slice(-1) as 'w' | 's';
      // study plan loading logic for first semester students
      if (this.user.startSemester === currentSemester && this.user.sps) {
        this.isFirstSemesterStudent = true;

        const spId = this.user.sps[0].spId;

        // check if a template is available for spId
        this.api
          .checkTemplateAvailability(spId, currentSemesterType)
          .subscribe((availabilityResponse) => {
            this.templatesAvailable = availabilityResponse.available;

            if (this.isFirstSemesterStudent && this.templatesAvailable) {
              // fetch the study plan
              this.studyPlanTemplate$ =
                this.api.getLatestTemplateForStudyProgram(
                  spId,
                  currentSemesterType
                );

              this.studyPlanTemplate$.pipe(take(1)).subscribe({
                next: () => {
                  this.openImportDialog(this.user._id);
                },
              });
            } else {
              this.createDefaultStudyPlan();
            }
          });
      } else {
        this.createDefaultStudyPlan();
      }
      this.router.navigate(['app', 'dashboard']);
    });
  }

  // open study plan template import option for new first semesters
  openImportDialog(uId: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Musterstudienplan importieren',
        dialogContentId: 'import-dialog',
        importType: 'deinen Musterplan',
        isFirstSemesterStudent: this.isFirstSemesterStudent,
        startSemester: this.user.startSemester,
        studyPlanTemplate$: this.studyPlanTemplate$,
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if users don't import a plan, a default plan is created and set as active
      if (!result) {
        this.createDefaultStudyPlan();
        return;
      }

      // validation of the result
      if (this.isValidImportResult(result)) {
        // if users import a plan, it is saved and set as active
        this.createImportedStudyPlan(result, uId);
      }
    });
  }

  isValidImportResult(result: any): boolean {
    return (
      typeof result === 'object' &&
      Array.isArray(result.semesterPlans) &&
      this.studyPlanService.checkSemesterPlansStructure(result.semesterPlans) &&
      typeof result.status === 'boolean' &&
      typeof result.name === 'string'
    );
  }

  createImportedStudyPlan(result: any, uId: string) {
    const semesterPlans = result.semesterPlans.map(
      (el: SemesterPlanTemplate) => ({
        ...el,
        expanded: true,
        userId: uId,
      })
    );

    this.studyPlanService.createStudyPlan(
      result.name,
      semesterPlans[0].semester,
      semesterPlans.length,
      semesterPlans,
      true
    );

    this.dialog.closeAll();
  }

  createDefaultStudyPlan() {
    this.studyPlanService.createStudyPlan(
      'Mein Studienplan',
      this.user.startSemester,
      this.user.duration,
      undefined,
      true
    );

    this.dialog.closeAll();
  }

  openNotificationDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'notification-dialog',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(
          UserActions.updateHint({
            key: 'notification-dialog',
            hasConfirmed: true,
          })
        );
      }
    });
  }

  openBaKuLeSurveyDialog() {
    // Sort by timestamp in descending order
    const surveyConsent = this.user.consents.filter(
      (el) => el.ctype === 'bakule-survey'
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestSurveyConsent = surveyConsent.length > 0 ? surveyConsent[0] : null;
    
    if (!latestSurveyConsent || !latestSurveyConsent.hasResponded) {
      const month = new Date().getMonth()+1;
      const year = new Date().getFullYear();
      const dialogRef = this.dialog.open(SurveyComponent, {
        disableClose: true,
        data: {
          evaluationCode: `${month}-${year}`,
          spName: this.user.sps
            ? this.user.sps.map((el) => el.name).join(', ')
            : '',
          semester: this.findSemesterCount(
            this.user.startSemester ?? new Semester().name,
            this.user.duration ?? 6
          ),
          consentGiven: latestSurveyConsent?.hasConfirmed
        },
      });
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result: boolean | LongTermEvaluation) => {
          if (typeof result === 'boolean') {
            // in case of true, user does not want to participate this semester update consent to false
            if(result) {
              this.store.dispatch(UserActions.addConsent({
                ctype: 'bakule-survey',
                hasConfirmed: false,
                hasResponded: true,
                timestamp: new Date(),
              }))
            }
            // else case not exist, when false is returned user not responded this time open dialog again
          } else {
            // user completed survey, when latestSurveyConsent not exists or hasConfirmed is false, than add new consent
            if(!latestSurveyConsent || !latestSurveyConsent.hasConfirmed) {
              this.store.dispatch(UserActions.addConsent({
                ctype: 'bakule-survey',
                hasConfirmed: true,
                hasResponded: true,
                timestamp: new Date(),
              }))
            }
            // else do nothing, since nothing changed
          }
        });
    }
  }

  private findSemesterCount(startSemester: string, duration: number): number {
    const semesters = new Semester(startSemester)
      .getSemesterList(duration)
      .map((el) => el.name);
    return semesters.indexOf(new Semester().name)+1;
  }

  openPrivacyChangeDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'privacy-change-dialog',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.choice === 'accept') {
          this.store.dispatch(
            UserActions.addConsent({
              ctype: '2512-privacy-change',
              hasConfirmed: true,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
        } else if (result.choice === 'decline') {
          this.userUpdateService.deleteUser(this.user)
        }
      }
    });
  }

  private isTimestampOlderThanAWeek(timestamp: Date): boolean {
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000; // Millisekunden in einer Woche
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - oneWeekInMillis);

    const dateFromTimestamp = new Date(timestamp);

    return dateFromTimestamp < oneWeekAgo;
}
}
