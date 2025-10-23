import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RestService } from '../rest.service';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ModulehandbookActions, UnknownModulesActions } from '../actions/module-overview.actions';



@Injectable()
export class ModuleOverviewEffects {

  loadModules$ = createEffect(() => this.actions$.pipe(
    ofType(ModulehandbookActions.loadModulehandbook),
    switchMap((props) => 
      this.rest.getModulhandbookStructure(props.id, props.version).pipe(
        map( mhb => ModulehandbookActions.loadModulehandbookSuccess({ mhb })),
        catchError(error => of(ModulehandbookActions.loadModulehandbookFailure({ error })))
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
