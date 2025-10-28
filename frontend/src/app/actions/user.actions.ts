import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { ChartVisibility, CompAim, Hint, Consent, User, ConsentType, UserServer, ModuleFeedback } from '../../../../interfaces/user';
import { Studypath, PathModule } from '../../../../interfaces/studypath';
import { TimetableSettings } from '../../../../interfaces/semesterplan';
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

export const StudypathActions = createActionGroup({
  source: 'Studypath',
  events: {
    'Update Module In Studypath': props<{ module: PathModule }>(),
    'Update Module In Studypath Success': props<{ studypath: Studypath }>(),
    'Update Module In Studypath Failure': props<{ error: any }>(),
    'Update Studypath': props<{ completedModules: PathModule[] }>(),
    'Update Studypath Success': props<{ studypath: Studypath }>(),
    'Update Studypath Failure': props<{ error: any }>(),
    'Finish Semester': props<{ completedModules: PathModule[], droppedModules: PathModule[], semester: string }>(),
    'Finish Semester Success': props<{ studypath: Studypath, semester: string }>(),
    'Finish Semester Failure': props<{ error: any }>(),
    'Delete Module From Studypath': props<{ id: string; semester: string }>(),
    'Delete Module From Studypath Success': props<{ studypath: Studypath }>(),
    'Delete Module From Studypath Failure': props<{ error: any }>(),
    'Delete Studypath': emptyProps(),
    'Delete Studypath Success': emptyProps(),
    'Delete Studypath Failure': props<{ error: any }>(),
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

export const NotInterestingModulesActions = createActionGroup({
  source: 'Not Interesting Modules',
  events: {
    'Delete not interesting modules': emptyProps(),
    'Delete not interesting modules success': emptyProps(),
    'Delete not interesting modules failure': props<{ error: HttpErrorResponse }>(),
  }
})

export const NotInterestingModuleActions = createActionGroup({
  source: 'Not Interesting Module',
  events: {
    'Toggle not interesting module': props<{ acronym: string }>(),
    'Toggle not interesting module success': props<{ notInterestingModulesAcronyms: string[] }>(),
    'Toggle not interesting module failure': props<{ error: HttpErrorResponse }>(),
    'Delete not interesting module': props<{ acronym: string }>(),
    'Delete not interesting module success': props<{ acronym: string }>(),
    'Delete not interesting module failure': props<{ error: HttpErrorResponse }>()
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

export const InterestsActions = createActionGroup({
  source: 'Interests',
  events: {
    'Add Interest': props<{ interest: string }>(),
    'Add Interest Success': props<{ interests: string[] }>(),
    'Add Interest Failure': props<{ error: HttpErrorResponse }>(),
    'Delete Interest': props<{ interest: string }>(),
    'Delete Interest Success': props<{ interests: string[] }>(),
    'Delete Interest Failure': props<{ error: HttpErrorResponse }>(),
  }
})

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
