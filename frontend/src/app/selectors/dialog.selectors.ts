import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromDialog from '../reducers/dialog.reducer';

export const selectDialogState = createFeatureSelector<fromDialog.State>(
  fromDialog.dialogFeatureKey
);

export const getCloseDialogMode = createSelector(
  selectDialogState,
  (state) => state.closeDialogMode
);
