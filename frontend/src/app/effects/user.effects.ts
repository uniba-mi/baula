import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RestService } from '../rest.service';
import { AlertType } from '../shared/classes/alert';
import { SnackbarService } from '../shared/services/snackbar.service';
import {
  StudypathActions,
  UserActions,
  DashboardActions,
  FavoriteModulesActions,
  CompetenceAimsActions,
  InterestsActions,
  NotInterestingModulesActions,
  NotInterestingModuleActions,
  TimetableActions,
  JobActions,
} from '../actions/user.actions';
import { Router } from '@angular/router';
import { User } from '../../../../interfaces/user';
import { getStudyplans } from '../selectors/study-planning.selectors';
import { Store } from '@ngrx/store';
import { SemesterplanActions } from '../actions/study-planning.actions';

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

  updateModuleInStudypath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudypathActions.updateModuleInStudypath),
      switchMap((props) =>
        this.rest.updateModuleInStudypath(props.module).pipe(
          map((studypath) =>
            StudypathActions.updateModuleInStudypathSuccess({ studypath })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Modul wurde aktualisiert',
            });
          }),
          catchError((error) =>
            of(StudypathActions.updateModuleInStudypathFailure(error))
          )
        )
      )
    )
  );

  updateStudypath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudypathActions.updateStudypath),
      concatMap((props) =>
        this.rest.updateStudypath(props.completedModules).pipe(
          map((studypath) =>
            StudypathActions.updateStudypathSuccess({ studypath })
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
            return of(StudypathActions.updateStudypathFailure({ error }));
          })
        )
      )
    )
  );

  finishSemester$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudypathActions.finishSemester),
      concatMap((props) =>
        this.rest.finishSemester(props.completedModules, props.droppedModules, props.semester).pipe(
          map((studypath) =>
            StudypathActions.finishSemesterSuccess({ studypath, semester: props.semester })
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
            return of(StudypathActions.finishSemesterFailure({ error }));
          })
        )
      )
    )
  );

  // updates is past property of semester plans after finish semester was successful
  updateIsPastOfAllSemesterPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudypathActions.finishSemesterSuccess),
      concatMap(({ semester }) =>
        this.store.select(getStudyplans).pipe(
          take(1),
          mergeMap((studyplans) =>
            studyplans.flatMap((plan) =>
              plan.semesterPlans
                .filter((semesterplan) => semesterplan.semester === semester)
                .map((semesterplan) => {
                  return SemesterplanActions.updateIsPastSemester({
                    studyplanId: plan._id,
                    semesterplanId: semesterplan._id,
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

  updateConsent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateConsent),
      switchMap((props) =>
        this.rest
          .updateConsent(props.ctype, props.hasConfirmed, props.hasResponded, props.timestamp)
          .pipe(
            map((consents) => UserActions.updateConsentSuccess({ consents })),
            catchError((error) =>
              of(UserActions.updateConsentFailure({ error }))
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

  updateNotInterestingModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotInterestingModuleActions.toggleNotInterestingModule),
      switchMap((props) =>
        this.rest.updateNotInterestingModules(props.acronym).pipe(
          map((notInterestingModulesAcronyms) =>
            NotInterestingModuleActions.toggleNotInterestingModuleSuccess({
              notInterestingModulesAcronyms,
            })
          ),
          tap(() => {
            this.snackbar.openSnackBar(
              {
                type: AlertType.SUCCESS,
                message: 'Modul wird nicht mehr vorgeschlagen.',
              },
              'In den Einstellungen rückgängig machen',
              () =>
                this.router.navigate(['/app/profil/einstellung-empfehlungen'])
            );
          }),
          catchError((error) => {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Modul nicht mehr vorschlagen fehlgeschlagen.',
            });
            return of(
              NotInterestingModuleActions.toggleNotInterestingModuleFailure({
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
      ofType(StudypathActions.deleteModuleFromStudypath),
      switchMap((props) =>
        this.rest.deleteModuleFromStudypath(props.id, props.semester).pipe(
          map((studypath) =>
            StudypathActions.deleteModuleFromStudypathSuccess({ studypath })
          ),
          tap(() => {
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: 'Modul wurde gelöscht.',
            });
          }),
          catchError((error) =>
            of(StudypathActions.deleteModuleFromStudypathFailure({ error }))
          )
        )
      )
    )
  );

  deleteStudypath$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudypathActions.deleteStudypath),
      mergeMap(() =>
        this.rest.deleteStudypath().pipe(
          map(() => StudypathActions.deleteStudypathSuccess()),
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
            return of(StudypathActions.deleteStudypathFailure({ error }));
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

  deleteNotInterestingModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotInterestingModulesActions.deleteNotInterestingModules),
      mergeMap(() =>
        this.rest.deleteNotInterestingModules().pipe(
          map(() =>
            NotInterestingModulesActions.deleteNotInterestingModulesSuccess()
          ),
          catchError((error) => {
            return of(
              NotInterestingModulesActions.deleteNotInterestingModulesFailure({
                error,
              })
            );
          })
        )
      )
    )
  );

  deleteNotInterestingModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotInterestingModuleActions.deleteNotInterestingModule),
      mergeMap((props) =>
        this.rest.deleteNotInterestingModule(props.acronym).pipe(
          map(() =>
            NotInterestingModuleActions.deleteNotInterestingModuleSuccess({
              acronym: props.acronym,
            })
          ),
          catchError((error) => {
            return of(
              NotInterestingModuleActions.deleteNotInterestingModuleFailure({
                error,
              })
            );
          })
        )
      )
    )
  );

  addInterest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterestsActions.addInterest),
      switchMap((props) =>
        this.rest.addInterest(props.interest).pipe(
          map((interests) =>
            InterestsActions.addInterestSuccess({ interests })
          ),
          tap(() =>
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: `${props.interest} wurde als Interesse hinzugefügt.`,
            })
          ),
          catchError((error) => {
            return of(InterestsActions.addInterestFailure({ error }));
          })
        )
      )
    )
  );

  deleteInterest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InterestsActions.deleteInterest),
      switchMap((props) =>
        this.rest.deleteInterest(props.interest).pipe(
          map((interests) =>
            InterestsActions.deleteInterestSuccess({ interests })
          ),
          tap(() =>
            this.snackbar.openSnackBar({
              type: AlertType.SUCCESS,
              message: `${props.interest} wurde als Interesse entfernt.`,
            })
          ),
          catchError((error) => {
            return of(InterestsActions.deleteInterestFailure({ error }));
          })
        )
      )
    )
  );

  upsertJob$ = createEffect(() => 
    this.actions$.pipe(
      ofType(JobActions.upsertJob),
      mergeMap((props) => 
        this.rest.recommendModulesToJob(props.job, props.id).pipe(
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
    private snackbar: SnackbarService,
    private router: Router,
    private store: Store,
  ) {  }
}
