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
import { UserGeneratedModule } from '../../../../interfaces/user-generated-module';
import {
  ModulePlanningActions,
  UserGeneratedModuleActions,
  SemesterPlanActions,
  StudyPlanActions,
  CoursePlanningActions,
  TimetableActions,
} from '../actions/study-planning.actions';
import { Store } from '@ngrx/store';
import { getUserStudyPath } from '../selectors/user.selectors';
import { PathModule } from '../../../../interfaces/study-path';
import { StudyPathActions } from '../actions/user.actions';

@Injectable()
export class StudyPlanningEffects {
  constructor(
    private actions$: Actions,
    private rest: RestService,
    private snackbar: SnackbarService,
    private store: Store,
  ) { }

  /********STUDYPLANS CRUD***********/

  // load study plans
  loadStudyPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.loadStudyPlans),
      exhaustMap(() =>
        this.rest.getStudyPlans().pipe(
          map((studyPlans) =>
            StudyPlanActions.loadStudyPlansSuccess({ studyPlans })
          ),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Die Studienpläne konnten nicht geladen werden!',
            });
            return of(StudyPlanActions.loadStudyPlansFailure({ error }));
          })
        )
      )
    )
  );

  loadActiveStudyPlanId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.loadActiveStudyPlan),
      switchMap(() =>
        this.rest.getActiveStudyPlan().pipe(
          map((studyPlan) =>
            StudyPlanActions.loadActiveStudyPlanSuccess({ studyPlan })
          ),
          catchError((error) =>
            of(StudyPlanActions.loadActiveStudyPlanFailure(error))
          )
        )
      )
    )
  );

  updateIsPastSemester$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterPlanActions.updateIsPastSemester),
      mergeMap((props) =>
        this.rest
          .updateIsPastSemester(
            props.studyPlanId,
            props.semesterPlanId,
            props.isPast
          )
          .pipe(
            map(() => SemesterPlanActions.updateIsPastSemesterSuccess(props)),
            catchError((error) =>
              of(SemesterPlanActions.updateIsPastSemesterFailure({ error }))
            )
          )
      )
    )
  );

  // create study plan
  createStudyPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.createStudyPlan),
      switchMap((props) =>
        this.rest.createStudyPlan(props.studyPlan).pipe(
          map((studyPlan) =>
            StudyPlanActions.createStudyPlanSuccess({
              studyPlan: studyPlan,
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
            return of(StudyPlanActions.createStudyPlanFailure({ error }));
          })
        )
      )
    )
  );

  // init semester plans
  initSemesterPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.createStudyPlanSuccess),
      switchMap((props) =>
        this.rest
          .initSemesterPlans(props.studyPlan._id, props.semesterPlans)
          .pipe(
            map((semesterPlans) =>
              SemesterPlanActions.initSemesterPlansSuccess({
                studyPlanId: props.studyPlan._id,
                semesterPlans: semesterPlans,
              })
            ),
            catchError((error) =>
              of(StudyPlanActions.createStudyPlanFailure({ error }))
            )
          )
      )
    )
  );

  // add semester plan to study plan
  addSemesterPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterPlanActions.addSemesterPlanToStudyPlan),
      switchMap((props) =>
        this.rest
          .addSemesterPlanToStudyPlan(props.studyPlanId, props.semester)
          .pipe(
            map((studyPlan) =>
              SemesterPlanActions.addSemesterPlanToStudyPlanSuccess({
                studyPlanId: props.studyPlanId,
                studyPlan,
              })
            ),
            catchError((error) =>
              of(
                SemesterPlanActions.addSemesterPlanToStudyPlanFailure({ error })
              )
            )
          )
      )
    )
  );

  // update study plan
  updateStudyPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.updateStudyPlan),
      concatMap((props) =>
        this.rest
          .updateStudyPlan(props.studyPlanId, props.studyPlan)
          .pipe(
            map(() =>
              StudyPlanActions.updateStudyPlanSuccess({
                studyPlanId: props.studyPlanId,
                studyPlan: props.studyPlan,
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
              return of(StudyPlanActions.updateStudyPlanFailure({ error }));
            })
          )
      )
    )
  );

  // delete study plan
  deleteStudyPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPlanActions.deleteStudyPlan),
      mergeMap((props) =>
        this.rest.deleteStudyPlan(props.studyPlanId).pipe(
          map(() =>
            StudyPlanActions.deleteStudyPlanSuccess({
              studyPlanId: props.studyPlanId,
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
            return of(StudyPlanActions.deleteStudyPlanFailure({ error }));
          })
        )
      )
    )
  );

  // add module to semester plan
  addModuleToSemesterPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.addModuleToSemester),
      concatMap((props) =>
        this.rest
          .addModule(
            props.studyPlanId,
            props.semesterPlanId,
            props.acronym,
            props.ects
          )
          .pipe(
            map(() =>
              ModulePlanningActions.addModuleToSemesterSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
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

  addModulesToAllStudyPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlans),
      switchMap((props) =>
        this.rest
          .addModulesToCurrentSemesterOfAllStudyPlans(
            props.modules,
            props.semesterName
          )
          .pipe(
            map((studyPlans) =>
              ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlansSuccess(
                { studyPlans }
              )
            ),
            catchError((error) =>
              of(
                ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlansFailure(
                  { error }
                )
              )
            )
          )
      )
    )
  );

  // transfer module between two semester plans
  transferModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.transferModule),
      concatMap((props) =>
        this.rest
          .transferModule(
            props.studyPlanId,
            props.oldSemesterPlanId,
            props.oldSemesterPlanSemester,
            props.newSemesterPlanId,
            props.newSemesterPlanSemester,
            props.acronym,
            props.ects
          )
          .pipe(
            map((result) =>
              ModulePlanningActions.transferModuleSuccess({
                studyPlanId: props.studyPlanId,
                oldSemesterPlan: result.oldSemesterPlan,
                oldSemesterPlanSemester: props.oldSemesterPlanSemester,
                newSemesterPlan: result.newSemesterPlan,
                newSemesterPlanSemester: props.newSemesterPlanSemester,
              })
            ),
            tap(() => {
              this.store.select(getUserStudyPath).pipe(take(1)).subscribe((sp) => {
                const updatedModules: PathModule[] = [];

                if (props.oldSemesterPlanSemester !== '') {
                  const existingModule = sp.completedModules.find(
                    (mod) =>
                      mod.acronym === props.acronym &&
                      mod.semester === props.oldSemesterPlanSemester
                  );

                  if (existingModule) {
                    updatedModules.push({
                      ...existingModule,
                      semester: props.newSemesterPlanSemester
                    });
                  }
                }
                if (updatedModules.length > 0) {
                  this.store.dispatch(
                    StudyPathActions.updateStudyPath({
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

  // transfer userGeneratedModule between two semester plans
  transferUserGeneratedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserGeneratedModuleActions.transferUserGeneratedModule),
      concatMap((props) =>
        this.rest
          .transferUserGeneratedModule(
            props.studyPlanId,
            props.oldSemesterPlanId,
            props.newSemesterPlanId,
            props.newSemesterPlanSemester,
            props.module
          )
          .pipe(
            map((result) =>
              UserGeneratedModuleActions.transferUserGeneratedModuleSuccess({
                studyPlanId: props.studyPlanId,
                oldSemesterPlan: result.oldSemesterPlan,
                newSemesterPlan: result.newSemesterPlan,
              })
            ),
            tap(() => {
              this.store.select(getUserStudyPath).pipe(take(1)).subscribe((sp) => {
                const updatedModules: PathModule[] = [];

                const existingModule = sp.completedModules.find(
                  (mod) =>
                    mod._id === props.module._id
                );

                if (existingModule) {
                  updatedModules.push({
                    ...existingModule,
                    semester: props.newSemesterPlanSemester
                  });
                }

                if (updatedModules.length > 0) {
                  this.store.dispatch(
                    StudyPathActions.updateStudyPath({
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

  // delete module from semester plan
  deleteModuleFromSemesterPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModulePlanningActions.deleteModuleFromSemesterPlan),
      switchMap((props) =>
        this.rest
          .deleteModule(
            props.studyPlanId,
            props.semesterPlanId,
            props.semesterPlanSemester,
            props.acronym,
            props.ects
          )
          .pipe(
            map(() =>
              ModulePlanningActions.deleteModuleFromSemesterPlanSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
                semesterPlanSemester: props.semesterPlanSemester,
                acronym: props.acronym,
                ects: props.ects,
              })
            ),
            // also remove in study path
            tap(() => {
              this.store.select(getUserStudyPath).pipe(take(1)).subscribe((sp) => {
                const existingModule = sp.completedModules.find(
                  (mod) =>
                    mod.acronym === props.acronym &&
                    mod.semester === props.semesterPlanSemester
                );

                if (existingModule) {
                  this.store.dispatch(
                    StudyPathActions.deleteModuleFromStudyPath({
                      id: existingModule._id!,
                      semester: props.semesterPlanSemester,
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
                ModulePlanningActions.deleteModuleFromSemesterPlanFailure({
                  error,
                })
              );
            })
          )
      )
    )
  );

  // aimedEcts
  updateAimedEcts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SemesterPlanActions.updateAimedEcts),
      concatMap((props) =>
        this.rest
          .updateAimedEcts(
            props.studyPlanId,
            props.semesterPlanId,
            props.aimedEcts
          )
          .pipe(
            map(() =>
              SemesterPlanActions.updateAimedEctsSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
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
              return of(SemesterPlanActions.updateAimedEctsFailure({ error }));
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
            props.studyPlanId,
            props.semesterPlanId,
            props.module
          )
          .pipe(
            map((module) =>
              UserGeneratedModuleActions.createUserGeneratedModuleSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
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
            props.studyPlanId,
            props.semesterPlanId,
            props.semesterPlanSemester,
            props.moduleId,
            props.module
          )
          .pipe(
            map((module: UserGeneratedModule) =>
              UserGeneratedModuleActions.updateUserGeneratedModuleSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
                semesterPlanSemester: props.semesterPlanSemester,
                moduleId: props.moduleId,
                module: module,
              })
            ),
            tap(() => {
              // update study path too in case the module exists
              this.store.select(getUserStudyPath).pipe(take(1)).subscribe((sp) => {
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
                    semester: props.semesterPlanSemester,
                    isUserGenerated: true,
                    flexNowImported: props.module.flexNowImported,
                  };

                  this.store.dispatch(
                    StudyPathActions.updateModuleInStudyPath({ module: updatedModule })
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
            props.studyPlanId,
            props.semesterPlanId,
            props.semesterPlanSemester,
            props.module
          )
          .pipe(
            map(() =>
              UserGeneratedModuleActions.deleteUserGeneratedModuleSuccess({
                studyPlanId: props.studyPlanId,
                semesterPlanId: props.semesterPlanId,
                semesterPlanSemester: props.semesterPlanSemester,
                module: props.module,
              })
            ),
            tap(() => {
              this.store.select(getUserStudyPath).pipe(take(1)).subscribe((sp) => {
                const existingModule = sp.completedModules.find(
                  (mod) => mod._id === props.module._id
                );

                if (existingModule) {
                  this.store.dispatch(
                    StudyPathActions.deleteModuleFromStudyPath({
                      id: existingModule._id!,
                      semester: props.semesterPlanSemester,
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
      mergeMap(({ studyPlanId, semesterPlanId, moduleIds }) =>
        this.rest.deleteUserGeneratedModules(studyPlanId, semesterPlanId, moduleIds).pipe(
          map((deletedModules) =>
            UserGeneratedModuleActions.deleteUserGeneratedModulesSuccess({
              studyPlanId,
              semesterPlanId,
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
          .addCourseToSemesterPlan(
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
              CoursePlanningActions.updateCoursesArrayInSemesterPlan({
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
          .deleteCourseFromSemesterPlan(props.semester, props.courseId)
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltung wurde aus deinem Stundenplan entfernt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterPlan({
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
          .addCoursesToSemesterPlan(
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
              CoursePlanningActions.updateCoursesArrayInSemesterPlan({
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
          .deleteCoursesFromSemesterPlan(props.semester, props.courseIds)
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message:
                  'Die Lehrveranstaltungen wurden aus deinem Stundenplan entfernt.',
              });
            }),
            map((courses) =>
              CoursePlanningActions.updateCoursesArrayInSemesterPlan({
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
  importSemesterPlan$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimetableActions.importSemesterPlan),
      switchMap((props) =>
        this.rest
          .updateSemesterPlan(
            props.newSemesterPlan.semester,
            props.newSemesterPlan
          )
          .pipe(
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Der Stundenplan wurde erfolgreich eingefügt!',
              });
            }),
            map((semesterPlan) =>
              TimetableActions.importSemesterPlanSuccess({
                newSemesterPlan: semesterPlan,
              })
            ),
            catchError((error) =>
              of(TimetableActions.importSemesterPlanFailure({ error }))
            )
          )
      )
    )
  );
}
