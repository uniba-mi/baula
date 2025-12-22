import { createAction, props } from '@ngrx/store';
import { Organisation } from '../../../../interfaces/evaluation';

export const selectOrganisation = createAction(
  '[evaluation] Choose orga',
  props<{ orga: Organisation }>()
);
