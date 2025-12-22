import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import * as ChartActions from './chart.actions';
import { Store } from '@ngrx/store';
import { State as ChartState } from './chart.reducers';

@Injectable()
export class ChartEffects {

  constructor(
    private actions$: Actions,
    private store$: Store<{ chart: ChartState }>
  ) {}

}
