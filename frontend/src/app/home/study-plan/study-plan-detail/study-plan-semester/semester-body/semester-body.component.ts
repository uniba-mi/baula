import { Component, Input } from '@angular/core';
import { Module } from '../../../../../../../../interfaces/module';
import { ModService } from 'src/app/shared/services/module.service';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { EMPTY, map, Observable, of, switchMap, take, takeWhile, tap } from 'rxjs';
import {
  getAllDistinctModules,
  getOldModuleByAcronym,
  getStructuredModuleGroups,
} from 'src/app/selectors/module-overview.selectors';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import {
  ModulePlanningActions,
  UserGeneratedModuleActions,
} from 'src/app/actions/study-planning.actions';
import {
  ConfirmationDialogData,
  ConfirmationDialogComponent,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import {
  UserGeneratedModule,
} from '../../../../../../../../interfaces/user-generated-module';
import {
  closeUserGeneratedModuleDialog,
  openUserGeneratedModuleDialog,
} from 'src/app/actions/dialog.actions';
import { User } from '../../../../../../../../interfaces/user';
import {
  PathModule,
  SemesterStudyPath,
  StudyPath,
} from '../../../../../../../../interfaces/study-path';
import { SemesterPlan, MetaSemester, ItemActionName } from '../../../../../../../../interfaces/semester-plan';
import {
  getSemesterList,
  getUser,
  getUserStudyPath,
} from 'src/app/selectors/user.selectors';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { ScreenSizeService } from 'src/app/shared/services/screen-size.service';
import { StudyPathActions } from 'src/app/actions/user.actions';
import { ExtendedModuleGroup } from '../../../../../../../../interfaces/module-group';
import { UnknownModulesActions } from 'src/app/actions/module-overview.actions';
import { Semester } from '../../../../../../../../interfaces/semester';
import { getSemesterPlanIdBySemester } from 'src/app/selectors/study-planning.selectors';
import { DragDropService } from 'src/app/shared/services/drag-drop.service';

@Component({
  selector: 'app-semester-body',
  standalone: false,

  templateUrl: './semester-body.component.html',
  styleUrl: './semester-body.component.scss'
})
export class SemesterBodyComponent {

  @Input() metaSemester: MetaSemester;
  @Input() studyPlanId: string;
  @Input() semesterPlan: SemesterPlan;
  @Input() semesterStudyPath$: Observable<SemesterStudyPath[]>;
  @Input() connectedDropListIds: string[];

  user$: Observable<User>;
  user: User;
  closeMode: string;
  isSmallScreen: boolean = false;
  structuredModuleGroups$: Observable<ExtendedModuleGroup[]>
  semesterPlan$: Observable<SemesterPlan>;
  studyPath$: Observable<StudyPath>;

  modules$: Observable<Module[]>;
  modules: Module[];
  semesters$: Observable<Semester[]>;

  constructor(
    private modService: ModService,
    private store: Store,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private screenSizeService: ScreenSizeService,
    private dragDropService: DragDropService,
  ) { }

  ngOnInit() {
    this.screenSizeService.isSmallScreen$.pipe(take(1)).subscribe(isSmall => {
      this.isSmallScreen = isSmall;
    });
    this.user$ = this.store.pipe(select(getUser));
    this.user$.subscribe((user) => {
      this.user = user;
    })
    this.studyPath$ = this.store.select(getUserStudyPath);
    this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);

    this.modules$ = this.store.select(getAllDistinctModules);
    this.modules$.pipe(takeWhile((mod) => mod.length === 0, true)).subscribe((modules) => {
      this.modules = modules;
    });

    // load old modules
    for (let mod of this.semesterPlan.modules) {
      if (!this.modules.map(el => el.acronym).includes(mod)) {
        this.store.dispatch(UnknownModulesActions.loadUnknownModule({ acronym: mod }))
      }
    }

    this.semesters$ = this.store.select(getSemesterList);
  }

  handleModuleAction(event: { action: ItemActionName, data: any }) {
    const { action, data } = event;

    switch (action) {
      case 'select':
        this.selectModule(data);
        break;

      case 'feedback':
        this.openModuleDetailsDialog(data.acronym || data);
        break;

      case 'moveToSem':
        this.openSelectSemesterDialog(data);
        break;

      case 'edit':
        if (data.isUserGenerated && this.metaSemester.isPastSemester) {
          this.openEditPathModuleDialog(this.semesterPlan.semester, data);
        } else {
          this.openUserGeneratedModuleDialog(
            this.semesterPlan._id,
            this.semesterPlan.semester,
            data._id,
            data
          );
        }
        break;

      case 'delete':
        if (this.metaSemester.isPastSemester) {
          this.openDeletePathModuleDialog(data._id, data.acronym, this.semesterPlan.semester);
        } else if (!data.mId) {
          this.openDeleteUserGeneratedModuleDialog(
            this.semesterPlan._id,
            this.semesterPlan.semester,
            data
          );
        } else {
          this.openDeleteModuleDialog(
            this.semesterPlan._id,
            this.semesterPlan.semester,
            data.acronym,
            data.name,
            data.ects
          );
        }
        break;

      case 'changeMG':
        if (this.metaSemester.isPastSemester) {
          this.openChangeModuleGroupDialog(event, data);
        }
        break;

      case 'editGrade':
        if (this.metaSemester.isPastSemester) {
          this.openEditGradeDialog(event, data);
        }
        break;
    }
  }

  selectModule(module: Module | string) {
    // if only string was passed, search module information in store by string match
    if (typeof module === 'string') {
      this.modService.selectModuleFromAcronymString(module);
      // if module was passed, set module information in store
    } else {
      this.modService.openDetailsDialog(module, undefined, false);
    }
  }

  getModuleInformation(acronym: string): Observable<Module | undefined> {
    return this.store.select(getOldModuleByAcronym(acronym));
  }

  openModuleDetailsDialog(acronym: string) { // open on tab feedback
    this.modService.selectModuleFromAcronymString(acronym, 'feedback');
  }

  openChangeModuleGroupDialog(event: any, module: PathModule): void {

    // if only fn upload mg name is there, but no proper mgid
    this.getModulePath(module.mgId).pipe(take(1)).subscribe(path => {
      const pathExists = !!path;

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Modulgruppe bearbeiten',
          dialogContentId: 'change-module-group-dialog',
          mgId: module.mgId,
          structuredModuleGroups$: this.structuredModuleGroups$,
          showMgWizard: !pathExists,
        },
      });

      dialogRef.afterClosed().subscribe((mgId) => {
        if (mgId) {
          this.store.select(getCloseDialogMode).pipe(take(1)).subscribe((mode) => {
            this.closeMode = mode;
            if (this.closeMode === 'data') {
              module.mgId = mgId === undefined ? 'open' : mgId;
              this.store.dispatch(StudyPathActions.updateModuleInStudyPath({ module }));
            }
          });
        }
      });
    });
  }

  getModulePath(mgId: string | undefined): Observable<string | null> {
    if (!mgId) {
      return of(null);
    }
    return this.structuredModuleGroups$.pipe(
      map(groups => {
        const group = groups.find(g => g.mgId === mgId);
        return group ? group.path : null;
      })
    );
  }

  // open dialog to select semester to move items on small screens
  openSelectSemesterDialog(data: any) {

    const availableTargetSemesters$ = this.semesters$.pipe(
      map(semesters => semesters.filter(semester => !semester.isPastSemester() && semester.name !== this.semesterPlan.semester))
    );

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Semester wählen',
        dialogContentId: 'select-semester-dialog',
        semesters$: availableTargetSemesters$,
      },
    });

    dialogRef.afterClosed().pipe(
      switchMap((targetSemester) => {
        if (targetSemester) {
          return this.store.select(getSemesterPlanIdBySemester(targetSemester)).pipe(
            take(1),
            tap((targetSemesterPlanId) => {
              if (targetSemesterPlanId) {

                this.semesters$.pipe(take(1)).subscribe(semesters => {
                  const targetSemesterData = semesters.find(s => s.fullName === targetSemester);
                  const isTargetPastSemester = !!targetSemesterData?.isPastSemester;

                  // dragDropService handles drop (same logic..)
                  this.dragDropService.handleDrop(
                    data,
                    this.semesterPlan._id,
                    this.semesterPlan.semester,
                    targetSemesterPlanId,
                    targetSemester,
                    this.studyPlanId,
                    isTargetPastSemester
                  );
                });
              } else {
                console.error('Keine ID gefunden für Semester:', targetSemester);
              }
            })
          );
        } else {
          return EMPTY;
        }
      }),
      take(1)
    ).subscribe();
  }

  openEditGradeDialog(event: any, module: PathModule) {

    switch (module.status) {
      case 'passed':
        this.openGradeDialog(module, 1.0, 4.0);
        break;
      case 'taken':
        this.snackbarService.openSnackBar({
          type: AlertType.WARNING,
          message: 'Für ein Modul, das du nur belegt, aber nicht abgeschlossen hast, kannst du keine Note hinzufügen.',
        });
        break;
      case 'failed':
        this.openGradeDialog(module, 5.0, 5.0);
        break;
      default:
        console.error('Fehler');
    }
  }

  openGradeDialog(module: PathModule, minGrade: number, maxGrade: number) {

    let inputGrade = module.grade || 0;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Note bearbeiten',
        dialogContentId: 'edit-grade-dialog',
        grade: inputGrade,
        minGrade: minGrade,
        maxGrade: maxGrade
      },
    });

    dialogRef.afterClosed().subscribe(grade => {
      if (grade !== undefined && grade !== module.grade) {
        const formattedGrade = Number(grade.toString().replace(',', '.'));
        if (formattedGrade >= minGrade && formattedGrade <= maxGrade) {
          module.grade = formattedGrade;
          this.updateGrade(module);
        }
      }
    });
  }

  updateGrade(module: PathModule) {

    // legacy
    if (module.mgId === undefined) {
      module.mgId = 'open'
    }

    this.store.dispatch(
      StudyPathActions.updateModuleInStudyPath({ module })
    );

    this.dialog.closeAll();
  }

  openEditPathModuleDialog(semester: string, pathModule?: PathModule) {

    // either exists (update) or create new with the following details
    const pathModuleData: PathModule = pathModule || {
      acronym: '',
      name: '',
      ects: 0,
      grade: 0,
      mgId: undefined,
      status: 'open',
      semester: semester,
      isUserGenerated: true,
      flexNowImported: false,
    };

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: pathModule ? 'Leistung bearbeiten' : 'Leistung hinzufügen',
        dialogContentId: 'edit-path-module-dialog',
        pathModule: pathModuleData,
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(pathModule => {
      if (pathModule) {

        const newPathModule = {
          ...pathModule,
          semester: pathModule.semester ? pathModule.semester : semester,
          grade: Number(pathModule.grade),
          ects: Number(pathModule.ects),
          mgId: pathModule.mgId ? pathModule.mgId : 'init',
          isUserGenerated: true,
          flexNowImported: pathModule.flexNowImported ? pathModule.flexNowImported : false,
        };

        this.store.dispatch(StudyPathActions.updateModuleInStudyPath({ module: newPathModule }))
      }
    });
  }

  openUserGeneratedModuleDialog(
    ppId: string,
    ppSem?: string,
    moduleId?: string,
    module?: UserGeneratedModule
  ) {
    if (module && moduleId && ppSem) {
      // edit existing user generated module

      this.store.dispatch(openUserGeneratedModuleDialog());

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Platzhalter bearbeiten',
          dialogContentId: 'add-user-generated-module-dialog',
          module: module,
        },
      });

      dialogRef.afterClosed().subscribe((module: UserGeneratedModule) => {
        if (module) {
          this.store
            .select(getCloseDialogMode)
            .subscribe((mode) => (this.closeMode = mode));
          if (this.closeMode === 'data') {

            module.ects = Number(module.ects); // convert to number

            this.store.dispatch(
              UserGeneratedModuleActions.updateUserGeneratedModule({
                studyPlanId: this.studyPlanId,
                semesterPlanId: ppId,
                semesterPlanSemester: ppSem,
                moduleId: moduleId,
                module: module,
              })
            );

            this.store.dispatch(closeUserGeneratedModuleDialog());
          }
        }
      });
    }
  }

  openDeleteModuleDialog(
    semesterPlanId: string,
    semesterPlanSemester: string,
    moduleAcronym: string,
    moduleName: string,
    ects: number
  ) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Modul wirklich aus dem Studienplan entfernen?',
      actionType: 'delete',
      confirmationItem: moduleName,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.store.dispatch(
          ModulePlanningActions.deleteModuleFromSemesterPlan({
            studyPlanId: this.studyPlanId,
            semesterPlanId,
            semesterPlanSemester,
            acronym: moduleAcronym,
            ects,
          })
        );
        this.dialog.closeAll();
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  openDeleteUserGeneratedModuleDialog(
    semesterPlanId: string,
    semesterPlanSemester: string,
    module: UserGeneratedModule
  ) {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Platzhalter wirklich löschen?',
      actionType: 'delete',
      confirmationItem: module.name,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.store.dispatch(
          UserGeneratedModuleActions.deleteUserGeneratedModule({
            studyPlanId: this.studyPlanId,
            semesterPlanId,
            semesterPlanSemester,
            module
          })
        );
        this.dialog.closeAll();
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }

  openDeletePathModuleDialog(
    pathModuleId: string | undefined,
    pathModuleAcronym: string,
    semester: string
  ) {
    // event.stopPropagation();
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Wirklich aus dem Studienverlauf entfernen?',
      actionType: 'delete',
      confirmationItem: pathModuleAcronym,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        if (pathModuleId) {
          this.store.dispatch(StudyPathActions.deleteModuleFromStudyPath({
            id: pathModuleId,
            semester
          }));
        }
        this.dialog.closeAll();
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }
}
