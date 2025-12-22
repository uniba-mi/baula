import { createAction, props } from '@ngrx/store';
import { Competence } from '../../../../../../interfaces/competence';
import { ExpandedCourse, Course } from '../../../../../../interfaces/course';

export const setInitialBars = createAction(
    '[Chart] Set initial Bars',
    props<{ competences: Competence[] }>()
);

export const setBars = createAction(
    '[Chart] Set Bars',
    props<{ competences: Competence[], selectedCourses: ExpandedCourse[], view: string, semester: string }>()
);

export const selectBar = createAction(
    '[Chart] Select Bar',
    props<{ index: number  }>()
);

export const deselectBar = createAction(
    '[Chart] Deselect Bar'
);

export const setHoverBars = createAction(
    '[Chart] Set Hover Bars',
    props<{ course: Course, contributesTo: string }>()
);

export const deleteHoverBars = createAction(
    '[Chart] Delete Hover Bars'
);

export const setHoverSelectBars = createAction(
    '[Chart] Set Hover selected Course Bars',
    props<{ course: Course, contributesTo: string }>()
);

export const changeUnit = createAction(
    '[Chart] Change selected Unit',
    props<{ unit: string }>()
);

export const changeView = createAction(
    '[Chart] Change view on chart',
    props<{ view: string }>()
);
