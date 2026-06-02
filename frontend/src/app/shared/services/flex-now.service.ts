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
import { DebugDialogComponent } from '../components/debug-dialog/debug-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class FlexnowService {
  lastFlexnowApiConsent$: Observable<Consent | null>;
  lastFlexNowMetaDataConsent$: Observable<Consent | null>;
  lastFlexNowStudypathConsent$: Observable<Consent | null>;
  lastFlexNowGradeConsent$: Observable<Consent | null>;
  currentUser$: Observable<User>;
  private unsubscribe$ = new Subject<void>();
  debuggingMode = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private rest: RestService,
  ) {
    this.lastFlexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.lastFlexNowMetaDataConsent$ = this.store.select(
      getLastConsentByType('upload-meta-data'),
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
    mode: 'update-user' | 'update-studypath' | 'update-metadata',
    semester?: string,
  ) {
    let semesters$: Observable<Semester[]>;

    switch (mode) {
      case 'update-user':
        // case if user is initalized or updated via user settings
        this.getLatestConsents(false, false)
          .pipe(
            concatMap((consent) =>
              this.openOverwriteConfirmationDialog(
                'update-user',
                consent.flexNowImportConfirmed,
                consent.metadataConfirmed,
                consent.studypathConfirmed,
                consent.gradesConfirmed,
                [],
              ),
            ),
          )
          .subscribe();
        break;
      case 'update-metadata':
        // case if user only wants to update metadata in profile
        this.getLatestConsents(true, false)
          .pipe(
            concatMap((consent) =>
              this.getFlexNowData(
                'update-metadata',
                consent.studypathConfirmed,
                consent.gradesConfirmed,
              ),
            ),
            filter((user) => !!user),
            takeUntil(this.unsubscribe$),
          )
          .subscribe((user) => {
            this.store.dispatch(UserActions.updateUser({ user }));
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
                ctype: 'upload-meta-data',
                hasConfirmed: true,
                hasResponded: true,
                timestamp: new Date(),
              }),
            );
          });
        break;
      case 'update-studypath':
        // case if user wants to update studypath in studyplan
        const latestConsents$ = this.getLatestConsents(false, true);
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
                  result.consents.flexNowImportConfirmed,
                  result.consents.metadataConfirmed,
                  result.consents.studypathConfirmed,
                  result.consents.gradesConfirmed,
                  result.selectedSemesters,
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
                  consents.flexNowImportConfirmed,
                  consents.metadataConfirmed,
                  consents.studypathConfirmed,
                  consents.gradesConfirmed,
                  [semester],
                ),
              ),
              takeUntil(this.unsubscribe$),
            )
            .subscribe();
        }
        break;
    }
  }

  private getLatestConsents(
    onlyMetaData: boolean,
    onlyStudyPath: boolean,
  ): Observable<{
    flexNowImportConfirmed: boolean;
    metadataConfirmed: boolean;
    studypathConfirmed: boolean;
    gradesConfirmed: boolean;
  }> {
    return this.lastFlexnowApiConsent$.pipe(
      take(1),
      withLatestFrom(
        this.lastFlexNowMetaDataConsent$,
        this.lastFlexNowStudypathConsent$,
        this.lastFlexNowGradeConsent$,
      ),
      concatMap(
        ([consent, metadataConsent, studypathConsent, gradeConsent]) => {
          // check only metadata consent
          if (onlyMetaData) {
            if (consent?.hasConfirmed && metadataConsent?.hasConfirmed) {
              return of({
                flexNowImportConfirmed: true,
                metadataConfirmed: true,
                studypathConfirmed: false,
                gradesConfirmed: false,
              });
            }
          }
          // check only studypath consents
          if (onlyStudyPath) {
            if (
              consent?.hasConfirmed &&
              studypathConsent?.hasConfirmed &&
              gradeConsent?.hasConfirmed
            ) {
              return of({
                flexNowImportConfirmed: true,
                metadataConfirmed: false,
                studypathConfirmed: true,
                gradesConfirmed: true,
              });
            }
          }
          // if user has already consented, we can skip the consent step
          if (
            consent?.hasConfirmed &&
            metadataConsent?.hasConfirmed &&
            studypathConsent?.hasConfirmed &&
            gradeConsent?.hasConfirmed
          ) {
            return of({
              flexNowImportConfirmed: true,
              metadataConfirmed: true,
              studypathConfirmed: true,
              gradesConfirmed: true,
            });
          }
          return this.openConsentDialog(onlyMetaData, onlyStudyPath);
        },
      ),
      filter((consent) => {
        if (onlyMetaData) {
          return consent.flexNowImportConfirmed && consent.metadataConfirmed;
        }
        if (onlyStudyPath) {
          return consent.flexNowImportConfirmed && consent.studypathConfirmed;
        }
        return consent.flexNowImportConfirmed;
      }),
    );
  }

  openConsentDialog(
    onlyMetaData: boolean,
    onlyStudypath: boolean,
  ): Observable<{
    flexNowImportConfirmed: boolean;
    metadataConfirmed: boolean;
    studypathConfirmed: boolean;
    gradesConfirmed: boolean;
  }> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
        onlyMetaData,
        onlyStudypath,
      },
    });

    return dialogRef.afterClosed().pipe(map((result) => result));
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
    mode: 'update-user' | 'update-studypath' | 'update-metadata',
    flexNowApiConsent: boolean,
    metadataConsent: boolean,
    studypathConsent: boolean,
    gradeConsent: boolean,
    semesters: string[],
  ): Observable<boolean> {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: `${semesters.length > 0 ? 'Ausgewählte ' : 'Alle '} Semester mit den FlexNow-Daten überschreiben?`,
      actionType: 'overwrite',
      confirmationItem: `deine ${semesters.length > 0 ? 'ausgewählten' : ''} Semester`,
      confirmButtonLabel: 'Überschreiben',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.dialog.closeAll();
        if (flexNowApiConsent) {
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
              ctype: 'upload-meta-data',
              hasConfirmed: metadataConsent,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'upload-exam-data',
              hasConfirmed: studypathConsent,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'include-grades',
              hasConfirmed: gradeConsent,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
        }
        this.updateStudypathWithFlexNowData(
          mode,
          studypathConsent,
          gradeConsent,
          semesters,
        );
      },
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });

    return dialogRef.afterClosed().pipe(map((result) => !!result));
  }

  updateStudypathWithFlexNowData(
    mode: 'update-user' | 'update-studypath' | 'update-metadata',
    studypathConsent: boolean,
    gradeConsent: boolean,
    semesters: string[],
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
              const currentPathModules =
                currentStudypath.completedModules.filter(
                  (mod) => mod.semester == semester,
                );
              const moduleAcronyms = modules.map((el) => el.acronym);
              // modules, that are not contained in the moduleAcronyms should be deleted
              const oldModules = currentPathModules.filter(
                (mod) => !moduleAcronyms.includes(mod.acronym),
              );
              for (let oldModule of oldModules) {
                if (oldModule._id) {
                  this.store.dispatch(
                    StudyPathActions.deleteModuleFromStudyPath({
                      id: oldModule._id,
                      semester: oldModule.semester,
                    }),
                  );
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
                completedModules: modulesToUpdate,
              }),
            );
          }
        },
      );
  }

  getFlexNowData(
    mode:
      | 'create-user'
      | 'update-user'
      | 'update-studypath'
      | 'update-metadata',
    studypathConsent: boolean,
    gradeConsent: boolean,
    semesters?: string[],
  ): Observable<User | undefined> {
    return this.rest
      .getStudentDataViaFlexNow(studypathConsent, gradeConsent)
      .pipe(
        withLatestFrom(this.currentUser$),
        map(([flexNowOutput, user]) => {
          if (this.debuggingMode) {
            this.dialog.open(DebugDialogComponent, {
              data: flexNowOutput,
            });
          }

          if (flexNowOutput) {
            let updatedUser = {
              ...user,
            };

            if (flexNowOutput.studypath && mode !== 'update-metadata') {
              updatedUser = {
                ...updatedUser,
                studyPath: this.extractStudypath(
                  flexNowOutput.studypath,
                  user.studyPath,
                  semesters,
                ),
              };
            }

            if (mode !== 'update-studypath') {
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
    if (semesters && semesters.length > 0 && userStudypath) {
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
