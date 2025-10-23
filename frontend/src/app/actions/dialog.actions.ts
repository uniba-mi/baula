import { createAction, props } from '@ngrx/store';

// user generated module dialog needs to know if module is being updated to disable acronym field
export const openUserGeneratedModuleDialog = createAction(
  '[dialog] Open User Generated Module Dialog'
);

export const closeUserGeneratedModuleDialog = createAction(
  '[dialog] Close User Generated Module Dialog'
);

export const closeDialogMode = createAction(
  '[dialog] Close dialog',
  props<{ mode: string }>()
);
