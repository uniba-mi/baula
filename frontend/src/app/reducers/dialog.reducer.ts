import { createReducer, on } from '@ngrx/store';
import * as DialogActions from '../actions/dialog.actions';

export const dialogFeatureKey = 'dialog';

export interface State {
  closeDialogMode: string;
}

export const initialState: State = {
  closeDialogMode: 'noData',
};

export const reducer = createReducer(
  initialState,

  on(DialogActions.closeDialogMode, (state, props) => {
    return {
      ...state,
      closeDialogMode: props.mode,
    };
  })
);
