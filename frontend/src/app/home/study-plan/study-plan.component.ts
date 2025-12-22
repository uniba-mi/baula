import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { StudyPlanActions } from 'src/app/actions/study-planning.actions';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { getSemesterList, getUser } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../interfaces/user';
import { Semester } from '../../../../../interfaces/semester';
import {
  StudyPlan,
  StudyPlanTemplate,
} from '../../../../../interfaces/study-plan';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { AlertType } from 'src/app/shared/classes/alert';
import type { DownloadService } from 'src/app/shared/services/download.service';
import { SemesterPlanTemplate } from '../../../../../interfaces/semester-plan';
import { StudyPath } from '../../../../../interfaces/study-path';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { RestService } from 'src/app/rest.service';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';
import { StudyPlanService } from 'src/app/shared/services/study-plan.service';

@Component({
    selector: 'app-study-plan',
    templateUrl: './study-plan.component.html',
    styleUrls: ['./study-plan.component.scss'],
    standalone: false
})
export class StudyPlanComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  studyPlans$: Observable<StudyPlan[]>;
  studyPlans: StudyPlan[];
  user$: Observable<User>;
  user: User;
  closeMode: string;
  semesterList$: Observable<Semester[]>;
  semesterList: Semester[];
  futureSemesters: Semester[];
  studyPlanHint: string = 'studyPlan-hint';
  studyPlanMessage: string = 'Hier hast du die Möglichkeit, mehrere Studienverlaufspläne anzulegen oder zu importieren. Beachte, dass du immer nur einen Studienplan über den Toggle aktivieren kannst. Diesen aktuellen Plan findest du immer direkt über die Navigation unter dem Menüpunkt "Studienverlaufsplan". Alle anderen Studienpläne sind hier archiviert.';
  studyPlanTemplate$: Observable<StudyPlan | undefined>;
  templatesAvailable: boolean = false;

  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private studyPlanService: StudyPlanService,
    private transform: TransformationService,
    private api: RestService,
    private lazyInject: LazyInjectService
  ) { }

  ngOnInit(): void {
    this.studyPlans$ = this.store.select(getStudyPlans);
    this.studyPlans$.subscribe((studyPlans) => (this.studyPlans = studyPlans));
    this.user$ = this.store.select(getUser);

    // get current semester
    const currentSemesterType = Semester.getCurrentSemesterName().slice(-1) as 'w' | 's';

    this.user$.subscribe((user) => {
      this.user = user;
      // load most recent study plan template for user's sp
      if (this.user && this.user.sps && this.user.sps.length > 0) {
        const spId = this.user.sps[0].spId;

        // check if a template is available for spId
        this.api.checkTemplateAvailability(spId, currentSemesterType).subscribe((availabilityResponse) => {
          this.templatesAvailable = availabilityResponse.available;

          // fetch study plan template
          if (this.templatesAvailable) {
            this.studyPlanTemplate$ = this.api.getLatestTemplateForStudyProgram(spId, currentSemesterType);
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
        this.deleteStudyPlan(id);
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  deleteStudyPlan(id: string) {
    this.store.dispatch(StudyPlanActions.deleteStudyPlan({ studyPlanId: id }));
    this.dialog.closeAll();
  }

  toggleActiveState(event: any, id: string) {
    event.stopPropagation();

    // get active study plan
    const activePlan = this.studyPlans.find((plan) => plan.status);
    if (activePlan && this.studyPlans.length > 1) {
      let studyPlans;
      let newId = id;
      // only set study plans if active plan is toggle to enable selection of new plan in dialog
      if (activePlan._id === id) {
        studyPlans = this.studyPlans.filter(
          (plan) => plan._id !== activePlan._id
        );
        newId = '';
      }

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Anderen Studienplan aktivieren',
          dialogContentId: 'activate-study-plan',
          activeStudyPlan: activePlan,
          newPlanId: newId,
          studyPlans: studyPlans,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        const semester = new Semester().name
        if (result.newId) {
          let newPlan = this.studyPlans.find(
            (plan) => plan._id === result.newId
          );
          if (newPlan) {
            let oldPlan = activePlan;
            if (result.keepCurrentSemester) {
              newPlan = this.transform.transferPlanToAnotherStudyPlan(
                oldPlan,
                newPlan,
                semester
              );
            }

            oldPlan.status = false;
            newPlan.status = true;

            // always transfer current semester plan courses into new semester plan courses
            const oldSemesterPlanCourses = oldPlan.semesterPlans.find(el => el.semester === semester)?.courses;
            const newSemesterPlanIndex = newPlan.semesterPlans.findIndex(el => el.semester === semester);
            if (oldSemesterPlanCourses && newSemesterPlanIndex !== -1) {
              newPlan.semesterPlans[newSemesterPlanIndex].courses = oldSemesterPlanCourses;
            }

            const currentSemesterPlan = oldPlan.semesterPlans.find(el => el.isPastSemester === false);
            const currentSemester = currentSemesterPlan ? currentSemesterPlan.semester : new Semester().name; // contains first not past semester to adapt new active plan
            for(let plan of newPlan.semesterPlans) {
              if (plan.semester === currentSemester) {
                plan.isPastSemester = false;
                break;
              } else {
                plan.isPastSemester = true;
              }
            }

            // update new and old plan
            this.store.dispatch(StudyPlanActions.updateStudyPlan({ studyPlanId: oldPlan._id, studyPlan: oldPlan }))
            this.store.dispatch(StudyPlanActions.updateStudyPlan({ studyPlanId: newPlan._id, studyPlan: newPlan }))
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

  selectStudyPlan(id: string) {
    this.router.navigate(['app/studium/studienplan', id]);
    this.store.dispatch(StudyPlanActions.selectStudyPlan({ studyPlanId: id }));
  }

  duplicateStudyPlan(user: User, studyPlan: StudyPlan) {
    let inputName = studyPlan.name + ' (Kopie)';
    this.studyPlanService.createStudyPlan(
      inputName,
      user.startSemester,
      user.duration,
      studyPlan.semesterPlans
    );
  }

  openAddStudyPlanDialog(
    user: User,
    studyPlanId?: string,
    studyPlan?: StudyPlanTemplate
  ) {
    if (!studyPlan) {
      // set status of study plan
      let status = false;
      if (this.studyPlans.length === 0) {
        status = true;
      }

      // add new study plan
      const newStudyPlan: StudyPlanTemplate = {
        name: '',
        status: false,
        semesterPlans: [],
      };

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Studienplan erstellen',
          dialogContentId: 'add-study-plan-dialog',
          studyPlan: newStudyPlan,
        },
      });

      dialogRef.afterClosed().subscribe((name: string) => {
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          this.studyPlanService.createStudyPlan(
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

    if (studyPlan && studyPlanId) {
      // edit existing study plan

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Studienplan bearbeiten',
          dialogContentId: 'add-study-plan-dialog',
          studyPlan: studyPlan,
        },
      });

      dialogRef.afterClosed().subscribe((name?: string) => {
        if (name) {
          studyPlan.name = name;
        }
        this.store
          .select(getCloseDialogMode)
          .subscribe((mode) => (this.closeMode = mode));
        if (this.closeMode === 'data') {
          this.studyPlanService.updateStudyPlan(studyPlanId, studyPlan);
        } else {
          return;
        }
      });
    }
  }

  exportStudyPlan(studyPlan: StudyPlan, studyPath: StudyPath) {
    const semester = studyPlan.semesterPlans
      .filter((plan) => plan.isPastSemester === true)
      .map((el) => new Semester(el.semester));
    this.transform.transformStudyPath(studyPath, semester)
      .pipe(take(1))
      .subscribe((studyPathInSemester) => {
        const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            dialogTitle: 'Daten exportieren:',
            dialogContentId: 'export-dialog',
            studyPlan,
            studyPath: studyPathInSemester,
          },
          minWidth: '50vw',
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.lazyInject.get<DownloadService>(() => 
              import('../../shared/services/download.service').then((m) => m.DownloadService)
            ).then(download => download.downloadJSONFile(
              result,
              `${studyPlan.name.toLowerCase().replace(' ', '_')}.json`
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
          { value: 'individualStudyPlan', label: 'Individuellen Studienplan' },
          { value: 'studyPlanTemplate', label: 'Offiziellen Musterstudienverlaufsplan für deinen Studiengang' }
        ],
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result === 'studyPlanTemplate') {
        this.importStudyPlanTemplate(uId, start)
      }

      if (result === 'individualStudyPlan') {
        this.importIndividualStudyPlan(uId, start)
      }
    });
  }

  // import individual study path
  importIndividualStudyPlan(uId: string, start?: string) {
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
        // check if result contains values of SemesterPlanTemplate
        if (
          typeof result === 'object' &&
          Array.isArray(result.semesterPlans) &&
          this.studyPlanService.checkSemesterPlansStructure(result.semesterPlans) &&
          typeof result.status === 'boolean' &&
          typeof result.name === 'string'
        ) {
          const semesterPlans = result.semesterPlans.map(
            (el: SemesterPlanTemplate) => {
              return {
                ...el,
                isPastSemester: false,
                expanded: true,
                userId: uId,
              };
            }
          );
          // set status to active, if study plans array is empty to activate imported study plan directly
          const status = this.studyPlans.length === 0 ? true : false;

          const duration = this.user.duration ? this.user.duration : semesterPlans.length;
          const startSemester = this.user.startSemester ? this.user.startSemester : semesterPlans[0].semester;

          this.studyPlanService.createStudyPlan(
            result.name,
            startSemester,
            duration,
            semesterPlans,
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

  // import degree specific study plan template provided by uni
  importStudyPlanTemplate(uId: string, start?: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Musterstudienverlaufsplan importieren:',
        dialogContentId: 'import-dialog',
        importType: 'deinen Musterplan',
        studyPlanTemplate$: this.studyPlanTemplate$,
        startSemester: new Semester(start),
      },
      minWidth: '50vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (
          typeof result === 'object' &&
          Array.isArray(result.semesterPlans) &&
          this.studyPlanService.checkSemesterPlansStructure(result.semesterPlans) &&
          typeof result.status === 'boolean' &&
          typeof result.name === 'string'
        ) {
          const semesterPlans = result.semesterPlans.map(
            (el: SemesterPlanTemplate) => {
              return {
                ...el,
                expanded: true,
                userId: uId,
              };
            }
          );
          // set status to active, if study plans array is empty to activate imported study plan directly
          const status = this.studyPlans.length === 0 ? true : false;

          this.studyPlanService.createStudyPlan(
            result.name,
            semesterPlans[0].semester,
            semesterPlans.length,
            semesterPlans,
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
