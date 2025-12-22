import { createReducer, on } from '@ngrx/store';
import * as EvaluationActions from '../actions/evaluation.actions';
import { Organisation } from '../../../../interfaces/evaluation';

export const evaluationFeatureKey = 'evaluation';

export interface State {
  selectedOrga: Organisation | undefined;
}

export const initialState: State = {
  selectedOrga: undefined
};

export const reducer = createReducer(
  initialState,

  on(EvaluationActions.selectOrganisation, (state, props) => {
    return {
      ...state,
      selectedOrga: props.orga,
    };
  })
);
