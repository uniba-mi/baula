import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { map, take } from 'rxjs';
import { ModulehandbookActions, UnknownModulesActions } from '../actions/module-overview.actions';
import { AuthService } from '../shared/auth/auth.service';
import { CoursePlanningActions, ModulePlanningActions, SemesterplanActions, StudyplanActions, UserGeneratedModuleActions } from '../actions/study-planning.actions';
import { CompetenceAimsActions, DashboardActions, FavoriteModulesActions, InterestsActions, NotInterestingModuleActions, NotInterestingModulesActions, StudypathActions, TimetableActions, UserActions } from '../actions/user.actions';

@Injectable()
export class ErrorEffects {
  constructor(private actions$: Actions, private auth: AuthService) {}

  handleErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UnknownModulesActions.loadUnknownModuleFailure,
        ModulehandbookActions.loadModulehandbookFailure,
        StudyplanActions.loadActiveStudyplanFailure,
        StudyplanActions.createStudyplanFailure,
        StudyplanActions.loadStudyplansFailure,
        StudyplanActions.updateStudyplanFailure,
        StudyplanActions.deleteStudyplanFailure,
        SemesterplanActions.initSemesterplansFailure,
        SemesterplanActions.addSemesterplanToStudyplanFailure,
        SemesterplanActions.updateIsPastSemesterFailure,
        SemesterplanActions.updateAimedEctsFailure,
        TimetableActions.updateTimetableSettingsFailure,
        UserGeneratedModuleActions.createUserGeneratedModuleFailure,
        UserGeneratedModuleActions.updateUserGeneratedModuleFailure,
        UserGeneratedModuleActions.transferUserGeneratedModuleFailure,
        UserGeneratedModuleActions.deleteUserGeneratedModuleFailure,
        ModulePlanningActions.addModuleToSemesterFailure,
        ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyplansFailure,
        ModulePlanningActions.transferModuleFailure,
        ModulePlanningActions.deleteModuleFromSemesterplanFailure,
        CoursePlanningActions.selectCourseFailure,
        CoursePlanningActions.deselectCourseFailure,
        UserActions.checkUserDataFailure,
        UserActions.updateUserFailure,
        UserActions.updateHintFailure,
        UserActions.addConsentFailure,
        StudypathActions.updateModuleInStudypathFailure,
        StudypathActions.updateStudypathFailure,
        StudypathActions.deleteModuleFromStudypathFailure,
        StudypathActions.deleteStudypathFailure,
        DashboardActions.updateDashboardViewFailure,
        TimetableActions.updateTimetableSettingsFailure,
        FavoriteModulesActions.deleteFavouriteModulesFailure,
        FavoriteModulesActions.toggleFavouriteModuleFailure,
        NotInterestingModuleActions.deleteNotInterestingModuleFailure,
        NotInterestingModuleActions.toggleNotInterestingModuleFailure,
        NotInterestingModulesActions.deleteNotInterestingModulesFailure,
        CompetenceAimsActions.updateCompetenceAimsFailure,
        InterestsActions.addInterestFailure,
        InterestsActions.deleteInterestFailure
      ),
      //skip(1), // Skip the first error, to prevent firing the effect if only one error occurs
      map(({ error }) => {
        this.auth.forceReload(error);
      }),
      take(1) // This will ensure the effect is only fired once
    ),
    { dispatch: false }
  );
}