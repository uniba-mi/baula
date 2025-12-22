import { HttpErrorResponse } from '@angular/common/http';
import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { Module } from '../../../../interfaces/module';
import { ModuleGroup } from '../../../../interfaces/module-group';
import { ModuleHandbook } from '../../../../interfaces/module-handbook';
import { StudyProgramme } from '../../../../interfaces/study-programme';

export const ModuleInteractionActions = createActionGroup({
    source: 'Module Interaction',
    events: {
        'Set selected Module': props<{ module: Module }>(),
        'Unset selected Module': emptyProps(),
        'Set hover Module': props<{ module: Module }>(),
        'Unset hover Module': emptyProps(),
    }
});

export const selectStudyProgramme = createAction(
    '[Module-Overview] Select Study Programme',
    props<{ studyProgramme: StudyProgramme }>()
);

export const ModuleHandbookActions = createActionGroup({
    source: 'Module Handbook',
    events: {
        'Load Module Handbook': props<{ id: string, version: number }>(),
        'Load Module Handbook Success': props<{ mhb: ModuleHandbook }>(),
        'Load Module Handbook Failure': props<{ error: HttpErrorResponse }>(),
        'Unload Module Handbook': emptyProps()
    }
});

export const setContentFlag = createAction(
    '[Module-Overview] Set content flag',
    props<{ mg: ModuleGroup, flag: boolean }>()
);

export const UnknownModulesActions = createActionGroup({
    source: 'Unknown Modules',
    events: {
        'Load Unknown Module': props<{ acronym: string, version?: number }>(),
        'Load Unknown Module Success': props<{ module: Module }>(),
        'Load Unknown Module Failure': props<{ error: HttpErrorResponse }>(),
    }
})
