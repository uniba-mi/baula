import { Injectable } from '@angular/core';
import {
  ChartVisibility,
  Consent,
  Hint,
  User,
} from '../../../../../interfaces/user';
import { UserActions } from 'src/app/actions/user.actions';
import { Store } from '@ngrx/store';
import { PathModule } from '../../../../../interfaces/study-path';
import { TimetableSettings } from '../../../../../interfaces/semester-plan';
import { catchError, concatMap, of, take } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { RestService } from 'src/app/rest.service';
import { AuthService } from '../auth/auth.service';
import { config } from 'src/environments/config.local';
import { AlertType } from '../classes/alert';

@Injectable({
  providedIn: 'root',
})
export class UserUpdateService {
  constructor(
    private store: Store,
    private snackbar: SnackbarService,
    private rest: RestService,
    private auth: AuthService
  ) {}

  private availableHints: Hint[] = [
    { key: 'module-hint', hasConfirmed: false },
    { key: 'courseSearch-hint', hasConfirmed: false },
    { key: 'semesterPlan-hint', hasConfirmed: false },
    { key: 'studyPlan-hint', hasConfirmed: false },
    { key: 'studyPlanDetail-hint', hasConfirmed: false },
    { key: 'personalisation-hint', hasConfirmed: false },
    { key: 'serendipity-hint', hasConfirmed: false },
    { key: 'newModules-hint', hasConfirmed: false },
    { key: 'finishSemester-hint', hasConfirmed: false },
    { key: 'serendipitous-modules-hint', hasConfirmed: false },
    { key: 'personalModules-hint', hasConfirmed: false },
    { key: 'notification-dialog', hasConfirmed: false },
    // add further hints here so existing users are shown these
  ];

  private availableDashboardSettings: ChartVisibility[] = [
    { key: 'quick-links', visible: true },
    { key: 'total-ects-progress', visible: true },
    { key: 'total-module-progress', visible: false },
    { key: 'semester-ects-progress', visible: false },
    { key: 'semester-module-progress', visible: false },
    { key: 'module-group-progress', visible: false },
    { key: 'semester-dates', visible: true },
    { key: 'calendar', visible: true },
    { key: 'gpa', visible: true },
    { key: 'personalisation', visible: true },
  ];

  private availableConsents: Consent[] = [
    {
      ctype: 'upload-exam-data',
      hasConfirmed: false,
      hasResponded: false,
      timestamp: new Date(),
    },
    {
      ctype: 'flexnow-api',
      hasConfirmed: false,
      hasResponded: false,
      timestamp: new Date(),
    },
  ];

  private availableTimetableSettings: TimetableSettings[] = [
    { showWeekends: true },
    // add future settings here
  ];

  getHints(): Hint[] {
    return this.availableHints;
  }

  getConsents(): Consent[] {
    return this.availableConsents;
  }

  getDashboardSettings(): ChartVisibility[] {
    return this.availableDashboardSettings;
  }

  getTimetableSettings(): TimetableSettings[] {
    return this.availableTimetableSettings;
  }

  updateUserSettings(user: User) {
    // if fulltime information for legacy users does not exist, set to true by default
    if (user.fulltime === undefined) {
      user.fulltime = true;
    }

    const updatedHints = this.updateUserHints(user);
    const updatedDashboardSettings = this.updateDashboardSettings(user);
    const updatedTimetableSettings = this.updateTimetableSettings(user);
    const updatedModules = this.updateUserModulesWithMgId(user);
    const updatedConsents = this.updateUserConsents(user);

    if (
      updatedHints ||
      updatedDashboardSettings ||
      updatedTimetableSettings ||
      updatedModules ||
      updatedConsents
    ) {
      const updatedUser: User = {
        ...user,
        hints: updatedHints ? updatedHints : user.hints,
        dashboardSettings: updatedDashboardSettings
          ? updatedDashboardSettings
          : user.dashboardSettings,
        timetableSettings: updatedTimetableSettings
          ? updatedTimetableSettings
          : user.timetableSettings,
        studyPath: updatedModules
          ? { ...user.studyPath, completedModules: updatedModules }
          : user.studyPath,
        consents: updatedConsents ? updatedConsents : user.consents,
      };
      this.store.dispatch(UserActions.updateUser({ user: updatedUser }));

      // optimistic update
      return of(updatedUser);
    }
    return of(user);
  }

  deleteUser(user: User) {
    this.rest
      .deleteUser()
      .pipe(take(1))
      .pipe(
        concatMap((mes) => {
          this.snackbar.openSnackBar({
            type: AlertType.SUCCESS,
            message: mes,
          });
          if (user.authType === 'saml') {
            return this.auth.shibLogout();
          } else {
            return this.auth.localLogout();
          }
        }),
        catchError(() => {
          return of(false);
        })
      )
      .subscribe((success) => {
        if (success) {
          document.location.href = config.homeUrl;
        } else {
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message: 'Es ist ein Fehler beim Löschen aufgetreten.',
          });
        }
      });
  }

  // Compare current hints for user with available hints
  private updateUserHints(user: User): Hint[] | undefined {
    const currentHints = user.hints || [];
    let updated = false;

    const updatedHints = this.availableHints.reduce(
      (acc: Hint[], hint: Hint) => {
        if (!currentHints.some((ch) => ch.key === hint.key)) {
          acc.push(hint);
          updated = true;
        } else {
          acc.push(currentHints.find((ch) => ch.key === hint.key)!);
        }
        return acc;
      },
      []
    );

    if (updated) {
      return updatedHints;
    } else {
      return;
    }
  }

  // Compare current dashboard-settings for users with available settings
  private updateDashboardSettings(user: User): ChartVisibility[] | undefined {
    const currentSettings = user.dashboardSettings;
    let updated = false;

    const updatedSettings = this.availableDashboardSettings.reduce(
      (acc: ChartVisibility[], setting: ChartVisibility) => {
        if (
          !currentSettings.some((ch: ChartVisibility) => ch.key === setting.key)
        ) {
          acc.push(setting);
          updated = true;
        } else {
          acc.push(currentSettings.find((ch) => ch.key === setting.key)!);
        }
        return acc;
      },
      []
    );

    if (updated) {
      return updatedSettings;
    } else {
      return;
    }
  }

  // Compare current timetable-settings for users with available settings
  private updateTimetableSettings(user: User): TimetableSettings[] | undefined {
    const currentSettings = user.timetableSettings;
    let updated = false;

    const updatedSettings = this.availableTimetableSettings.reduce(
      (acc: TimetableSettings[], setting: TimetableSettings) => {
        const settingKey = Object.keys(setting)[0];

        const existingSetting = currentSettings.find(
          (el) => Object.keys(el)[0] === settingKey
        );

        // add to settings if does not exist yet
        if (!existingSetting) {
          acc.push(setting);
          updated = true;
        } else {
          // check if the value is the same
          const existingValue = existingSetting[settingKey];
          const newValue = setting[settingKey];

          if (existingValue !== newValue) {
            // update the setting if value has changed
            acc.push(setting);
            updated = true;
          } else {
            // keep setting
            acc.push(existingSetting);
          }
        }
        return acc;
      },
      []
    );

    if (updated) {
      return updatedSettings;
    } else {
      return;
    }
  }

  // Compare current consents for users with available settings
  private updateUserConsents(user: User): Consent[] | undefined {
    const currentConsents = user.consents || [];
    let updated = false;

    const updatedConsents = this.availableConsents.reduce(
      (acc: Consent[], consent: Consent) => {
        const existing = currentConsents.find((c) => c.ctype === consent.ctype);
        if (!existing) {
          acc.push({ ...consent, timestamp: new Date() });
          updated = true;
        } else {
          acc.push(existing);
        }
        return acc;
      },
      []
    );

    if (updated) {
      return updatedConsents;
    } else {
      return;
    }
  }

  // helper to init mgId/flexNowImported for each module if missing
  private updateUserModulesWithMgId(user: User): PathModule[] | undefined {
    let changes = false;
    let modules = user.studyPath.completedModules.map((module) => {
      if (module.mgId == undefined || module.flexNowImported == undefined) {
        changes = true;
        return {
          ...module,
          mgId: module.mgId ? module.mgId : 'init',
          flexNowImported:
            module.flexNowImported == undefined
              ? false
              : module.flexNowImported,
        };
      }
      return module;
    });
    if (changes) {
      return modules;
    } else {
      return undefined;
    }
  }
}
