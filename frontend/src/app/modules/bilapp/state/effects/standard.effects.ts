import { State as StandardState } from './../reducer/standard.reducer';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as StandardActions from '../actions/standard.actions';
import * as ChartActions from '../../../compvis/state/chart.actions';
import { Store } from '@ngrx/store';
import { setBars, setInitialBars } from '../../../compvis/state/chart.actions';
import { BilappRestService } from '../../bilapp-rest.service';



@Injectable()
export class StandardEffects {

  loadStandard$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.loadStandard),
    switchMap( () =>
      this.rest.getStandards().pipe(
        map( standards => StandardActions.loadStandardSuccess( { standards } )),
        catchError(error => of(StandardActions.loadStandardFailure( { error } )))
      )
    ))
  );


  loadCompetencesOfOtherStandards$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.loadCompetencesOfOtherStandards),
    switchMap( (props) =>
      this.rest.getCompetencesFromStandard(props.standardsID).pipe(
        map( competences => StandardActions.loadCompetencesOfOtherStandardsSuccess( { competences, standard: props.standardsID } )),
        catchError(error => of(StandardActions.loadCompetencesOfOtherStandardsFailure( { error } )))
      )
    )
  ));

  selectStandard$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.selectStandard),
    switchMap(props => [
        StandardActions.updateCompetences( { standardID: props.standard.stId } )
    ]))
  );

  updateCompetences$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.updateCompetences),
    switchMap( (props) =>
      this.rest.getCompetences(props.standardID).pipe(
        map( competences => StandardActions.updateCompetencesSuccess( { competences } )),
        catchError(error => of(StandardActions.updateCompetencesFailure( { error } )))
      )
    ))
  );

  loadFirstLayerOfCompetences$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.loadCompetenceGroups),
    switchMap(props =>
      this.rest.getCompetencesFromStandard(props.standardID).pipe(
        map(competences => StandardActions.loadCompetenceGroupsSuccess({competences})),
        catchError(error => of(StandardActions.loadCompetenceGroupsFailure({error})))
      )
    )
  ));


  setInitialBars$ = createEffect(() => this.actions$.pipe(
    ofType(StandardActions.updateCompetencesSuccess),
    switchMap(props => [
        setInitialBars( { competences: props.competences } )
    ]))
  );

  constructor(
    private actions$: Actions,
    private store$: Store<{ standard: StandardState}>,
    private rest: BilappRestService
  ) {}

}
