import { createReducer, on } from "@ngrx/store";
import { ExpandedCourse, Course } from "../../../../../../../interfaces/course";
import * as CourseActions from '../actions/course.actions';

export const courseFeatureKey = 'course';

export interface State {
    courses: Course[],
    selectedCourses: ExpandedCourse[]
}

export const initialState: State = {
    courses: [],
    selectedCourses: []
};

export const reducer = createReducer(
  initialState,
  on(CourseActions.loadCoursesSuccess, (state, props) => {
    return {
      ...state,
      courses: props.courses
    };
  }),
  on(CourseActions.loadSelectedCoursesSuccess, (state, props) => {
    return {
      ...state,
      selectedCourses: props.courses
    }
  })
);
