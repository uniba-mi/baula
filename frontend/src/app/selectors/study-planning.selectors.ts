import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromStudyPlanning from '../reducers/study-planning.reducers';

export const selectStudyPlanningState =
  createFeatureSelector<fromStudyPlanning.State>(
    fromStudyPlanning.studyPlanningFeatureKey
  );

export const getStudyPlanningStateFull = createSelector(
  selectStudyPlanningState,
  (state) => state
);

// get study plans
export const getStudyPlans = createSelector(
  selectStudyPlanningState,
  (state) => state.studyPlans
);

// active study plan
export const getActiveStudyPlanId = createSelector(
  selectStudyPlanningState,
  (state) => state.activeStudyPlanId
);

export const getActiveStudyPlan = createSelector(
  getStudyPlans,
  getActiveStudyPlanId,
  (studyPlans, activeStudyPlanId) => {
    return studyPlans.find((studyPlan) => studyPlan._id === activeStudyPlanId);
  }
);

// selected study plan
export const getSelectedStudyPlanId = createSelector(
  selectStudyPlanningState,
  (state) => state.selectedStudyPlanId
);

export const getSelectedStudyPlan = createSelector(
  getStudyPlans,
  getSelectedStudyPlanId,
  (studyPlans, selectedStudyPlanId) => {
    return studyPlans.find(
      (studyPlan) => studyPlan._id === selectedStudyPlanId
    );
  }
);

export const getSemesterPlansOfActiveStudyPlan = createSelector(
  getActiveStudyPlan,
  (studyPlan) => {
    if (studyPlan) {
      return studyPlan.semesterPlans;
    } else {
      return;
    }
  }
);

export const getSemesterPlansOfSelectedStudyPlan = createSelector(
  getSelectedStudyPlan,
  (studyPlan) => {
    return studyPlan ? studyPlan.semesterPlans : [];
  }
);

export const getFilteredStudyPlans = createSelector(
  getStudyPlans,
  (studyPlans) => {
    return studyPlans.map((studyPlan) => ({
      ...studyPlan,
      semesterPlans: studyPlan.semesterPlans.filter((sp) => !sp.isPastSemester),
    }));
  }
);

export const getSemesterPlanOfSelectedStudyPlanById = (
  semesterPlanId: string
) =>
  createSelector(getSemesterPlansOfSelectedStudyPlan, (semesterPlans) => {
    if (semesterPlans) {
      return semesterPlans.find(
        (semesterPlan) => semesterPlan._id === semesterPlanId
      );
    } else {
      return;
    }
  });

export const getModulesWithinSemesterPlanOfSelectedStudyPlan = (
  semesterPlanId: string
) =>
  createSelector(
    getSemesterPlanOfSelectedStudyPlanById(semesterPlanId),
    (semesterPlan) => {
      if (semesterPlan) {
        return semesterPlan.modules;
      } else {
        return;
      }
    }
  );

export const getSelectedSemesterPlanSemesterById = (semesterPlanId: string) =>
  createSelector(getSemesterPlansOfSelectedStudyPlan, (semesterPlans) => {
    if (semesterPlans) {
      let semesterPlan = semesterPlans.find((item) => {
        return item._id === semesterPlanId;
      });
      if (semesterPlan) {
        return semesterPlan.semester;
      } else {
        return;
      }
    } else {
      return;
    }
  });

export const getSemesterPlanSemesterByStudyPlanId = (
  studyPlanId: string,
  ppId: string
) =>
  createSelector(getStudyPlans, (studyPlans) => {
    if (studyPlans) {
      let studyPlan = studyPlans.find((item) => {
        return item._id === studyPlanId;
      });
      if (studyPlan) {
        let semesterPlan = studyPlan.semesterPlans.find((item) => {
          return item._id === ppId;
        });
        if (semesterPlan) {
          return semesterPlan.semester;
        } else {
          return;
        }
      } else {
        return;
      }
    } else {
      return;
    }
  });

export const getStudyPlanStatus = createSelector(
  getSelectedStudyPlan,
  (selectedStudyPlanId) => {
    return selectedStudyPlanId?.status;
  }
);

export const getSemesterPlanIdBySemester = (semester: string) =>
  createSelector(getSelectedStudyPlan, (selectedStudyPlan) => {
    if (selectedStudyPlan && selectedStudyPlan.semesterPlans) {
      const matchingSemesterPlan = selectedStudyPlan.semesterPlans.find(
        (sp) => sp.semester === semester
      );
      return matchingSemesterPlan ? matchingSemesterPlan._id : undefined;
    } else {
      return undefined;
    }
  });

export const getPlannedModulesOfActiveStudyPlan = createSelector(
  getActiveStudyPlan,
  (studyPlan) =>
    studyPlan?.semesterPlans
      .map((plan) => plan.modules)
      .reduce((pv, cv) => pv.concat(cv), [])
);

// returns an array of semesters a module is planned in or null
export const getPlannedSemestersForModule = (acronym: string) =>
  createSelector(getActiveStudyPlan, (activeStudyPlan) => {
    if (activeStudyPlan) {
      const plannedSemesters = activeStudyPlan.semesterPlans
        .filter((semesterPlan) => {
          const isPlanned = semesterPlan.modules.includes(acronym);
          return isPlanned;
        })
        .map((semesterPlan) => semesterPlan.semester);

      return plannedSemesters.length > 0 ? plannedSemesters : null;
    }
    return null;
  });

export const getShowFinishSemesterInfo = createSelector(
  selectStudyPlanningState,
  (state) => state.showFinishSemesterHint
);

// selector for timetable
export const getActiveSemester = createSelector(
  selectStudyPlanningState,
  (state) => state.activeSemester
);

export const getSemesterPlan = createSelector(
  selectStudyPlanningState,
  (state) =>
    state.studyPlans
      .find((el) => el.status)
      ?.semesterPlans.find((el) => el.semester === state.activeSemester)
);

export const getPlanCourses = createSelector(
  selectStudyPlanningState,
  (state) => {
    const semesterPlan = state.studyPlans
      .find((el) => el.status)
      ?.semesterPlans.find((el) => el.semester === state.activeSemester)
    return semesterPlan ? semesterPlan.courses : []
  }
);

export const getSelectedCourseIds = createSelector(getPlanCourses, (state) =>
  state.map((courses) => courses.id)
);

export const getEctsSumOfSemesterPlan = createSelector(
  getPlanCourses,
  (state) =>
    state.map((course) => course.ects)
      .reduce((prevValue, currentValue) => {
        prevValue = prevValue ? prevValue : 0;
        currentValue = currentValue ? currentValue : 0;
        return prevValue + currentValue;
      }, 0)
);

export const getSwsSumOfSemesterPlan = createSelector(getPlanCourses, (state) =>
  state.map((course) => course.sws)
    .reduce((prevValue, currentValue) => {
      prevValue = prevValue ? prevValue : 0;
      currentValue = currentValue ? currentValue : 0;
      return prevValue + currentValue;
    }, 0)
);

// selectors for additional features
export const getLoadingState = createSelector(
  selectStudyPlanningState,
  (state) => state.loading
);

export const getPlanningHints = createSelector(
  selectStudyPlanningState,
  (state) => state.hints
);
