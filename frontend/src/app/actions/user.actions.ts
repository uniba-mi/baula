import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { ChartVisibility, CompAim, Hint, Consent, User, ConsentType, UserServer, ModuleFeedback } from '../../../../interfaces/user';
import { StudyPath, PathModule } from '../../../../interfaces/study-path';
import { TimetableSettings } from '../../../../interfaces/semester-plan';
import { ExtendedJob, Jobtemplate } from '../../../../interfaces/job';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Check User Data': emptyProps(),
    'Check User Data Success': props<{ user: User }>(),
    'Check User Data Failure': props<{ error: HttpErrorResponse }>(),
    'Set User Data': props<{ user: User}>(),
    'Update User': props<{ user: User }>(),
    'Update User Success': props<{ user: User }>(),
    'Update User Failure': props<{ error: HttpErrorResponse }>(),
    'Update Hint': props<{ key: string; hasConfirmed: boolean }>(),
    'Update Hint Success': props<{ hints: Hint[] }>(),
    'Update Hint Failure': props<{ error: HttpErrorResponse }>(),
    'Add Consent': props<{ ctype: ConsentType, hasConfirmed: boolean, hasResponded: boolean, timestamp: Date }>(),
    'Add Consent Success': props<{ consents: Consent[] }>(),
    'Add Consent Failure': props<{ error: HttpErrorResponse }>(),
    'Toggle Topic': props<{ topic: string }>(),
    'Toggle Topic Success': props<{ topics: string[] }>(),
    'Toggle Topic Failure': props<{ error: HttpErrorResponse }>(),
    'Update Module Feedback': props<{ moduleFeedback: ModuleFeedback }>(),
    'Update Module Feedback Success': props<{ moduleFeedback: ModuleFeedback }>(),
    'Update Module Feedback Failure': props<{ error: HttpErrorResponse }>(),
    'Delete Module Feedback': props<{ moduleFeedback: ModuleFeedback }>(),
    'Delete Module Feedback Success': props<{ moduleFeedback: ModuleFeedback[] }>(),
    'Delete Module Feedback Failure': props<{ error: HttpErrorResponse }>(),
  }
});

export const StudyPathActions = createActionGroup({
  source: 'Study Path',
  events: {
    'Update Module In Study Path': props<{ module: PathModule }>(),
    'Update Module In Study Path Success': props<{ studyPath: StudyPath }>(),
    'Update Module In Study Path Failure': props<{ error: any }>(),
    'Update Study Path': props<{ completedModules: PathModule[] }>(),
    'Update Study Path Success': props<{ studyPath: StudyPath }>(),
    'Update Study Path Failure': props<{ error: any }>(),
    'Finish Semester': props<{ completedModules: PathModule[], droppedModules: PathModule[], semester: string }>(),
    'Finish Semester Success': props<{ studyPath: StudyPath, semester: string }>(),
    'Finish Semester Failure': props<{ error: any }>(),
    'Delete Module From Study Path': props<{ id: string; semester: string }>(),
    'Delete Module From Study Path Success': props<{ studyPath: StudyPath }>(),
    'Delete Module From Study Path Failure': props<{ error: any }>(),
    'Delete Study Path': emptyProps(),
    'Delete Study Path Success': emptyProps(),
    'Delete Study Path Failure': props<{ error: any }>(),
  },
});

export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    'Update Dashboard View': props<{ chartName: string }>(),
    'Update Dashboard View Success': props<{ settings: ChartVisibility[] }>(),
    'Update Dashboard View Failure': props<{ error: HttpErrorResponse }>()
  }
});

export const TimetableActions = createActionGroup({
  source: 'Timetable',
  events: {
    'Update Timetable Settings': props<{ showWeekends: boolean; }>(),
    'Update Timetable Settings Success': props<{ settings: TimetableSettings[]; }>(),
    'Update Timetable Settings Failure': props<{ error: HttpErrorResponse }>()
  }
});

export const FavoriteModulesActions = createActionGroup({
  source: 'Favorite Modules',
  events: {
    'Toggle favourite module': props<{ acronym: string }>(),
    'Toggle favourite module success': props<{ favouriteModules: string[] }>(),
    'Toggle favourite module failure': props<{ error: HttpErrorResponse }>(),
    'Delete favourite modules': emptyProps(),
    'Delete favourite modules success': emptyProps(),
    'Delete favourite modules failure': props<{ error: HttpErrorResponse }>()
  }
})

export const ExcludedModulesActions = createActionGroup({
  source: 'Excluded Modules',
  events: {
    'Delete excluded modules': emptyProps(),
    'Delete excluded modules success': emptyProps(),
    'Delete excluded modules failure': props<{ error: HttpErrorResponse }>(),
  }
})

export const ExcludedModuleActions = createActionGroup({
  source: 'Excluded Module',
  events: {
    'Toggle excluded module': props<{ acronym: string }>(),
    'Toggle excluded module success': props<{ excludedModulesAcronyms: string[] }>(),
    'Toggle excluded module failure': props<{ error: HttpErrorResponse }>(),
    'Delete excluded module': props<{ acronym: string }>(),
    'Delete excluded module success': props<{ acronym: string }>(),
    'Delete excluded module failure': props<{ error: HttpErrorResponse }>()
  }
})

export const CompetenceAimsActions = createActionGroup({
  source: 'Competence Aims',
  events: {
    'Update Competence Aims': props<{ aims: CompAim[] }>(),
    'Update Competence Aims Success': props<{ aims: CompAim[] }>(),
    'Update Competence Aims Failure': props<{ error: HttpErrorResponse }>()
  }
});

export const JobActions = createActionGroup({
  source: 'Job',
  events: {
    'Upsert Job': props<{ job: Jobtemplate, id?: string }>(),
    'Upsert Job Success': props<{ job: ExtendedJob }>(),
    'Upsert Job Failure': props<{ error: HttpErrorResponse }>(),
    'Delete Job': props<{ jobId: string }>(),
    'Delete Job Success': props<{ jobId: string }>(),
    'Delete Job Failure': props<{ error: HttpErrorResponse }>(),
  }
});
