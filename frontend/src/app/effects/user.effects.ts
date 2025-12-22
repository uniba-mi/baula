import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RestService } from '../rest.service';
import { AlertType } from '../shared/classes/alert';
import { SnackbarService } from '../shared/services/snackbar.service';
import {
  StudyPathActions,
  UserActions,
  DashboardActions,
  FavoriteModulesActions,
  CompetenceAimsActions,
  ExcludedModulesActions,
  ExcludedModuleActions,
  TimetableActions,
  JobActions,
} from '../actions/user.actions';
import { Router } from '@angular/router';
import { User } from '../../../../interfaces/user';
import { getStudyPlans } from '../selectors/study-planning.selectors';
import { Store } from '@ngrx/store';
import { SemesterPlanActions } from '../actions/study-planning.actions';
import { RecsRestService } from '../modules/recommendations/recs-rest.service';

@Injectable()
export class UserEffects {
  checkUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.checkUserData),
      switchMap(() =>
        this.rest.getSingleUser().pipe(
          map((user) => UserActions.checkUserDataSuccess({ user })),
          catchError((error) => of(UserActions.checkUserDataFailure(error)))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap((props) =>
        this.rest.updateUser(props.user).pipe(
          map((user: User) =>
            UserActions.updateUserSuccess({
              user,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Nutzereinstellungen erfolgreich aktualisiert.',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Nutzereinstellungen konnten nicht gespeichert werden!',
            });
            return of(UserActions.updateUserFailure({ error }));
          })
        )
      )
    )
  );

  updateModuleInStudyPath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.updateModuleInStudyPath),
      switchMap((props) =>
        this.rest.updateModuleInStudyPath(props.module).pipe(
          map((studyPath) =>
            StudyPathActions.updateModuleInStudyPathSuccess({ studyPath })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Modul wurde aktualisiert',
            });
          }),
          catchError((error) =>
            of(StudyPathActions.updateModuleInStudyPathFailure(error))
          )
        )
      )
    )
  );

  updateStudyPath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.updateStudyPath),
      concatMap((props) =>
        this.rest.updateStudyPath(props.completedModules).pipe(
          map((studyPath) =>
            StudyPathActions.updateStudyPathSuccess({ studyPath })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Modul(e) wurden aktualisiert',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Modul(e) konnten nicht aktualisiert werden.',
            });
            return of(StudyPathActions.updateStudyPathFailure({ error }));
          })
        )
      )
    )
  );

  finishSemester$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.finishSemester),
      concatMap((props) =>
        this.rest.finishSemester(props.completedModules, props.droppedModules, props.semester).pipe(
          map((studyPath) =>
            StudyPathActions.finishSemesterSuccess({ studyPath, semester: props.semester })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Semester wurde abgeschlossen',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Semester konnte nicht abgeschlossen werden.',
            });
            return of(StudyPathActions.finishSemesterFailure({ error }));
          })
        )
      )
    )
  );

  // updates is past property of semester plans after finish semester was successful
  updateIsPastOfAllSemesterPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.finishSemesterSuccess),
      concatMap(({ semester }) =>
        this.store.select(getStudyPlans).pipe(
          take(1),
          mergeMap((studyPlans) =>
            studyPlans.flatMap((plan) =>
              plan.semesterPlans
                .filter((semesterPlan) => semesterPlan.semester === semester)
                .map((semesterPlan) => {
                  return SemesterPlanActions.updateIsPastSemester({
                    studyPlanId: plan._id,
                    semesterPlanId: semesterPlan._id,
                    isPast: true,
                  });
                })
            )
          ),
        )
      )
    )
  );

  updateHint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateHint),
      switchMap((props) =>
        this.rest.updateHint(props.key, props.hasConfirmed).pipe(
          map((hints) => UserActions.updateHintSuccess({ hints })),
          catchError((error) => of(UserActions.updateHintFailure({ error })))
        )
      )
    )
  );

  addConsent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.addConsent),
      switchMap((props) =>
        this.rest
          .addConsent(props.ctype, props.hasConfirmed, props.hasResponded, props.timestamp)
          .pipe(
            map((consents) => UserActions.addConsentSuccess({ consents })),
            catchError((error) =>
              of(UserActions.addConsentFailure({ error }))
            )
          )
      )
    )
  );

  updateModuleFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateModuleFeedback),
      mergeMap((props) =>
        this.rest
          .updateModuleFeedback(props.moduleFeedback)
          .pipe(
            map((moduleFeedback) => UserActions.updateModuleFeedbackSuccess({ moduleFeedback })),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Feedback wurde aktualisiert.',
              });

              // use feedback
              const { similarmods, similarchair } = props.moduleFeedback;

              // update feedback_similarmods in recommendations
              if (similarmods) {
                this.recsService.updatePersonalRecommendations(props.moduleFeedback).subscribe();
              }

              // if (similarchair) {
                // TODO update chair in user and use for recommendations
              // }
            }),
            catchError((error) =>
              of(UserActions.updateModuleFeedbackFailure({ error }))
            )
          )
      )
    )
  );


  updateDashboardView$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.updateDashboardView),
      switchMap((props) =>
        this.rest.updateDashboardSettings(props.chartName).pipe(
          map((settings) =>
            DashboardActions.updateDashboardViewSuccess({ settings })
          ),
          catchError((error) =>
            of(DashboardActions.updateDashboardViewFailure(error))
          )
        )
      )
    )
  );

  updateTimetableView$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimetableActions.updateTimetableSettings),
      switchMap((props) =>
        this.rest.updateTimetableSettings(props.showWeekends).pipe(
          map((settings) =>
            TimetableActions.updateTimetableSettingsSuccess({ settings })
          ),
          catchError((error) =>
            of(TimetableActions.updateTimetableSettingsFailure(error))
          )
        )
      )
    )
  );

  updateFavouriteModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoriteModulesActions.toggleFavouriteModule),
      switchMap((props) =>
        this.rest.updateFavouriteModulesIds(props.acronym).pipe(
          map((favouriteModules) =>
            FavoriteModulesActions.toggleFavouriteModuleSuccess({
              favouriteModules,
            })
          ),
          catchError((error) =>
            of(FavoriteModulesActions.toggleFavouriteModuleFailure(error))
          )
        )
      )
    )
  );

  updateExcludedModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExcludedModuleActions.toggleExcludedModule),
      switchMap((props) =>
        this.rest.updateExcludedModules(props.acronym).pipe(
          map((excludedModulesAcronyms) =>
            ExcludedModuleActions.toggleExcludedModuleSuccess({
              excludedModulesAcronyms,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar(
              {
                type: AlertType.SUCCESS,
                message: 'Modul wird nicht mehr vorgeschlagen.',
              },
              'Unter Personalisierung rückgängig machen',
              () =>
                this.router.navigate(['/app/personalisierung/blacklist'])
            );
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Modul nicht mehr vorschlagen fehlgeschlagen.',
            });
            return of(
              ExcludedModuleActions.toggleExcludedModuleFailure({
                error,
              })
            );
          })
        )
      )
    )
  );

  toggleUserTopic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.toggleTopic),
      switchMap((props) =>
        this.rest.toggleTopic(props.topic).pipe(
          map((topics) =>
            UserActions.toggleTopicSuccess({ topics })
          ),
          catchError((error) =>
            of(UserActions.toggleTopicFailure(error))
          )
        )
      )
    )
  );

  updateCompetenceAims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompetenceAimsActions.updateCompetenceAims),
      switchMap((props) =>
        this.rest.updateCompetenceAims(props.aims).pipe(
          map(() =>
            CompetenceAimsActions.updateCompetenceAimsSuccess({
              aims: props.aims,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Die Kompetenzziele wurden erfolgreich aktualisiert.',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message:
                'Die Ziele konnten nicht gespeichert werden. Bitte versuchen Sie es erneut!',
            });
            return of(
              CompetenceAimsActions.updateCompetenceAimsFailure({ error })
            );
          })
        )
      )
    )
  );

  deleteModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.deleteModuleFromStudyPath),
      switchMap((props) =>
        this.rest.deleteModuleFromStudyPath(props.id, props.semester).pipe(
          map((studyPath) =>
            StudyPathActions.deleteModuleFromStudyPathSuccess({ studyPath })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Modul wurde gelöscht.',
            });
          }),
          catchError((error) =>
            of(StudyPathActions.deleteModuleFromStudyPathFailure({ error }))
          )
        )
      )
    )
  );

  deleteModuleFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteModuleFeedback),
      mergeMap((props) =>
        this.rest
          .deleteModuleFeedback(props.moduleFeedback)
          .pipe(
            map((moduleFeedback) => UserActions.deleteModuleFeedbackSuccess({ moduleFeedback })),
            tap(() => {
              this.snackbar.openSnackBar({
                type: AlertType.SUCCESS,
                message: 'Feedback wurde gelöscht.',
              });

              // delete corresponding recommendations
              this.recsService.deletePersonalRecommendationsByFeedback(props.moduleFeedback.acronym).subscribe();
            }),
            catchError((error) => {
              this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Feedback konnte nicht gelöscht werden.',
              });
              return of(UserActions.deleteModuleFeedbackFailure({ error }));
            })
          )
      )
    )
  );

  deleteStudyPath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudyPathActions.deleteStudyPath),
      mergeMap(() =>
        this.rest.deleteStudyPath().pipe(
          map(() => StudyPathActions.deleteStudyPathSuccess()),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Dein Studienverlauf wurde erfolgreich gelöscht.',
            });
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Dein Studienverlauf konnte nicht gelöscht werden.',
            });
            return of(StudyPathActions.deleteStudyPathFailure({ error }));
          })
        )
      )
    )
  );

  deleteFavouriteModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoriteModulesActions.deleteFavouriteModules),
      mergeMap(() =>
        this.rest.deleteFavouriteModules().pipe(
          map(() => FavoriteModulesActions.deleteFavouriteModulesSuccess()),
          catchError((error) => {
            return of(
              FavoriteModulesActions.deleteFavouriteModulesFailure({ error })
            );
          })
        )
      )
    )
  );

  deleteExcludedModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExcludedModulesActions.deleteExcludedModules),
      mergeMap(() =>
        this.rest.deleteExcludedModules().pipe(
          map(() =>
            ExcludedModulesActions.deleteExcludedModulesSuccess()
          ),
          catchError((error) => {
            return of(
              ExcludedModulesActions.deleteExcludedModulesFailure({
                error,
              })
            );
          })
        )
      )
    )
  );

  deleteExcludedModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExcludedModuleActions.deleteExcludedModule),
      mergeMap((props) =>
        this.rest.deleteExcludedModule(props.acronym).pipe(
          map(() =>
            ExcludedModuleActions.deleteExcludedModuleSuccess({
              acronym: props.acronym,
            })
          ),
          catchError((error) => {
            return of(
              ExcludedModuleActions.deleteExcludedModuleFailure({
                error,
              })
            );
          })
        )
      )
    )
  );

  upsertJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.upsertJob),
      mergeMap((props) =>
        this.recsService.recommendModulesToJob(props.job, props.id).pipe(
          map((job) => JobActions.upsertJobSuccess({ job })),
          tap(() =>
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: `Der Job "${props.job.title}" wurde erfolgreich hinzugefügt.`,
            })
          ),
          catchError((error) => {
            return of(JobActions.upsertJobFailure({ error }));
          })
        )
      )
    )
  )

  deleteJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobActions.deleteJob),
      switchMap((props) =>
        this.rest.deleteJob(props.jobId).pipe(
          map(() => JobActions.deleteJobSuccess({ jobId: props.jobId })),
          tap(() =>
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Der Job wurde erfolgreich gelöscht.',
            })
          ),
          catchError((error) => {
            return of(JobActions.deleteJobFailure({ error }));
          })
        )
      )
    )
  )

  constructor(
    private actions$: Actions,
    private rest: RestService,
    private recsService: RecsRestService,
    private snackbar: SnackbarService,
    private router: Router,
    private store: Store,
  ) { }
}
