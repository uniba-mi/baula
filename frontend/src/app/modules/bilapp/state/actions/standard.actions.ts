import { createAction, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { Standard } from '../../interfaces/standard';
import { Competence } from '../../../../../../../interfaces/competence';

export const loadStandard = createAction(
  '[Standard] Load Standard',
);

export const loadStandardSuccess = createAction(
  '[Standard] Load Standard Success',
  props<{ standards: Standard[]  }>()
);

export const loadStandardFailure = createAction(
  '[Standard] Load Standard Failure',
  props<{ error: HttpErrorResponse  }>()
);

export const loadCompetencesOfOtherStandards = createAction(
  '[Standard] Load other Competences of not selected Standards',
  props<{ standardsID: string }>()
);

export const loadCompetencesOfOtherStandardsSuccess = createAction(
  '[Standard] Load other competences Success',
  props<{ competences: Competence[], standard: string }>()
);

export const loadCompetencesOfOtherStandardsFailure = createAction(
  '[Standard] Load other competences Failure',
  props<{ error: HttpErrorResponse  }>()
);

export const loadSpecificStandard = createAction(
  '[Standard] Load specific Standard',
  props<{ standards: Standard[] }>()
);

export const loadSpecificStandardSuccess = createAction(
  '[Standard] Load specific Standard Success',
  props<{ standard: Standard  }>()
);

export const loadSpecificStandardFailure = createAction(
  '[Standard] Load specific Standard Failure',
  props<{ error: HttpErrorResponse  }>()
);

/* Get First layer of competences */

export const loadCompetenceGroups = createAction(
  '[Standard] Load competence groups',
  props<{ standardID: string }>()
);

export const loadCompetenceGroupsSuccess = createAction(
  '[Standard] Load competence groups Success',
  props<{ competences: Competence[]  }>()
);

export const loadCompetenceGroupsFailure = createAction(
  '[Standard] Load competence groups Failure',
  props<{ error: HttpErrorResponse  }>()
);

/* End */

export const selectStandard = createAction(
  '[Standard] Select Standard',
  props<{ standard: Standard  }>()
);

/* Select competence */

export const selectCompetence = createAction(
  '[Standard] Select Competence',
  props<{ competence: Competence  }>()
);

export const deselectCompetence = createAction(
  '[Standard] Deselect Competence',
);

export const loadOtherFirstLayerCompetences = createAction(
  '[Standard] Load other first layer competences',
  props<{ standardID: string }>()
);

export const updateCompetences = createAction(
  '[Standard] Update Competences',
  props<{ standardID: string }>()
);

export const updateCompetencesSuccess = createAction(
  '[Standard] Update Competences Success',
  props<{ competences: Competence[]  }>()
);

export const updateCompetencesFailure = createAction(
  '[Standard] Update Competences Failure',
  props<{ error: HttpErrorResponse  }>()
);

export const loadFulfillment = createAction(
  '[Standard] Load Fulfillment',
  props<{ standardID: string, competences: Competence[] }>()
);

export const loadFulfillmentSuccess = createAction(
  '[Standard] Load Fulfillment Success after CourseFulfillment',
  props<{ courses: any[], view: string, semester: string  }>()
);

export const loadFulfillmentFailure = createAction(
  '[Standard] Load Fulfillment Failure',
  props<{ error: any }>()
);
