import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  catchError,
  concatMap,
  filter,
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
import { Semester } from '@interfaces/semester';
import { Consent, User } from '@interfaces/user';
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
} from '@interfaces/fn-user';
import { PathCourse, PathModule, StudyPath } from '@interfaces/study-path';
import { ModulePlanningActions } from 'src/app/actions/study-planning.actions';
import {
  getActiveStudyPlanId,
  getSemesterPlan,
} from 'src/app/selectors/study-planning.selectors';
import { getModules } from 'src/app/selectors/module-overview.selectors';
import { DebugDialogComponent } from '../components/debug-dialog/debug-dialog.component';
import { ModuleHandbookActions } from 'src/app/actions/module-overview.actions';
import { TransformationService } from './transformation.service';
import { SnackbarService } from './snackbar.service';
import { mergeFlexNowModulesIntoMissingModules } from '../helpers/flex-now-merge.helper';

@Injectable({
  providedIn: 'root',
})
export class FlexnowService {
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private rest = inject(RestService);
  private snackbar = inject(SnackbarService);
  private transform = inject(TransformationService);

  lastFlexnowApiConsent$: Observable<Consent | null>;
  lastFlexNowMetaDataConsent$: Observable<Consent | null>;
  lastFlexNowStudypathConsent$: Observable<Consent | null>;
  currentUser$: Observable<User>;
  private unsubscribe$ = new Subject<void>();
  debuggingMode = true;

  constructor() {
    this.lastFlexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api'),
    );
    this.lastFlexNowMetaDataConsent$ = this.store.select(
      getLastConsentByType('upload-meta-data'),
    );
    this.lastFlexNowStudypathConsent$ = this.store.select(
      getLastConsentByType('upload-exam-data'),
    );
    this.currentUser$ = this.store.select(getUser);
  }

  flexNowImportEnabled(user: User): boolean {
    //if user is admin -> true
    if (user.roles.includes('admin')) {
      return true;
    }
    //if user is student but no local account
    if (user.authType !== 'local' && user.roles.includes('student')) {
      return true;
    }
    // all other cases return false
    return false;
  }

  triggerFlexNowDataLoading(
    mode: 'update-user' | 'update-studypath' | 'update-metadata',
    semester?: string,
  ) {
    let semesters$: Observable<Semester[]> = this.store
      .select(getSemesterList)
      .pipe(
        map((semesters) =>
          semesters.filter((semester) => !semester.isFutureSemester()),
        ),
      );
    switch (mode) {
      case 'update-user':
        this.getLatestConsents(false, false)
          .pipe(
            filter((consent) => !!consent),
            concatMap((consents) => {
              if (consents.studypathConfirmed) {
                return this.openSemesterSelectionDialog(semesters$).pipe(
                  map((semesters) => ({ consents, semesters })),
                );
              } else {
                return of({
                  consents,
                  semesters: [],
                });
              }
            }),
            filter(({ semesters }) => {
              return semesters != null;
            }),
            concatMap(({ consents, semesters }) => {
              if (semesters && semesters.length > 0) {
                // case if studypath should be updated
                return this.openOverwriteConfirmationDialog(
                  mode,
                  consents.flexNowImportConfirmed,
                  consents.metadataConfirmed,
                  consents.studypathConfirmed,
                  semesters,
                );
              } else {
                // case if only metadata should be updated
                return this.getFlexNowData(
                  'update-metadata',
                  consents.studypathConfirmed,
                );
              }
            }),
            takeUntil(this.unsubscribe$),
          )
          .subscribe((result) => {
            // case if only metadata should be updated
            if (typeof result == 'object') {
              this.store.dispatch(UserActions.updateUser({ user: result }));
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
            }
          });
        break;
      case 'update-metadata':
        // case if user only wants to update metadata in profile
        this.getLatestConsents(true, false)
          .pipe(
            concatMap((consent) =>
              this.getFlexNowData(
                'update-metadata',
                consent.studypathConfirmed,
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
          latestConsents$
            .pipe(
              filter((consent) => !!consent),
              concatMap((consents) =>
                this.openSemesterSelectionDialog(semesters$).pipe(
                  map((semesters) => ({ consents, semesters })),
                ),
              ),
              filter(({ semesters }) => semesters != null),
              concatMap(({ consents, semesters }) =>
                this.openOverwriteConfirmationDialog(
                  mode,
                  consents.flexNowImportConfirmed,
                  consents.metadataConfirmed,
                  consents.studypathConfirmed,
                  semesters,
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
  }> {
    return this.lastFlexnowApiConsent$.pipe(
      take(1),
      withLatestFrom(
        this.lastFlexNowMetaDataConsent$,
        this.lastFlexNowStudypathConsent$,
      ),
      concatMap(
        ([consent, metadataConsent, studypathConsent]) => {
          // check only metadata consent
          if (onlyMetaData) {
            if (consent?.hasConfirmed && metadataConsent?.hasConfirmed) {
              return of({
                flexNowImportConfirmed: true,
                metadataConfirmed: true,
                studypathConfirmed: false,
              });
            }
          }
          // check only studypath consents
          if (onlyStudyPath) {
            if (
              consent?.hasConfirmed &&
              studypathConsent?.hasConfirmed
            ) {
              return of({
                flexNowImportConfirmed: true,
                metadataConfirmed: false,
                studypathConfirmed: true
              });
            }
          }
          // if user has already consented, we can skip the consent step
          if (
            consent?.hasConfirmed &&
            metadataConsent?.hasConfirmed &&
            studypathConsent?.hasConfirmed
          ) {
            return of({
              flexNowImportConfirmed: true,
              metadataConfirmed: true,
              studypathConfirmed: true
            });
          }
          return this.openConsentDialog(onlyMetaData, onlyStudyPath);
        },
      ),
      filter((consent) => {
        if (typeof consent == 'object') {
          if (onlyMetaData) {
            return consent.flexNowImportConfirmed && consent.metadataConfirmed;
          }
          if (onlyStudyPath) {
            return consent.flexNowImportConfirmed && consent.studypathConfirmed;
          }
          return consent.flexNowImportConfirmed;
        } else {
          return consent;
        }
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
  }> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
        onlyMetaData,
        onlyStudypath,
      },
    });

    return dialogRef.afterClosed();
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
    semesters: string[],
  ): Observable<boolean> {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: $localize `${semesters.length > 0 ? 'Ausgewählte ' : 'Alle '} Semester mit den FlexNow-Daten überschreiben?`,
      actionType: 'overwrite',
      confirmationItem: $localize `deine ${semesters.length > 0 ? 'ausgewählten' : ''} Semester`,
      confirmButtonLabel: $localize `Überschreiben`,
      cancelButtonLabel: $localize `Abbrechen`,
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
          if (mode !== 'update-studypath') {
            this.store.dispatch(
              UserActions.addConsent({
                ctype: 'upload-meta-data',
                hasConfirmed: metadataConsent,
                hasResponded: true,
                timestamp: new Date(),
              }),
            );
          }
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'upload-exam-data',
              hasConfirmed: studypathConsent,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
        }
        this.updateStudypathWithFlexNowData(
          mode,
          studypathConsent,
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
    semesters: string[],
  ) {
    this.getFlexNowData(mode, studypathConsent, semesters)
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
        ([importedUser, semesterPlan, studyPlanId, mhbModules, currentStudypath]) => {
          if (importedUser) {
            if (mode == 'update-user') {
              this.store.dispatch(UserActions.updateUser({ user: importedUser }));
            }

            let modulesToUpdate: PathModule[] = [];
            // only update the modules of the given semesters
            for (let semester of semesters) {
              // identify imported completed modules of semester
              const modules = importedUser.studyPath.completedModules.filter(
                (mod) => mod.semester == semester,
              );

              // identify current completed modules of semester
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
                continue;
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
    semesters?: string[],
  ): Observable<User | undefined> {
    if(mode !== 'create-user') {
      this.snackbar.openLoaderSnackbar('Deine FlexNow-Daten werden geladen.')
    }
    return this.rest
      .getStudentDataViaFlexNow(studypathConsent)
      .pipe(
        withLatestFrom(this.currentUser$, this.store.select(getModules)),
        map(([flexNowOutput, user, mhbModules]) => {

          if (this.debuggingMode && mode == 'update-studypath') {
            this.dialog.open(DebugDialogComponent, {
              data: flexNowOutput,
            });
          }

          if (flexNowOutput) {
            let updatedUser = {
              ...user,
            };

            if (flexNowOutput.studypath && mode !== 'update-metadata') {
              const mhbAcronyms = new Set(mhbModules.map((mod) => mod.acronym));
              updatedUser = {
                ...updatedUser,
                studyPath: this.extractStudypath(
                  flexNowOutput.studypath,
                  user.studyPath,
                  mhbAcronyms,
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

            const currentSp = updatedUser.sps?.filter(
              (el) => el.status == 'Immatrikuliert',
            )[0];
            if (currentSp) {
              this.store.dispatch(
                ModuleHandbookActions.loadModuleHandbook({
                  id: currentSp.mhbId,
                  version: currentSp.mhbVersion,
                }),
              );
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
    mhbAcronyms: Set<string>,
    semesters?: string[],
  ): StudyPath {
    // define starting variables
    let completedModules = userStudypath.completedModules;
    let completedCourses = userStudypath.completedCourses;

    if (semesters && semesters.length > 0 && userStudypath) {
      // filter modules and courses, that are kept
      completedModules = completedModules.filter(
        (mod) => !semesters.includes(mod.semester) || !mod.flexNowImported,
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
        completedModules: this.extractCompletedModules(completedModules, filteredImportedModules, mhbAcronyms),
        completedCourses: [
          ...completedCourses,
          ...this.extractCompletedCourses(filteredImportedCourses),
        ],
      };

      return studypath;
    } else {
      // filter modules and courses, that are kept
      completedModules = completedModules.filter(
        (mod) => !mod.flexNowImported,
      );
      return {
        completedModules: this.extractCompletedModules(completedModules, fnStudypath.completedModules, mhbAcronyms),
        completedCourses: this.extractCompletedCourses(
          fnStudypath.completedCourses,
        ),
      };
    }
  }

  // matching mirrors the backend's findMatchingModuleIndex (plan-helper.ts) via the shared
  // helper: ID first, then acronym + semester. A manual placeholder whose free-text acronym
  // differs from FlexNow's is kept next to the imported module instead of merged into it.
  private extractCompletedModules(
    modulesToKeep: PathModule[],
    modules: FnCompletedModule[],
    mhbAcronyms: Set<string>,
  ): PathModule[] {
    const flexNowImportedModules = this.mapFnModulesToPathModules(modules);
    const { merged } = mergeFlexNowModulesIntoMissingModules(
      modulesToKeep,
      flexNowImportedModules,
      mhbAcronyms,
    );
    return merged;
  }

  private mapFnModulesToPathModules(modules: FnCompletedModule[]): PathModule[] {
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

      const examAttempts = this.transform.transformExamAttempts(fnModule);

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
        examAttempts: examAttempts,
      };
    });
  }

  // read-only fetch for a single semester ("Mit FlexNow abgleichen" in the
  // finish-semester-stepper): no overwrite dialog, no store writes. Returns null on
  // failure so the caller can show its own error state.
  getFlexNowDataForSemester(semester: string): Observable<PathModule[] | null> {
    return this.rest.getStudentDataViaFlexNow(true).pipe(
      map((flexNowOutput) => {
        if (!flexNowOutput?.studypath) {
          return [];
        }
        const modulesOfSemester = flexNowOutput.studypath.completedModules.filter(
          (mod) => new Semester(mod.semester).name === semester,
        );
        return this.mapFnModulesToPathModules(modulesOfSemester);
      }),
      catchError(() => of(null)),
    );
  }

  // consent check for the read-only abgleich, without the "Semester überschreiben?" dialog.
  // Persists the consent once granted, like openOverwriteConfirmationDialog does.
  ensureStudypathReadConsent(): Observable<boolean> {
    return this.getLatestConsents(false, true).pipe(
      map((consents) => consents.flexNowImportConfirmed && consents.studypathConfirmed),
      tap((granted) => {
        if (granted) {
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
              hasConfirmed: true,
              hasResponded: true,
              timestamp: new Date(),
            }),
          );
        }
      }),
      catchError(() => of(false)),
    );
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
