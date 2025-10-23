import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RestService } from '../rest.service';
import { SnackbarService } from '../shared/services/snackbar.service';
import {
  catchError,
  exhaustMap,
  map,
  concatMap,
  mergeMap,
  switchMap,
  tap,
  take,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { AlertType } from '../shared/classes/alert';
import { UserGeneratedModule } from '../../../../interfaces/usergeneratedmodule';
import {
  ModulePlanningActions,
  UserGeneratedModuleActions,
  SemesterplanActions,
  StudyplanActions,
  CoursePlanningActions,
  TimetableActions,
} from '../actions/study-planning.actions';
import { Store } from '@ngrx/store';
import { getUserStudypath } from '../selectors/user.selectors';
import { PathModule } from '../../../../interfaces/studypath';
import { StudypathActions } from '../actions/user.actions';

@Injectable()
export class StudyPlanningEffects {
  constructor(
    private actions$: Actions,
    private rest: RestService,
    private snackbar: SnackbarService,
    private store: Store,
  ) { }

  /********STUDYPLANS CRUD***********/

  // load studyplans
  loadStudyplans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.loadStudyplans),
      exhaustMap(() =>
        this.rest.getStudyPlans().pipe(
          map((studyplans) =>
            StudyplanActions.loadStudyplansSuccess({ studyplans })
          ),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Die Studienpläne konnten nicht geladen werden!',
            });
            return of(StudyplanActions.loadStudyplansFailure({ error }));
          })
        )
      )
    )
  );

  loadActiveStudyplanId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.loadActiveStudyplan),
      switchMap(() =>
        this.rest.getActiveStudyplan().pipe(
          map((studyplan) =>
            StudyplanActions.loadActiveStudyplanSuccess({ studyplan })
          ),
          catchError((error) =>
            of(StudyplanActions.loadActiveStudyplanFailure(error))
          )
        )
      )
    )
  );

  updateIsPastSemester$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterplanActions.updateIsPastSemester),
      mergeMap((props) =>
        this.rest
          .updateIsPastSemester(
            props.studyplanId,
            props.semesterplanId,
            props.isPast
          )
          .pipe(
            map(() => SemesterplanActions.updateIsPastSemesterSuccess(props)),
            catchError((error) =>
              of(SemesterplanActions.updateIsPastSemesterFailure({ error }))
            )
          )
      )
    )
  );

  // create studyplan
  createStudyplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.createStudyplan),
      switchMap((props) =>
        this.rest.createStudyPlan(props.studyplan).pipe(
          map((studyplan) =>
            StudyplanActions.createStudyplanSuccess({
              studyplan: studyplan,
              semesterPlans: props.semesterPlans,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Der Studienplan wurde erfolgreich angelegt.',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Der Studienplan konnte nicht angelegt werden!',
            });
            return of(StudyplanActions.createStudyplanFailure({ error }));
          })
        )
      )
    )
  );

  // init semesterplans
  initSemesterplans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.createStudyplanSuccess),
      switchMap((props) =>
        this.rest
          .initSemesterplans(props.studyplan._id, props.semesterPlans)
          .pipe(
            map((semesterPlans) =>
              SemesterplanActions.initSemesterplansSuccess({
                studyplanId: props.studyplan._id,
                semesterPlans: semesterPlans,
              })
            ),
            catchError((error) =>
              of(StudyplanActions.createStudyplanFailure({ error }))
            )
          )
      )
    )
  );

  // add semesterplan to studyplan
  addSemesterplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterplanActions.addSemesterplanToStudyplan),
      switchMap((props) =>
        this.rest
          .addSemesterplanToStudyplan(props.studyplanId, props.semester)
          .pipe(
            map((studyplan) =>
              SemesterplanActions.addSemesterplanToStudyplanSuccess({
                studyplanId: props.studyplanId,
                studyplan,
              })
            ),
            catchError((error) =>
              of(
                SemesterplanActions.addSemesterplanToStudyplanFailure({ error })
              )
            )
          )
      )
    )
  );

  // update studyplan
  updateStudyplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.updateStudyplan),
      concatMap((props) =>
        this.rest
          .updateStudyplan(props.studyplanId, props.studyplan)
          .pipe(
            map(() =>
              StudyplanActions.updateStudyplanSuccess({
                studyplanId: props.studyplanId,
                studyplan: props.studyplan,
              })
            ),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Der Studienplan wurde erfolgreich aktualisiert.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Der Studienplan konnte nicht aktualisiert werden!',
              });
              return of(StudyplanActions.updateStudyplanFailure({ error }));
            })
          )
      )
    )
  );

  // delete studyplan
  deleteStudyplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyplanActions.deleteStudyplan),
      mergeMap((props) =>
        this.rest.deleteStudyPlan(props.studyplanId).pipe(
          map(() =>
            StudyplanActions.deleteStudyplanSuccess({
              studyplanId: props.studyplanId,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Dein Studienplan wurde erfolgreich gelöscht.',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              message: 'Studienplan konnte nicht gelöscht werden.',
              type: AlertType.DANGER,
            });
            return of(StudyplanActions.deleteStudyplanFailure({ error }));
          })
        )
      )
    )
  );

  // add module to semesterplan
  addModuleToSemesterplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.addModuleToSemester),
      concatMap((props) =>
        this.rest
          .addModule(
            props.studyplanId,
            props.semesterplanId,
            props.acronym,
            props.ects
          )
          .pipe(
            map(() =>
              ModulePlanningActions.addModuleToSemesterSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                acronym: props.acronym,
                ects: props.ects,
              })
            ),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Das Modul wurde zum Semester hinzugefügt.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message:
                  'Das Modul konnte nicht zum Semester hinzugefügt werden!',
              });
              return of(
                ModulePlanningActions.addModuleToSemesterFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  addModulesToAllStudyplans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyplans),
      switchMap((props) =>
        this.rest
          .addModulesToCurrentSemesterOfAllStudyplans(
            props.modules,
            props.semesterName
          )
          .pipe(
            map((studyplans) =>
              ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyplansSuccess(
                { studyplans }
              )
            ),
            catchError((error) =>
              of(
                ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyplansFailure(
                  { error }
                )
              )
            )
          )
      )
    )
  );

  // transfer module between two semesterplans
  transferModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.transferModule),
      concatMap((props) =>
        this.rest
          .transferModule(
            props.studyplanId,
            props.oldSemesterplanId,
            props.oldSemesterplanSemester,
            props.newSemesterplanId,
            props.newSemesterplanSemester,
            props.acronym,
            props.ects
          )
          .pipe(
            map((result) =>
              ModulePlanningActions.transferModuleSuccess({
                studyplanId: props.studyplanId,
                oldSemesterplan: result.oldSemesterplan,
                oldSemesterplanSemester: props.oldSemesterplanSemester,
                newSemesterplan: result.newSemesterplan,
                newSemesterplanSemester: props.newSemesterplanSemester,
              })
            ),
            tap(() => {
              this.store.select(getUserStudypath).pipe(take(1)).subscribe((sp) => {
                const updatedModules: PathModule[] = [];

                if (props.oldSemesterplanSemester !== '') {
                  const existingModule = sp.completedModules.find(
                    (mod) =>
                      mod.acronym === props.acronym &&
                      mod.semester === props.oldSemesterplanSemester
                  );

                  if (existingModule) {
                    updatedModules.push({
                      ...existingModule,
                      semester: props.newSemesterplanSemester
                    });
                  }
                }
                if (updatedModules.length > 0) {
                  this.store.dispatch(
                    StudypathActions.updateStudypath({
                      completedModules: updatedModules,
                    })
                  );
                }

              });
            }),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Das Modul wurde verschoben.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Das Modul konnte nicht verschoben werden!',
              });
              return of(
                ModulePlanningActions.addModuleToSemesterFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // transfer userGeneratedModule between two semesterplans
  transferUserGeneratedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.transferUserGeneratedModule),
      concatMap((props) =>
        this.rest
          .transferUserGeneratedModule(
            props.studyplanId,
            props.oldSemesterplanId,
            props.newSemesterplanId,
            props.newSemesterplanSemester,
            props.module
          )
          .pipe(
            map((result) =>
              UserGeneratedModuleActions.transferUserGeneratedModuleSuccess({
                studyplanId: props.studyplanId,
                oldSemesterplan: result.oldSemesterplan,
                newSemesterplan: result.newSemesterplan,
              })
            ),
            tap(() => {
              this.store.select(getUserStudypath).pipe(take(1)).subscribe((sp) => {
                const updatedModules: PathModule[] = [];

                const existingModule = sp.completedModules.find(
                  (mod) =>
                    mod._id === props.module._id
                );

                if (existingModule) {
                  updatedModules.push({
                    ...existingModule,
                    semester: props.newSemesterplanSemester
                  });
                }

                if (updatedModules.length > 0) {
                  this.store.dispatch(
                    StudypathActions.updateStudypath({
                      completedModules: updatedModules,
                    })
                  );
                }

              });
            }),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Das Modul wurde verschoben.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Das Modul konnte nicht verschoben werden!',
              });
              return of(
                UserGeneratedModuleActions.transferUserGeneratedModuleFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // delete module from semesterplan
  deleteModuleFromSemesterplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.deleteModuleFromSemesterplan),
      switchMap((props) =>
        this.rest
          .deleteModule(
            props.studyplanId,
            props.semesterplanId,
            props.semesterplanSemester,
            props.acronym,
            props.ects
          )
          .pipe(
            map(() =>
              ModulePlanningActions.deleteModuleFromSemesterplanSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                semesterplanSemester: props.semesterplanSemester,
                acronym: props.acronym,
                ects: props.ects,
              })
            ),
            // also remove in studypath
            tap(() => {
              this.store.select(getUserStudypath).pipe(take(1)).subscribe((sp) => {
                const existingModule = sp.completedModules.find(
                  (mod) =>
                    mod.acronym === props.acronym &&
                    mod.semester === props.semesterplanSemester
                );

                if (existingModule) {
                  this.store.dispatch(
                    StudypathActions.deleteModuleFromStudypath({
                      id: existingModule._id!,
                      semester: props.semesterplanSemester,
                    })
                  );
                }
              });
            }),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Das Modul wurde aus dem Semester entfernt.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Modul konnte nicht entfernt werden!',
              });
              return of(
                ModulePlanningActions.deleteModuleFromSemesterplanFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // aimedECTS
  updateAimedEcts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterplanActions.updateAimedEcts),
      concatMap((props) =>
        this.rest
          .updateAimedEcts(
            props.studyplanId,
            props.semesterplanId,
            props.aimedEcts
          )
          .pipe(
            map(() =>
              SemesterplanActions.updateAimedEctsSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                aimedEcts: props.aimedEcts,
              })
            ),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Ziel-ECTS wurden aktualisiert.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'ECTS konnten nicht aktualisiert werden!',
              });
              return of(SemesterplanActions.updateAimedEctsFailure({ error }));
            })
          )
      )
    )
  );

  // create user generated module
  createUserGeneratedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.createUserGeneratedModule),
      concatMap((props) =>
        this.rest
          .createUserGeneratedModule(
            props.studyplanId,
            props.semesterplanId,
            props.module
          )
          .pipe(
            map((module) =>
              UserGeneratedModuleActions.createUserGeneratedModuleSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                module: module,
              })
            ),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Dein Platzhalter wurde erfolgreich zum Semester hinzugefügt.',
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message:
                  'Platzhalter konnte nicht zum Semester hinzugefügt werden!',
              });
              return of(
                UserGeneratedModuleActions.createUserGeneratedModuleFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // update user generated module
  updateUserGeneratedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.updateUserGeneratedModule),
      concatMap((props) =>
        this.rest
          .updateUserGeneratedModule(
            props.studyplanId,
            props.semesterplanId,
            props.semesterplanSemester,
            props.moduleId,
            props.module
          )
          .pipe(
            map((module: UserGeneratedModule) =>
              UserGeneratedModuleActions.updateUserGeneratedModuleSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                semesterplanSemester: props.semesterplanSemester,
                moduleId: props.moduleId,
                module: module,
              })
            ),
            tap(() => {
              // update studypath too in case the module exists
              this.store.select(getUserStudypath).pipe(take(1)).subscribe((sp) => {
                const existingModule = sp.completedModules.find(
                  (mod) => mod._id === props.moduleId
                );

                if (existingModule) {
                  const updatedModule: PathModule = {
                    ...existingModule,
                    acronym: props.module.acronym ? props.module.acronym : props.module.name,
                    name: props.module.notes ? props.module.notes : props.module.name,
                    ects: props.module.ects,
                    mgId: existingModule.mgId,
                    status: existingModule.status,
                    grade: existingModule.grade,
                    semester: props.semesterplanSemester,
                    isUserGenerated: true,
                    flexNowImported: props.module.flexNowImported,
                  };

                  this.store.dispatch(
                    StudypathActions.updateModuleInStudypath({ module: updatedModule })
                  );
                }
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Platzhalter konnte nicht aktualisiert werden!',
              });
              return of(
                UserGeneratedModuleActions.updateUserGeneratedModuleFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // delete update user generated module
  deleteUserGeneratedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.deleteUserGeneratedModule),
      mergeMap((props) =>
        this.rest
          .deleteUserGeneratedModule(
            props.studyplanId,
            props.semesterplanId,
            props.semesterplanSemester,
            props.module
          )
          .pipe(
            map(() =>
              UserGeneratedModuleActions.deleteUserGeneratedModuleSuccess({
                studyplanId: props.studyplanId,
                semesterplanId: props.semesterplanId,
                semesterplanSemester: props.semesterplanSemester,
                module: props.module,
              })
            ),
            tap(() => {
              this.store.select(getUserStudypath).pipe(take(1)).subscribe((sp) => {
                const existingModule = sp.completedModules.find(
                  (mod) => mod._id === props.module._id
                );

                if (existingModule) {
                  this.store.dispatch(
                    StudypathActions.deleteModuleFromStudypath({
                      id: existingModule._id!,
                      semester: props.semesterplanSemester,
                    })
                  );
                }
              });
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Der Platzhalter konnte nicht entfernt werden!',
              });
              return of(
                UserGeneratedModuleActions.deleteUserGeneratedModuleFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // delete several user generated modules at once
  deleteUserGeneratedModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.deleteUserGeneratedModules),
      mergeMap(({ studyplanId, semesterplanId, moduleIds }) =>
        this.rest.deleteUserGeneratedModules(studyplanId, semesterplanId, moduleIds).pipe(
          map((deletedModules) =>
            UserGeneratedModuleActions.deleteUserGeneratedModulesSuccess({
              studyplanId,
              semesterplanId,
              deletedModules,
            })
          ),
          catchError((error) =>
            of(UserGeneratedModuleActions.deleteUserGeneratedModulesFailure({ error }))
          )
        )
      )
    )
  );

  // Courseplanning Effects
  selectCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursePlanningActions.selectCourse),
      switchMap((props) =>
        this.rest
          .addCourseToSemesterplan(
            props.course.semester,
            {
              id: props.course.id,
              name: props.course.name,
              contributeTo: props.contributeTo ? props.contributeTo : '',
              contributeAs: props.contributeAs ? props.contributeAs : '',
              status: 'open',
              sws: props.sws ? props.sws : props.course.sws,
              ects: props.ects ? props.ects : props.course.ects,
            },
            props.isPastSemester
          )
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltung wurde zum Stundenplan hinzugefügt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterplan({
                courses,
              })
            ),
            catchError((error) =>
              of(CoursePlanningActions.selectCourseFailure({ error }))
            )
          )
      )
    )
  );

  deselectCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursePlanningActions.deselectCourse),
      switchMap((props) =>
        this.rest
          .deleteCourseFromSemesterplan(props.semester, props.courseId)
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltung wurde aus deinem Stundenplan entfernt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterplan({
                courses,
              })
            ),
            catchError((error) =>
              of(CoursePlanningActions.deselectCourseFailure({ error }))
            )
          )
      )
    )
  );

  selectCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursePlanningActions.selectCourses),
      switchMap((props) =>
        this.rest
          .addCoursesToSemesterplan(
            props.semester,
            props.courses,
            props.isPastSemester
          )
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltungen wurden zum Stundenplan hinzugefügt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterplan({
                courses,
              })
            ),
            catchError((error) =>
              of(CoursePlanningActions.selectCoursesFailure({ error }))
            )
          )
      )
    )
  );

  deselectCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoursePlanningActions.deselectCourses),
      switchMap((props) =>
        this.rest
          .deleteCoursesFromSemesterplan(props.semester, props.courseIds)
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltungen wurden aus deinem Stundenplan entfernt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterplan({
                courses,
              })
            ),
            catchError((error) =>
              of(CoursePlanningActions.deselectCoursesFailure({ error }))
            )
          )
      )
    )
  );

  // timetable effects
  importSemesterplan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimetableActions.importSemesterplan),
      switchMap((props) =>
        this.rest
          .updateSemesterplan(
            props.newSemesterplan.semester,
            props.newSemesterplan
          )
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Der Stundenplan wurde erfolgreich eingefügt!',
              });
            }),
            map((semesterplan) =>
              TimetableActions.importSemesterplanSuccess({
                newSemesterplan: semesterplan,
              })
            ),
            catchError((error) =>
              of(TimetableActions.importSemesterplanFailure({ error }))
            )
          )
      )
    )
  );
}
