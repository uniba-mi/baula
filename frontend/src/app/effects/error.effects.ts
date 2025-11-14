import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { map, take } from 'rxjs';
import { ModuleHandbookActions, UnknownModulesActions } from '../actions/module-overview.actions';
import { AuthService } from '../shared/auth/auth.service';
import { CoursePlanningActions, ModulePlanningActions, SemesterPlanActions, StudyPlanActions, UserGeneratedModuleActions } from '../actions/study-planning.actions';
import { CompetenceAimsActions, DashboardActions, FavoriteModulesActions, ExcludedModuleActions, ExcludedModulesActions, StudyPathActions, TimetableActions, UserActions } from '../actions/user.actions';

@Injectable()
export class ErrorEffects {
  constructor(private actions$: Actions, private auth: AuthService) {}

  handleErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UnknownModulesActions.loadUnknownModuleFailure,
        ModuleHandbookActions.loadModuleHandbookFailure,
        StudyPlanActions.loadActiveStudyPlanFailure,
        StudyPlanActions.createStudyPlanFailure,
        StudyPlanActions.loadStudyPlansFailure,
        StudyPlanActions.updateStudyPlanFailure,
        StudyPlanActions.deleteStudyPlanFailure,
        SemesterPlanActions.initSemesterPlansFailure,
        SemesterPlanActions.addSemesterPlanToStudyPlanFailure,
        SemesterPlanActions.updateIsPastSemesterFailure,
        SemesterPlanActions.updateAimedEctsFailure,
        TimetableActions.updateTimetableSettingsFailure,
        UserGeneratedModuleActions.createUserGeneratedModuleFailure,
        UserGeneratedModuleActions.updateUserGeneratedModuleFailure,
        UserGeneratedModuleActions.transferUserGeneratedModuleFailure,
        UserGeneratedModuleActions.deleteUserGeneratedModuleFailure,
        ModulePlanningActions.addModuleToSemesterFailure,
        ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlansFailure,
        ModulePlanningActions.transferModuleFailure,
        ModulePlanningActions.deleteModuleFromSemesterPlanFailure,
        CoursePlanningActions.selectCourseFailure,
        CoursePlanningActions.deselectCourseFailure,
        UserActions.checkUserDataFailure,
        UserActions.updateUserFailure,
        UserActions.updateHintFailure,
        UserActions.addConsentFailure,
        StudyPathActions.updateModuleInStudyPathFailure,
        StudyPathActions.updateStudyPathFailure,
        StudyPathActions.deleteModuleFromStudyPathFailure,
        StudyPathActions.deleteStudyPathFailure,
        DashboardActions.updateDashboardViewFailure,
        TimetableActions.updateTimetableSettingsFailure,
        FavoriteModulesActions.deleteFavouriteModulesFailure,
        FavoriteModulesActions.toggleFavouriteModuleFailure,
        ExcludedModuleActions.deleteExcludedModuleFailure,
        ExcludedModuleActions.toggleExcludedModuleFailure,
        ExcludedModulesActions.deleteExcludedModulesFailure,
        CompetenceAimsActions.updateCompetenceAimsFailure,
      ),
      //skip(1), // Skip the first error, to prevent firing the effect if only one error occurs
      map(({ error }) => {
        this.auth.forceReload(error);
      }),
      take(1)
    ),
    { dispatch: false }
  );
}