import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlanCourse } from '../../../../../../../interfaces/semester-plan';
import { ExpandedCourse, Course } from '../../../../../../../interfaces/course';
import { State as CourseState } from '../reducer/course.reducers';

export const getCourseState = createFeatureSelector<CourseState>('course');

export const getCourses = createSelector(
  getCourseState,
  (state) => state.courses
);

export const getCourseById = (id: string) =>
  createSelector(getCourses, (courses: Course[]) =>
    courses.find((course) => course.id == id)
  );

export const getSelectedCourses = (pcs: PlanCourse[]) =>
  createSelector(getCourses, (courses: Course[]) => {
    let selectedCourses: ExpandedCourse[] = [];
    for (let pc of pcs) {
      const course = courses.find((c) => c.id == pc.id);
      if (course) {
        const copy = { ...course }
        if (copy.mCourses) {
          copy.mCourses = copy.mCourses.filter((modules) => {
            return modules.modCourse.mcId.startsWith(pc.contributeTo);
          });
        }
        selectedCourses.push({ ...copy, ...pc });
      }
    }
    return selectedCourses;
  });

export const getAllSelectedCourses = createSelector(
  getCourseState,
  (state) => state.selectedCourses
)
