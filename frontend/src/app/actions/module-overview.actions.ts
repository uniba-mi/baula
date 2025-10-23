import { HttpErrorResponse } from '@angular/common/http';
import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { Module } from '../../../../interfaces/module';
import { ModuleGroup } from '../../../../interfaces/module-group';
import { Modulehandbook } from '../../../../interfaces/modulehandbook';
import { Studyprogramme } from '../../../../interfaces/studyprogramme';

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
    props<{ studyProgramme: Studyprogramme }>()
);

export const ModulehandbookActions = createActionGroup({
    source: 'Modulehandbook',
    events: {
        'Load Modulehandbook': props<{ id: string, version: number }>(),
        'Load Modulehandbook Success': props<{ mhb: Modulehandbook }>(),
        'Load Modulehandbook Failure': props<{ error: HttpErrorResponse }>(),
        'Unload Modulehandbook': emptyProps()
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
