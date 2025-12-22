import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as StandardState } from '../reducer/standard.reducer';

export const getStandardState = createFeatureSelector<StandardState>('standard');

export const getStandardStateFull = createSelector(
    getStandardState,
    state => state
)

export const getAllStandards = createSelector(
    getStandardState,
    state => state.standards
);

export const getSelectedStandard = createSelector(
    getStandardState,
    state => state.selectedStandard
);

export const checkIfStandardSelected = createSelector(
    getStandardState,
    state => state.standardSelected
);

export const getCompetences = createSelector(
    getStandardState,
    state => state.competences
);
export const getSelectedCompetence = createSelector(
  getStandardState,
  state => state.selectedCompetence
);

export const getOtherCompetences = createSelector(
  getStandardState,
  state => state.otherCompetences
);

export const getCompetenceGroups = createSelector(
  getStandardState,
  state => state.competenceGroups
);

export const getFulfillment = createSelector(
    getStandardState,
    state => state.fulfillment
);

