import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '@interfaces/user';
import { getUser } from 'src/app/selectors/user.selectors';
import { StudyPlan } from '@interfaces/study-plan';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { MatDialog } from '@angular/material/dialog';
import { UserActions } from 'src/app/actions/user.actions';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Semester } from '@interfaces/semester';
import { Router } from '@angular/router';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { StudyPath } from '@interfaces/study-path';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';

import type { DownloadService } from 'src/app/shared/services/download.service';
import { UserUpdateService } from 'src/app/shared/services/user-update.service';
import { ModuleHandbookActions } from 'src/app/actions/module-overview.actions';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  standalone: false,
})
export class UserProfileComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private lazyInject = inject(LazyInjectService);
  private userUpdateService = inject(UserUpdateService);

  user$: Observable<User>;
  semesters$: Observable<Semester[]>;
  studyPlans$: Observable<StudyPlan[]>;
  disableDownload: boolean = false;
  activeRoute: string;

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
    this.studyPlans$ = this.store.select(getStudyPlans);
    const lastEntry = this.router.url.split('/').pop();
    this.activeRoute = lastEntry ? lastEntry : 'ueberblick';
  }

  async downloadUserdata(user: User, studyPlans: StudyPlan[], format: string) {
    this.disableDownload = true;
    const download = await this.lazyInject.get<DownloadService>(() =>
      import('../../shared/services/download.service').then(
        (m) => m.DownloadService,
      ),
    );
    if (format === 'pdf') {
      await download.downloadUserData(user, studyPlans);
    } else if (format === 'json') {
      download.downloadJSONFile(this.transformUser(user), 'user.json');
    }

    this.disableDownload = false;
  }

  navigate(url: string) {
    this.activeRoute = url;
    this.router.navigate(['app', 'profil', url]);
  }

  openDeleteDialog(user: User) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: $localize `Account löschen?`,
      actionType: 'delete',
      confirmationItem: $localize `deinen Account`,
      warningMessage:
        $localize `Die Daten werden unwiederbringlich gelöscht, eine Wiederherstellung ist nicht möglich.`,
      confirmButtonLabel: $localize `Ja, ich möchte meinen Account löschen`,
      cancelButtonLabel: $localize `Abbrechen`,
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
        dialogTitle: $localize `Daten importieren:`,
        dialogContentId: 'import-dialog',
        importType: $localize `deine Nutzerdaten`,
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      const studyPath: StudyPath = {
        ...user.studyPath,
        completedModules: result.completedModules,
      };
      if (result) {
        const updatedUser: User = {
          ...user,
          ...result,
          excludedModulesAcronyms:
            result.excludedModulesAcronyms ||
            result.notInterestingModulesAcronyms, // catch legacy cases
          studyPath,
        };

        // TODO: filter by program status "Immatrikuliert" when fn-branch is merged
        // Currently first program is selected
        const sp = updatedUser.sps ? updatedUser.sps[0] : undefined;
        if (sp) {
          this.store.dispatch(
            ModuleHandbookActions.loadModuleHandbook({
              id: sp.mhbId,
              version: sp.mhbVersion,
            }),
          );
        }

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
