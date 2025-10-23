import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Semester } from '../../../../interfaces/semester';
import { User } from '../../../../interfaces/user';
import {
  StudyplanActions,
  TimetableActions,
} from '../actions/study-planning.actions';
import { UserActions } from '../actions/user.actions';
import { DialogComponent } from '../dialog/dialog.component';
import { getUser } from '../selectors/user.selectors';
import {
  ModulehandbookActions,
  selectStudyProgramme,
} from '../actions/module-overview.actions';
import { StudyplanService } from '../shared/services/studyplan.service';
import {
  getActiveStudyplanId,
  getStudyplans,
} from '../selectors/study-planning.selectors';
import { filter, take, takeWhile, tap } from 'rxjs/operators';
import { Studyplan } from '../../../../interfaces/studyplan';
import { UserUpdateService } from '../shared/services/user-update.service';
import { getModules } from '../selectors/module-overview.selectors';
import { RestService } from '../rest.service';
import { SemesterplanTemplate } from '../../../../interfaces/semesterplan';
import { IndexedDbService } from '../shared/services/indexed-db.service';
import { Router } from '@angular/router';

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
  studyplanTemplate$: Observable<Studyplan | undefined>;
  templatesAvailable: boolean = false;
  notificationActive: boolean = false;
  privacyDialogShown: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private studyplanService: StudyplanService,
    private userUpdateService: UserUpdateService,
    private api: RestService,
    private indexedDB: IndexedDbService,
    private router: Router,
  ) { }

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
        const isWIAI = user.sps[0].faculty === 'WIAI';
        if (notificationEnabled && isWIAI && this.notificationActive) {
          this.openNotificationDialog();
        }
        if(this.router.url.endsWith('app')) {
          this.router.navigate(['app', 'dashboard'])
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
        ModulehandbookActions.loadModulehandbook({
          id: user.sps[0].mhbId,
          version: user.sps[0].mhbVersion,
        })
      );
    }

    // update user settings like dashboardsetting and hints
    this.userUpdateService.updateUserSettings(user).subscribe((updatedUser) => {
      // update privacy change consent
      const privacyConsents =
        updatedUser.consents?.filter(
          (consent) => consent.ctype === '2512-privacy-change'
        ) || [];

      const latestPrivacyConsent = privacyConsents[privacyConsents.length - 1];

      if (
        latestPrivacyConsent &&
        !latestPrivacyConsent.hasResponded &&
        !this.privacyDialogShown &&
        !user.roles.includes('demo')
      ) {
        this.privacyDialogShown = true;
        this.openPrivacyChangeDialog();
      }
    });

    this.store
      .select(getModules)
      .pipe(takeWhile((modules) => modules.length === 0, true))
      .subscribe((modules) => {
        if (modules.length !== 0) {
          // additional load studyplans
          this.store.dispatch(StudyplanActions.loadStudyplans());

          // delay the loading of active study plan until studyplans are loaded
          this.store
            .select(getStudyplans)
            .pipe(
              filter((studyplans) => studyplans && studyplans.length > 0),
              take(1),
              tap(() => {
                this.store
                  .select(getActiveStudyplanId)
                  .pipe(
                    takeWhile((id) => id === '', true),
                    take(1)
                  )
                  .subscribe((activeId) => {
                    if (activeId === '') {
                      this.store.dispatch(
                        StudyplanActions.loadActiveStudyplan()
                      );
                      // load semesterplan
                      const semester = new Semester().name;
                      this.store.dispatch(
                        TimetableActions.updateActiveSemester({ semester })
                      );
                    }
                  });
              })
            )
            .subscribe((studyplans) => {
              // legacy update of studyplans
              this.studyplanService.updateStudyplans(studyplans);
              this.studyplanService.checkIfSemesterIsFinished(studyplans);
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
      this.user = user
      this.store.dispatch(UserActions.setUserData({ user }))
      // dispatch change of sp and mhb to store
      this.store.dispatch(selectStudyProgramme({ studyProgramme: user.sps[0].spId }));

      // set first semester info and load studyplan uni template
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
              this.studyplanTemplate$ =
                this.api.getLatestTemplateForStudyProgram(
                  spId,
                  currentSemesterType
                );

              this.studyplanTemplate$.pipe(take(1)).subscribe({
                next: () => {
                  this.openImportDialog(this.user._id);
                },
              });
            } else {
              this.createDefaultStudyplan();
            }
          });
      } else {
        this.createDefaultStudyplan();
      }
      this.router.navigate(['app', 'dashboard'])
    });
  }

  // open studyplan template import option for new first semesters
  openImportDialog(uId: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Musterstudienplan importieren',
        dialogContentId: 'import-dialog',
        importType: 'deinen Musterplan',
        isFirstSemesterStudent: this.isFirstSemesterStudent,
        startSemester: this.user.startSemester,
        studyplanTemplate$: this.studyplanTemplate$,
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if users don't import a plan, a default plan is created and set as active
      if (!result) {
        this.createDefaultStudyplan();
        return;
      }

      // validation of the result
      if (this.isValidImportResult(result)) {
        // if users import a plan, it is saved and set as active
        this.createImportedStudyplan(result, uId);
      }
    });
  }

  isValidImportResult(result: any): boolean {
    return (
      typeof result === 'object' &&
      Array.isArray(result.semesterPlans) &&
      this.studyplanService.checkSemesterplansStructure(result.semesterPlans) &&
      typeof result.status === 'boolean' &&
      typeof result.name === 'string'
    );
  }

  createImportedStudyplan(result: any, uId: string) {
    const semesterplans = result.semesterPlans.map(
      (el: SemesterplanTemplate) => ({
        ...el,
        expanded: true,
        userId: uId,
      })
    );

    this.studyplanService.createStudyplan(
      result.name,
      semesterplans[0].semester,
      semesterplans.length,
      semesterplans,
      true
    );

    this.dialog.closeAll();
  }

  createDefaultStudyplan() {
    this.studyplanService.createStudyplan(
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

  openPrivacyChangeDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogContentId: 'privacy-change-dialog',
      },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.choice === 'accept') {
          this.store.dispatch(
            UserActions.updateConsent({
              ctype: '2512-privacy-change',
              hasConfirmed: true,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
        } else if (result.choice === 'decline') {
          this.store.dispatch(
            UserActions.updateConsent({
              ctype: '2512-privacy-change',
              hasConfirmed: false,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
        }
      }
    });
  }
}
