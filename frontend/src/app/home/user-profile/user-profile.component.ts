import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, concatMap, Observable, of, take } from 'rxjs';
import { User } from '../../../../../interfaces/user';
import { getUser } from 'src/app/selectors/user.selectors';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { MatDialog } from '@angular/material/dialog';
import { UserActions } from 'src/app/actions/user.actions';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Semester } from '../../../../../interfaces/semester';
import { Router } from '@angular/router';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { RestService } from 'src/app/rest.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { config } from 'src/environments/config.local';
import { AlertType } from 'src/app/shared/classes/alert';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { StudyPath } from '../../../../../interfaces/study-path';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';

import type { DownloadService } from 'src/app/shared/services/download.service';
import { UserUpdateService } from 'src/app/shared/services/user-update.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  standalone: false
})
export class UserProfileComponent implements OnInit {
  user$: Observable<User>;
  semesters$: Observable<Semester[]>;
  studyPlans$: Observable<StudyPlan[]>;
  disableDownload: boolean = false;
  activeRoute: string;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private router: Router,
    private lazyInject: LazyInjectService,
    private userUpdateService: UserUpdateService
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.studyPlans$ = this.store.select(getStudyPlans);
    const lastEntry = this.router.url.split('/').pop();
    this.activeRoute = lastEntry ? lastEntry : 'ueberblick';
  }

  async downloadUserdata(user: User, studyPlans: StudyPlan[], format: string) {
    this.disableDownload = true;
    const download = await this.lazyInject.get<DownloadService>(() =>
      import('../../shared/services/download.service').then((m) => m.DownloadService)
    )
    if (format === 'pdf') {
      await download.downloadUserData(user, studyPlans);
    } else if (format === 'json') {
      download.downloadJSONFile(this.transformUser(user), 'user.json');
    }

    this.disableDownload = false;
  }

  navigate(url: string) {
    this.activeRoute = url;
    this.router.navigate(['app', 'profil', url])
  }

  openDeleteDialog(user: User) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Account löschen?',
      actionType: 'delete',
      confirmationItem: 'deinen Account',
      warningMessage: 'Die Daten werden unwiederbringlich gelöscht, eine Wiederherstellung ist nicht möglich.',
      confirmButtonLabel: 'Ja, ich möchte meinen Account löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.userUpdateService.deleteUser(user);
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  importUserData(user: User) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Daten importieren:',
        dialogContentId: 'import-dialog',
        importType: 'deine Nutzerdaten',
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      const studyPath: StudyPath = {
        ...user.studyPath,
        completedModules: result.completedModules,
      }
      if (result) {
        const updatedUser = {
          ...user,
          ...result,
          excludedModulesAcronyms: result.excludedModulesAcronyms || result.notInterestingModulesAcronyms, // catch legacy cases
          studyPath
        };
        this.store.dispatch(UserActions.updateUser({ user: updatedUser }));
      }
      this.dialog.closeAll();
    });
  }

  private transformUser(user: User): any {
    // delete mongodb data from attributes
    const sps = user.sps?.map((sp) => {
      return {
        ...sp,
        _id: undefined,
      };
    });
    const dbsetting = user.dashboardSettings.map((setting) => {
      return {
        ...setting,
        _id: undefined,
      };
    });

    return {
      ...user,
      _id: undefined,
      shibId: undefined,
      roles: undefined,
      sps,
      dashboardSettings: dbsetting,
      createdAt: undefined,
      updatedAt: undefined,
      sync: undefined,
      studyPath: undefined,
      completedModules: user.studyPath.completedModules,
    };
  }
}
