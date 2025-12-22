import { Component, Input, model } from '@angular/core';
import { User } from '../../../../../interfaces/user';
import { Observable, take } from 'rxjs';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { config } from 'src/environments/config.local';
import { RestService } from 'src/app/rest.service';
import { PathCourse, PathModule } from '../../../../../interfaces/study-path';
import { Semester } from '../../../../../interfaces/semester';
import {
  FnCompletedModule,
  FnCompletedCourse,
  FnStudyprogramme,
} from '../../../../../interfaces/fn-user';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { UserUpdateService } from 'src/app/shared/services/user-update.service';
import { MatDialogRef } from '@angular/material/dialog';

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
  readonly flexNowImportConfirmed = model(false);
  readonly StudyPathConfirmed = model(false);
  steps: string[] = ['welcome'];
  isFirstSemesterStudent: boolean = false;
  templatesAvailable: boolean;
  studyPlanTemplate$: Observable<StudyPlan>;
  startSemester: Semester = new Semester();
  loadingMessage: string | undefined;
  errorMessage: string | undefined;

  constructor(
    private auth: AuthService,
    private rest: RestService,
    private userUpdateService: UserUpdateService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
  ) {}

  updateUserData(user: User) {
    this.user = user;
  }

  saveUser() {
    this.currentStep = 'loading'; // set loading to show loading message till all request where made
    this.loadingMessage = 'Dein Nutzer wird nun angelegt.';
    this.initializeNewUser()
      .pipe(take(1))
      .subscribe((user) => {
        this.loadingMessage = undefined;
        this.dialogRef.close(user);
      });
  }

  validateUserData(): boolean {
    if (
      this.user &&
      this.user.sps &&
      this.user.startSemester &&
      this.user.duration &&
      this.user.maxEcts &&
      this.user.fulltime !== undefined
    ) {
      return false;
    }
    return true;
  }

  // if step is empty user is on welcome screen and further step depends on role
  nextStep(step?: string) {
    if(this.termsConfirmed()) {
      this.errorMessage = undefined; // reset error message
      if (step) {
        this.currentStep = step;
        this.steps.push(step);
      } else {
        this.currentStep = 'createUser';
        this.user.fulltime = true;
        this.steps.push('createUser');
        /* const isStudent = this.user.roles.includes('student');
        if (isStudent) {
          this.currentStep = 'selection';
          this.steps.push('selection');
        } else {
          this.currentStep = 'createUser';
          this.steps.push('createUser');
        } */
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

  getFlexNowInformation() {
    this.currentStep = 'loading';
    this.loadingMessage = 'Wir laden deine Daten von FlexNow, das kann kurz dauern...'
    this.rest
      .getStudentDataViaFlexNow(this.StudyPathConfirmed())
      .subscribe((result) => {
        if(result.metadata.length > 0) {
          const completedModules: PathModule[] = result.studyPath
            ? this.extractCompletedModules(result.studyPath.completedModules)
            : [];
          const completedCourses: PathCourse[] = result.studyPath
            ? this.extractCompletedCourses(result.studyPath.completedCourses)
            : [];
          const userData: User = this.extractMetadata(this.user, result.metadata);

          this.user = {
            ...userData,
            studyPath: {
              completedModules,
              completedCourses,
            },
          };
        } else {
          this.errorMessage = 'Leider konnten wir für dich keine Daten aus FlexNow importieren!';
        }
        this.loadingMessage = undefined;
        this.nextStep('createUser');
      });
  }

  private extractMetadata(
    user: User,
    fnStudyprogrammes: FnStudyprogramme[]
  ): User {
    let resultUser = {
      ...user,
    };
    // TODO: Currently checks only first studyprogamme
    for (let fnStudyprogramme of fnStudyprogrammes) {
      resultUser.sps = [
        {
          spId: fnStudyprogramme.spId,
          poVersion: fnStudyprogramme.poVersion,
          name: fnStudyprogramme.name,
          faculty: fnStudyprogramme.faculty,
          mhbId: fnStudyprogramme.mhbId,
          mhbVersion: fnStudyprogramme.mhbVersion,
        },
      ];
      resultUser.duration = fnStudyprogramme.duration;
      resultUser.maxEcts = fnStudyprogramme.maxEcts;
      resultUser.fulltime = true; // preset fulltime to true
      const currentSemester = new Semester();
      for (let fnSemester of fnStudyprogramme.semesters) {
        if (fnSemester.startSemester) {
          resultUser.startSemester = new Semester(fnSemester.semester).name;
        }
        if (fnSemester.semester == currentSemester.apNr) {
          resultUser.fulltime = !fnSemester.partTime;
        }
      }
      break;
    }

    return resultUser;
  }

  private extractCompletedModules(
    modules: FnCompletedModule[]
  ): PathModule[] {
    return modules.map((fnModule) => {
      // TODO: if more than one Modulegroup set modulegroup to undefined, user need to set it
      let mgId = undefined;
      if (fnModule.moduleGroups && fnModule.moduleGroups.length == 1) {
        mgId = fnModule.moduleGroups[0].mgId;
      }
      return {
        acronym: fnModule.acronym,
        name: fnModule.name,
        ects: fnModule.ects,
        status: this.transformStatus(fnModule.status),
        mgId,
        semester: new Semester(fnModule.semester).name,
        isUserGenerated: false,
        flexNowImported: true,
        grade: fnModule.grade ? fnModule.grade : 0,
      };
    });
  }

  private extractCompletedCourses(
    courses: FnCompletedCourse[]
  ): PathCourse[] {
    // TODO -> courses need to be searched with name
    return [];
  }

  private transformStatus(status: string): string {
    switch (status) {
      case 'bestanden':
        return 'passed';
      case 'zugelassen':
        return 'taken';
      case 'nicht bestanden':
        return 'failed';
      default:
        return 'open';
    }
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
        hasConfirmed: this.flexNowImportConfirmed(),
        timestamp: new Date(),
      },
      {
        ctype: 'upload-exam-data',
        hasConfirmed: this.StudyPathConfirmed(),
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
