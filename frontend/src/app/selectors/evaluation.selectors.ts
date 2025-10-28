import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromEvaluation from '../reducers/evaluation.reducer';

export const selectEvaluationState = createFeatureSelector<fromEvaluation.State>(
    fromEvaluation.evaluationFeatureKey
);

export const getSelectedOrganisation = createSelector(
    selectEvaluationState,
    (state) => state.selectedOrga
);
