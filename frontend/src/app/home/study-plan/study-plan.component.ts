import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { StudyplanActions } from 'src/app/actions/study-planning.actions';
import { getStudyplans } from 'src/app/selectors/study-planning.selectors';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

/* Angular Material Modules  */
import { MatDialog } from '@angular/material/dialog';
import { getSemesterList, getUser } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../interfaces/user';
import { Semester } from '../../../../../interfaces/semester';
import {
  Studyplan,
  StudyplanTemplate,
} from '../../../../../interfaces/studyplan';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { AlertType } from 'src/app/shared/classes/alert';
import { StudyplanService } from 'src/app/shared/services/studyplan.service';
import type { DownloadService } from 'src/app/shared/services/download.service';
import { SemesterplanTemplate } from '../../../../../interfaces/semesterplan';
import { Studypath } from '../../../../../interfaces/studypath';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { RestService } from 'src/app/rest.service';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';

@Component({
    selector: 'app-study-plan',
    templateUrl: './study-plan.component.html',
    styleUrls: ['./study-plan.component.scss'],
    standalone: false
})
export class StudyPlanComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  studyplans$: Observable<Studyplan[]>;
  studyplans: Studyplan[];
  user$: Observable<User>;
  user: User;
  closeMode: string;
  semesterList$: Observable<Semester[]>;
  semesterList: Semester[];
  futureSemesters: Semester[];
  studyPlanHint: string = 'studyPlan-hint';
  studyPlanMessage: string = 'Hier hast du die Möglichkeit, mehrere Studienverlaufspläne anzulegen oder zu importieren. Beachte, dass du immer nur einen Studienplan über den Toggle aktivieren kannst. Diesen aktuellen Plan findest du immer direkt über die Navigation unter dem Menüpunkt "Studienverlaufsplan". Alle anderen Studienpläne sind hier archiviert.';
  studyplanTemplate$: Observable<Studyplan | undefined>;
  templatesAvailable: boolean = false;

  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private studyplanService: StudyplanService,
    private transform: TransformationService,
    private api: RestService,
    private lazyInject: LazyInjectService
  ) { }

  ngOnInit(): void {
    this.studyplans$ = this.store.select(getStudyplans);
    this.studyplans$.subscribe((studyplans) => (this.studyplans = studyplans));
    this.user$ = this.store.select(getUser);

    // get current semester
    const currentSemesterType = Semester.getCurrentSemesterName().slice(-1) as 'w' | 's';

    this.user$.subscribe((user) => {
      this.user = user;
      // load most recent studyplan template for user's sp
      if (this.user && this.user.sps && this.user.sps.length > 0) {
        const spId = this.user.sps[0].spId;

        // check if a template is available for spId
        this.api.checkTemplateAvailability(spId, currentSemesterType).subscribe((availabilityResponse) => {
          this.templatesAvailable = availabilityResponse.available;

          // fetch studyplan template
          if (this.templatesAvailable) {
            this.studyplanTemplate$ = this.api.getLatestTemplateForStudyProgram(spId, currentSemesterType);
          }
        });
      }
    });

    this.semesterList$ = this.store.select(getSemesterList);
  }

  onContextMenuClick(event: any) {
    event.stopPropagation();
  }

  openDeleteDialog(id: string, name: string) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Studienplan löschen?',
      actionType: 'delete',
      confirmationItem: name,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.deleteStudyplan(id);
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  deleteStudyplan(id: string) {
    this.store.dispatch(StudyplanActions.deleteStudyplan({ studyplanId: id }));
    this.dialog.closeAll();
  }

  toggleActiveState(event: any, id: string) {
    event.stopPropagation();

    // get active studyplan
    const activePlan = this.studyplans.find((plan) => plan.status);
    if (activePlan && this.studyplans.length > 1) {
      let studyplans;
      let newId = id;
      // only set studyplans if active plan is toggle to enable selection of new plan in dialog
      if (activePlan._id === id) {
        studyplans = this.studyplans.filter(
          (plan) => plan._id !== activePlan._id
        );
        newId = '';
      }

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Anderen Studienplan aktivieren',
          dialogContentId: 'activate-studyplan',
          activeStudyplan: activePlan,
          newPlanId: newId,
          studyplans: studyplans,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        const semester = new Semester().name
        if (result.newId) {
          let newPlan = this.studyplans.find(
            (plan) => plan._id === result.newId
          );
          if (newPlan) {
            let oldPlan = activePlan;
            if (result.keepCurrentSemester) {
              newPlan = this.transform.transferPlanToAnotherStudyplan(
                oldPlan,
                newPlan,
                semester
              );
            }

            oldPlan.status = false;
            newPlan.status = true;

            // always transfer current semesterplan courses into new semesterplan courses
            const oldSemesterplanCourses = oldPlan.semesterPlans.find(el => el.semester === semester)?.courses;
            const newSemesterplanIndex = newPlan.semesterPlans.findIndex(el => el.semester === semester);
            if (oldSemesterplanCourses && newSemesterplanIndex !== -1) {
              newPlan.semesterPlans[newSemesterplanIndex].courses = oldSemesterplanCourses;
            }

            const currentSemesterplan = oldPlan.semesterPlans.find(el => el.isPastSemester === false);
            const currentSemester = currentSemesterplan ? currentSemesterplan.semester : new Semester().name; // contains first not past semester to adapt new active plan
            for(let plan of newPlan.semesterPlans) {
              if (plan.semester === currentSemester) {
                plan.isPastSemester = false;
                break;
              } else {
                plan.isPastSemester = true;
              }
            }

            // update new and old plan
            this.store.dispatch(StudyplanActions.updateStudyplan({ studyplanId: oldPlan._id, studyplan: oldPlan }))
            this.store.dispatch(StudyplanActions.updateStudyplan({ studyplanId: newPlan._id, studyplan: newPlan }))
          }
        }
      });
    } else {
      // case if activePlan should be deactivated but is only plan left
      this.snackbar.openSnackBar({
        type: AlertType.DANGER,
        message:
          'Der Studienplan kann nicht deaktiviert werden, da es der einzige Plan ist.',
      });
    }
  }

  selectStudyplan(id: string) {
    this.router.navigate(['app/studium/studienplan', id]);
    this.store.dispatch(StudyplanActions.selectStudyplan({ studyplanId: id }));
  }

  duplicateStudyplan(user: User, studyplan: Studyplan) {
    let inputName = studyplan.name + ' (Kopie)';
    this.studyplanService.createStudyplan(
      inputName,
      user.startSemester,
      user.duration,
      studyplan.semesterPlans
    );
  }

  openAddStudyPlanDialog(
    user: User,
    studyplanId?: string,
    studyplan?: StudyplanTemplate
  ) {
    //event.stopPropagation();
    if (!studyplan) {
      // set status of studyplan
      let status = false;
      if (this.studyplans.length === 0) {
        status = true;
      }

      // add new studyplan
      const newStudyplan: StudyplanTemplate = {
        name: '',
        status: false,
        semesterPlans: [],
      };

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Studienplan erstellen',
          dialogContentId: 'add-studyplan-dialog',
          studyplan: newStudyplan,
        },
      });

      dialogRef.afterClosed().subscribe((name: string) => {
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          this.studyplanService.createStudyplan(
            name,
            user.startSemester,
            user.duration,
            undefined,
            status
          );
        } else {
          return;
        }
      });
    }

    if (studyplan && studyplanId) {
      // edit existing studyplan

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Studienplan bearbeiten',
          dialogContentId: 'add-studyplan-dialog',
          studyplan: studyplan,
        },
      });

      dialogRef.afterClosed().subscribe((name?: string) => {
        if (name) {
          studyplan.name = name;
        }
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          this.studyplanService.updateStudyplan(studyplanId, studyplan);
        } else {
          return;
        }
      });
    }
  }

  exportStudyplan(studyplan: Studyplan, studypath: Studypath) {
    const semester = studyplan.semesterPlans
      .filter((plan) => plan.isPastSemester === true)
      .map((el) => new Semester(el.semester));
    this.transform.transformStudypath(studypath, semester)
      .pipe(take(1))
      .subscribe((studypathInSemester) => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            dialogTitle: 'Daten exportieren:',
            dialogContentId: 'export-dialog',
            studyplan,
            studypath: studypathInSemester,
          },
          minWidth: '50vw',
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.lazyInject.get<DownloadService>(() => 
              import('../../shared/services/download.service').then((m) => m.DownloadService)
            ).then(download => download.downloadJSONFile(
              result,
              `${studyplan.name.toLowerCase().replace(' ', '_')}.json`
            ));
          }
          this.dialog.closeAll();
        });
      });
  }

  chooseImportType(uId: string, start?: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Was möchtest du importieren?',
        dialogContentId: 'select-option-dialog',
        options: [
          { value: 'individualStudyplan', label: 'Individuellen Studienplan' },
          { value: 'studyplanTemplate', label: 'Offiziellen Musterstudienverlaufsplan für deinen Studiengang' }
        ],
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result === 'studyplanTemplate') {
        this.importStudyplanTemplate(uId, start)
      }

      if (result === 'individualStudyplan') {
        this.importIndividualStudyplan(uId, start)
      }
    });
  }

  // import individual studyplan
  importIndividualStudyplan(uId: string, start?: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Individuellen Studienplan importieren:',
        dialogContentId: 'import-dialog',
        importType: 'deinen Studienplan',
        startSemester: new Semester(start),
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // check if result contains values of semesterplanTemplate
        if (
          typeof result === 'object' &&
          Array.isArray(result.semesterPlans) &&
          this.studyplanService.checkSemesterplansStructure(result.semesterPlans) &&
          typeof result.status === 'boolean' &&
          typeof result.name === 'string'
        ) {
          const semesterplans = result.semesterPlans.map(
            (el: SemesterplanTemplate) => {
              return {
                ...el,
                isPastSemester: false,
                expanded: true,
                userId: uId,
              };
            }
          );
          // set status to active, if studyplans array is empty to activate imported studyplan directly
          const status = this.studyplans.length === 0 ? true : false;

          const duration = this.user.duration ? this.user.duration : semesterplans.length;
          const startSemester = this.user.startSemester ? this.user.startSemester : semesterplans[0].semester;

          this.studyplanService.createStudyplan(
            result.name,
            startSemester,
            duration,
            semesterplans,
            status
          );
        } else {
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message:
              'Der Studienplan konnte nicht importiert werden, die Datei hatte nicht die richtige Struktur!',
          });
        }
      }
      this.dialog.closeAll();
    });
  }

  // import degree specific studyplan template provided by uni
  importStudyplanTemplate(uId: string, start?: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Musterstudienverlaufsplan importieren:',
        dialogContentId: 'import-dialog',
        importType: 'deinen Musterplan',
        studyplanTemplate$: this.studyplanTemplate$,
        startSemester: new Semester(start),
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (
          typeof result === 'object' &&
          Array.isArray(result.semesterPlans) &&
          this.studyplanService.checkSemesterplansStructure(result.semesterPlans) &&
          typeof result.status === 'boolean' &&
          typeof result.name === 'string'
        ) {
          const semesterplans = result.semesterPlans.map(
            (el: SemesterplanTemplate) => {
              return {
                ...el,
                expanded: true,
                userId: uId,
              };
            }
          );
          // set status to active, if studyplans array is empty to activate imported studyplan directly
          const status = this.studyplans.length === 0 ? true : false;

          this.studyplanService.createStudyplan(
            result.name,
            semesterplans[0].semester,
            semesterplans.length,
            semesterplans,
            status
          );
        } else {
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message:
              'Der Studienplan konnte nicht importiert werden, die Datei hatte nicht die richtige Struktur!!',
          });
        }
      }
      this.dialog.closeAll();
    });
  }
}
