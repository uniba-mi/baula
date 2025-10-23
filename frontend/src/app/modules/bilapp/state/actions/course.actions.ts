import { HttpErrorResponse } from "@angular/common/http";
import { createAction, props } from "@ngrx/store";
import { ExpandedCourse, Course } from "../../../../../../../interfaces/course";

export const loadCourses = createAction(
    '[Course] Load Courses for BilApp',
    props<{ semester: string }>()
);

export const loadCoursesSuccess = createAction(
    '[Course] Load Courses for BilApp Success',
    props<{ courses: Course[] }>()
);

export const loadCoursesFailure = createAction(
    '[Course] Load Courses for BilApp Failure',
    props<{ error: HttpErrorResponse }>()
);

export const loadSelectedCourses = createAction(
    '[Course] Load selected Courses'
);

export const loadSelectedCoursesSuccess = createAction(
    '[Course] Load selected Courses Success',
    props<{ courses: ExpandedCourse[] }>()
);

export const loadSelectedCoursesFailure = createAction(
    '[Course] Load selected Courses Failure',
    props<{ error: HttpErrorResponse }>()
);



