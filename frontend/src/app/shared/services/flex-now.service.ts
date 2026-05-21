import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  concatMap,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';
import { Semester } from '../../../../../interfaces/semester';
import { Consent, User } from '../../../../../interfaces/user';
import {
  getLastConsentByType,
  getSemesterList,
  getUser,
  getUserStudyPath,
} from 'src/app/selectors/user.selectors';
import { RestService } from 'src/app/rest.service';
import {
  FnCompletedCourse,
  FnCompletedModule,
  FnStudyPath,
} from '../../../../../interfaces/fn-user';
import {
  PathCourse,
  PathModule,
  StudyPath,
} from '../../../../../interfaces/study-path';
import { ModulePlanningActions } from 'src/app/actions/study-planning.actions';
import {
  getActiveStudyPlanId,
  getSemesterPlan,
} from 'src/app/selectors/study-planning.selectors';
import { getModules } from 'src/app/selectors/module-overview.selectors';

@Injectable({
  providedIn: 'root',
})
export class FlexnowService {
  lastFlexnowApiConsent$: Observable<Consent | null>;
  lastFlexNowStudypathConsent$: Observable<Consent | null>;
  lastFlexNowGradeConsent$: Observable<Consent | null>;
  currentUser$: Observable<User>;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private rest: RestService,
  ) {
    this.lastFlexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.lastFlexNowStudypathConsent$ = this.store.select(
      getLastConsentByType('upload-exam-data'),
    );
    this.lastFlexNowGradeConsent$ = this.store.select(
      getLastConsentByType('include-grades'),
    );
    this.currentUser$ = this.store.select(getUser);
  }

  triggerFlexNowDataLoading(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    semester?: string,
  ) {
    let semesters$: Observable<Semester[]>;
    let latestConsents$: Observable<{
      flexNowImportConfirmed: boolean;
      studypathConfirmed: boolean;
      gradesConfirmed: boolean;
    }> = this.lastFlexNowGradeConsent$.pipe(
      take(1),
      withLatestFrom(
        this.lastFlexNowStudypathConsent$,
        this.lastFlexNowGradeConsent$,
      ),
      concatMap(([consent, studypathConsent, gradeConsent]) => {
        // if user has already consented, we can skip the consent step
        if (
          consent?.hasConfirmed &&
          studypathConsent?.hasConfirmed &&
          gradeConsent?.hasConfirmed
        ) {
          return of({
            flexNowImportConfirmed: true,
            studypathConfirmed: true,
            gradesConfirmed: true,
          });
        } else {
          return this.openConsentDialog();
        }
      }),
      filter(
        (consent) =>
          consent.flexNowImportConfirmed && consent.studypathConfirmed,
      ),
    );

    if (!semester) {
      semesters$ = this.store
        .select(getSemesterList)
        .pipe(
          map((semesters) =>
            semesters.filter((semester) => !semester.isFutureSemester()),
          ),
        );

      forkJoin({
        consents: latestConsents$,
        selectedSemesters: this.openSemesterSelectionDialog(semesters$),
      })
        .pipe(
          filter((result) => result.selectedSemesters !== null),
          concatMap((result) =>
            this.openOverwriteConfirmationDialog(
              mode,
              result.selectedSemesters,
              result.consents.studypathConfirmed ?? false,
              result.consents.gradesConfirmed ?? false,
            ),
          ),
          takeUntil(this.unsubscribe$),
        )
        .subscribe();
    } else {
      latestConsents$
        .pipe(
          concatMap((consents) =>
            this.openOverwriteConfirmationDialog(
              mode,
              [semester],
              consents.studypathConfirmed ?? false,
              consents.gradesConfirmed ?? false,
            ),
          ),
          takeUntil(this.unsubscribe$),
        )
        .subscribe();
    }
  }

  openConsentDialog(): Observable<{
    flexNowImportConfirmed: boolean;
    studypathConfirmed: boolean;
    gradesConfirmed: boolean;
  }> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
      },
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result.flexNowImportConfirmed) {
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'flexnow-api',
              hasConfirmed: true,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'upload-exam-data',
              hasConfirmed: result.studypathConfirmed ?? false,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'include-grades',
              hasConfirmed: result.gradesConfirmed ?? false,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
        }
      }),
      map((result) => result),
    );
  }

  // only pass in the semesters we need
  openSemesterSelectionDialog(semesters$: Observable<Semester[]>) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Semester wählen',
        dialogContentId: 'select-semester-dialog',
        semesters$: semesters$,
        mode: 'multi',
      },
    });

    return dialogRef
      .afterClosed()
      .pipe(map((result) => (result && result.length > 0 ? result : null)));
  }

  openOverwriteConfirmationDialog(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    semesters: string[],
    studypathConsent: boolean,
    gradeConsent: boolean,
  ): Observable<boolean> {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Ausgewählte Semester mit den FlexNow-Daten überschreiben?',
      actionType: 'overwrite',
      confirmationItem: 'deine ausgewählten Semester',
      confirmButtonLabel: 'Überschreiben',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.updateStudypathWithFlexNowData(
          mode,
          semesters,
          studypathConsent,
          gradeConsent,
        );
        this.dialog.closeAll();
      },
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result) {
          this.updateStudypathWithFlexNowData(
            mode,
            semesters,
            studypathConsent,
            gradeConsent,
          );
        }
      }),
      map((result) => !!result),
    );
  }

  updateStudypathWithFlexNowData(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    semesters: string[],
    studypathConsent: boolean,
    gradeConsent: boolean,
  ) {
    this.getFlexNowData(mode, studypathConsent, gradeConsent, semesters)
      .pipe(take(1))
      .pipe(
        withLatestFrom(
          this.store.select(getSemesterPlan),
          this.store.select(getActiveStudyPlanId),
          this.store.select(getModules),
          this.store.select(getUserStudyPath),
        ),
      )
      .subscribe(
        ([user, semesterPlan, studyPlanId, mhbModules, currentStudypath]) => {
          if (user) {
            let modulesToUpdate: PathModule[] = [];
            // only update the modules of the given semesters
            for (let semester of semesters) {
              // identify completed modules of semester
              const modules = user.studyPath.completedModules.filter(
                (mod) => mod.semester == semester,
              );
              const currentPathModules = currentStudypath.completedModules.filter(
                (mod) => mod.semester == semester
              )
              const moduleAcronyms = modules.map(el => el.acronym);
              // modules, that are not contained in the moduleAcronyms should be deleted
              const oldModules = currentPathModules.filter(mod => !moduleAcronyms.includes(mod.acronym))
              for(let oldModule of oldModules) {
                if(oldModule._id) {
                  this.store.dispatch(StudyPathActions.deleteModuleFromStudyPath({ id: oldModule._id, semester: oldModule.semester }))
                }
              }


              // compare both delete old modules, add new modules and update existing ones
              if (modules.length == 0) {
                break;
              }
              // add new modules (new modules are added automatically in api request)
              modulesToUpdate = modulesToUpdate.concat(modules);

              // check if semester is current -> add modules to semesterplan
              if (semester == new Semester().name && semesterPlan) {
                let userGeneratedModules = [];
                for (let currentModule of modules) {
                  if (!semesterPlan.modules.includes(currentModule.acronym)) {
                    const moduleExistInMhb = mhbModules.find(
                      (mod) => mod.acronym == currentModule.acronym,
                    );
                    if (moduleExistInMhb) {
                      this.store.dispatch(
                        ModulePlanningActions.addModuleToSemester({
                          studyPlanId,
                          semesterPlanId: semesterPlan._id,
                          acronym: currentModule.acronym,
                          ects: currentModule.ects,
                        }),
                      );
                    } else {
                      userGeneratedModules.push(currentModule);
                    }
                  }
                }
                if (userGeneratedModules.length > 0) {
                  this.store.dispatch(
                    ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlans(
                      {
                        modules: userGeneratedModules,
                        semesterName: new Semester().name,
                      },
                    ),
                  );
                }
              }
            }
            // add all modules of current studypath that are not included in the selected semesters
            modulesToUpdate = modulesToUpdate.concat(
              currentStudypath.completedModules.filter(
                (mod) => !semesters.includes(mod.semester),
              ),
            );

            this.store.dispatch(
              StudyPathActions.updateStudyPath({
                completedModules: modulesToUpdate
              }),
            );
          }
        },
      );
  }

  getFlexNowData(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    studypathConsent: boolean,
    gradeConsent: boolean,
    semesters?: string[],
  ): Observable<User | undefined> {
    return this.rest
      .getStudentDataViaFlexNow(studypathConsent, gradeConsent)
      .pipe(
        withLatestFrom(this.currentUser$),
        map(([flexNowOutput, user]) => {
          if (flexNowOutput) {
            let updatedUser = {
              ...user,
            };

            if (
              flexNowOutput.studypath &&
              (mode === 'create-user' || mode === 'update-studypath')
            ) {
              updatedUser = {
                ...updatedUser,
                studyPath: this.extractStudypath(
                  flexNowOutput.studypath,
                  user.studyPath,
                  semesters,
                ),
              };
            }

            if (mode === 'create-user' || mode === 'update-metadata') {
              updatedUser = {
                ...updatedUser,
                ...flexNowOutput.metadata,
              };
            }
            return updatedUser;
          } else {
            return undefined;
          }
        }),
      );
  }

  private extractStudypath(
    fnStudypath: FnStudyPath,
    userStudypath: StudyPath,
    semesters?: string[],
  ): StudyPath {
    if (semesters && userStudypath) {
      // define starting variables
      let completedModules = userStudypath.completedModules;
      let completedCourses = userStudypath.completedCourses;

      // filter modules and courses, that are kept
      completedModules = completedModules.filter(
        (mod) => !semesters.includes(mod.semester),
      );
      completedCourses = completedCourses.filter(
        (course) => !semesters.includes(course.semester),
      );

      let filteredImportedModules = fnStudypath.completedModules.filter((mod) =>
        semesters.includes(new Semester(mod.semester).name),
      );
      let filteredImportedCourses = fnStudypath.completedCourses.filter(
        (course) => semesters.includes(course.semester),
      );

      let studypath = {
        completedModules: [
          ...completedModules,
          ...this.extractCompletedModules(filteredImportedModules),
        ],
        completedCourses: [
          ...completedCourses,
          ...this.extractCompletedCourses(filteredImportedCourses),
        ],
      };
      return studypath;
    } else {
      return {
        completedModules: this.extractCompletedModules(
          fnStudypath.completedModules,
        ),
        completedCourses: this.extractCompletedCourses(
          fnStudypath.completedCourses,
        ),
      };
    }
  }

  private extractCompletedModules(modules: FnCompletedModule[]): PathModule[] {
    return modules.map((fnModule) => {
      let mgId = undefined;
      let moduleGroups = fnModule.moduleGroups;
      // TODO: if more than one Modulegroup set modulegroup to undefined, user need to set it
      if (moduleGroups && moduleGroups.length == 1) {
        mgId = moduleGroups[0].mgId;
      } else {
        console.log(
          moduleGroups.length > 1
            ? 'Too much module groups available'
            : 'No modulegroups available',
        );
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
        grade: fnModule.grade ?? 0,
      };
    });
  }

  private extractCompletedCourses(courses: FnCompletedCourse[]): PathCourse[] {
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
