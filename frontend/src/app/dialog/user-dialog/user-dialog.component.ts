import { Component, Input, model } from '@angular/core';
import { MStudyProgramme, User } from '../../../../../interfaces/user';
import { firstValueFrom, Observable, take } from 'rxjs';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { config } from 'src/environments/config.local';
import { RestService } from 'src/app/rest.service';
import { PathCourse, PathModule } from '../../../../../interfaces/study-path';
import { Semester } from '../../../../../interfaces/semester';
import {
  FnCompletedModule,
  FnCompletedCourse,
  FnStudyProgramme,
} from '../../../../../interfaces/fn-user';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { UserUpdateService } from 'src/app/shared/services/user-update.service';
import { MatDialogRef } from '@angular/material/dialog';
import { StudyProgramme } from '../../../../../interfaces/study-programme';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';


@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
  standalone: false,
})
export class UserDialogComponent {
  @Input() user: User;
  currentStep = 'welcome';
  readonly termsConfirmed = model(false);
  flexNowImportConfirmed = false;
  metadataConfirmed = false;
  studyPathConfirmed = false;
  gradesConfirmed = false;
  steps: string[] = ['welcome'];
  isFirstSemesterStudent: boolean = false;
  templatesAvailable: boolean;
  studyPlanTemplate$: Observable<StudyPlan>;
  startSemester: Semester = new Semester();
  loadingMessage: string | undefined;
  errorMessage: string | undefined;
  studyProgrammes$: Observable<StudyProgramme[]>;


  constructor(
    private auth: AuthService,
    private rest: RestService,
    private userUpdateService: UserUpdateService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private flexNowService: FlexnowService
  ) {
    this.studyProgrammes$ = this.rest.getStudyprogrammes();
  }

  receiveChanges(confirmations: {
    flexNowImportConfirmed: boolean,
    metadataConfirmed: boolean,
    studypathConfirmed: boolean,
    gradesConfirmed: boolean,
  }) {
    this.flexNowImportConfirmed = confirmations.flexNowImportConfirmed;
    this.metadataConfirmed = confirmations.metadataConfirmed;
    this.studyPathConfirmed = confirmations.studypathConfirmed;
    this.gradesConfirmed = confirmations.gradesConfirmed;
  }

  updateUserData(user: User) {
    this.user = user;
  }

  saveUser() {
    if (!this.validateUserData()) {
      this.currentStep = 'loading'; // set loading to show loading message till all request where made
      this.loadingMessage = 'Dein Nutzer wird nun angelegt.';
      this.initializeNewUser()
        .pipe(take(1))
        .subscribe((user) => {
          this.loadingMessage = undefined;
          this.dialogRef.close(user);
        });
    }
  }

  validateUserData(): boolean {
    if (
      this.user &&
      this.user.sps &&
      this.user.startSemester &&
      this.user.duration &&
      this.user.maxEcts &&
      this.user.fulltime !== undefined &&
      this.user.sps.filter(sp => sp.status == 'Immatrikuliert')[0].mhbId &&
      this.user.sps.filter(sp => sp.status == 'Immatrikuliert')[0].mhbVersion
    ) {
      return false;
    }
    return true;
  }

  // if step is empty user is on welcome screen and further step depends on role
  nextStep(step?: string) {
    if(this.termsConfirmed()) {
      if (step) {
        this.currentStep = step;
        this.steps.push(step);
      } else {
        const isStudent = this.user.roles.includes('student');
        if (isStudent) {
          this.currentStep = 'selection';
          this.steps.push('selection');
        } else {
          this.currentStep = 'createUser';
          this.steps.push('createUser');
        }
      }
    } else {
      this.errorMessage = "Stimme bitte den Nutzungsbedingungen zu."
    }
  }

  previousStep() {
    this.steps.pop();
    this.errorMessage = undefined; // reset error message
    let previousStep = this.steps[this.steps.length - 1];
    this.currentStep = previousStep ? previousStep : 'welcome';
  }

  returnToStart() {
    this.currentStep = 'loading';
    this.loadingMessage =
      'Schade, dass du Baula doch nicht nutzen möchtest. Wir melden dich ab.';
    if (this.user.authType === 'saml') {
      this.auth
        .shibLogout()
        .pipe(take(1))
        .subscribe(() => {
          this.loadingMessage = undefined;
          document.location.href = config.homeUrl;
        });
    } else {
      this.auth
        .localLogout()
        .pipe(take(1))
        .subscribe(() => {
          this.loadingMessage = undefined;
          document.location.href = config.homeUrl;
        });
    }
  }

  async getFlexNowInformation() {
    if (this.metadataConfirmed) {
      this.currentStep = 'loading';
      this.loadingMessage =
        'Wir laden deine Daten von FlexNow, das kann kurz dauern...';
      this.flexNowService.getFlexNowData('create-user', this.studyPathConfirmed, this.gradesConfirmed).pipe(take(1)).subscribe(
        user => {
          if(user) {
            this.user = user;
            this.errorMessage = this.checkMetaDataForErrors(this.user);
          } else {
            this.errorMessage =
              'Leider konnten wir für dich keine Daten aus FlexNow importieren!';
          }
          this.loadingMessage = undefined;
          this.nextStep('createUser');
        }
      )
    }
  }

  private checkMetaDataForErrors(data: User): string | undefined {
    // check for valid sps
    if (!data.sps || data.sps.length == 0) {
      return 'Die in deinem FlexNow-Auszug enthaltenen Studiengänge sind in Baula leider nicht verfügbar.';
    } else if(!data.sps.filter(sp => sp.status == 'Immatrikuliert')[0].mhbId || !data.sps.filter(sp => sp.status == 'Immatrikuliert')[0].mhbVersion) {
      return 'Leider konnten wir kein Modulhandbuch extrahieren, wähle daher ein passendes Modulhandbuch aus.';
    }
    return undefined;
  }

  // all the initialization stuff for new users
  private initializeNewUser(): Observable<User> {
    // initialize new user with "empty" study path
    if (!this.user.studyPath) {
      this.user.studyPath = {
        completedModules: [],
        completedCourses: [],
      };
    }

    // initialize dashboard-view with all settings on true
    this.user.dashboardSettings = this.userUpdateService.getDashboardSettings();
    this.user.timetableSettings = this.userUpdateService.getTimetableSettings();

    // initialize hints
    this.user.hints = this.userUpdateService.getHints();

    this.user.consents = [
      {
        ctype: 'terms-of-use',
        hasConfirmed: this.termsConfirmed(),
        timestamp: new Date(),
      },
      {
        ctype: 'flexnow-api',
        hasConfirmed: this.flexNowImportConfirmed,
        timestamp: new Date(),
      },
      {
        ctype: 'upload-meta-data',
        hasConfirmed: this.metadataConfirmed,
        timestamp: new Date(),
      },
      {
        ctype: 'upload-exam-data',
        hasConfirmed: this.studyPathConfirmed,
        timestamp: new Date(),
      },
      {
        ctype: 'include-grades',
        hasConfirmed: this.gradesConfirmed,
        timestamp: new Date(),
      },
      {
        ctype: '2512-privacy-change',
        hasConfirmed: true,
        hasResponded: true,
        timestamp: new Date(),
      },
    ];

    return this.rest.createUser(this.user);
  }
}
