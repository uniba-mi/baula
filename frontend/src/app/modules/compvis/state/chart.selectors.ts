import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as ChartState } from './chart.reducers';

export const getChartState = createFeatureSelector<ChartState>('chart');

export const getChartStateFull = createSelector(
    getChartState,
    state => state
) 

export const getBars = createSelector(
    getChartState,
    state => state.bars
);

export const getHoverBars = createSelector(
    getChartState,
    state => state.hoverBars
);

export const getHoverSelectBars = createSelector(
    getChartState,
    state => state.hoverSelectBars
);

export const getSelectedBar = createSelector(
    getChartState,
    state => state.selectedBar
);

export const getUnit = createSelector(
    getChartState,
    state => state.settings.unit
);

export const getView = createSelector(
    getChartState,
    state => state.settings.view
);

export const getSettings = createSelector(
    getChartState,
    state => state.settings
);

