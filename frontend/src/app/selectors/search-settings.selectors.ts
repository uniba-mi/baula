import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as SearchSettingsState } from '../reducers/search-settings.reducer';

export const getSearchSettingsState =

  createFeatureSelector<SearchSettingsState>('search-settings');

export const getSearchSettingsByContext = (context: string) => createSelector(
  getSearchSettingsState,
  (state) => state.searchContexts[context]
);