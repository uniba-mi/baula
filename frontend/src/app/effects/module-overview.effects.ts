import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RestService } from '../rest.service';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ModuleHandbookActions, UnknownModulesActions } from '../actions/module-overview.actions';



@Injectable()
export class ModuleOverviewEffects {

  loadModules$ = createEffect(() => this.actions$.pipe(
    ofType(ModuleHandbookActions.loadModuleHandbook),
    switchMap((props) => 
      this.rest.getModulhandbookStructure(props.id, props.version).pipe(
        map( mhb => ModuleHandbookActions.loadModuleHandbookSuccess({ mhb })),
        catchError(error => of(ModuleHandbookActions.loadModuleHandbookFailure({ error })))
      )
    )
  ));

  loadUnknownModule$ = createEffect(() => this.actions$.pipe(
    ofType(UnknownModulesActions.loadUnknownModule),
    mergeMap((props) => 
      this.rest.getModuleByAcronymAndVersion(props.acronym, props.version).pipe(
        map( module => UnknownModulesActions.loadUnknownModuleSuccess({ module })),
        catchError(error => of(UnknownModulesActions.loadUnknownModuleFailure({ error })))
      )
    )
  ))


  constructor(
    private actions$: Actions,
    private rest: RestService
  ) {}

}
