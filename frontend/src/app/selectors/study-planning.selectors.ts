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

// get studyplans
export const getStudyplans = createSelector(
  selectStudyPlanningState,
  (state) => state.studyplans
);

// active studyplan
export const getActiveStudyplanId = createSelector(
  selectStudyPlanningState,
  (state) => state.activeStudyplanId
);

export const getActiveStudyplan = createSelector(
  getStudyplans,
  getActiveStudyplanId,
  (studyplans, activeStudyplanId) => {
    return studyplans.find((studyplan) => studyplan._id === activeStudyplanId);
  }
);

// selected studyplan
export const getSelectedStudyplanId = createSelector(
  selectStudyPlanningState,
  (state) => state.selectedStudyplanId
);

export const getSelectedStudyplan = createSelector(
  getStudyplans,
  getSelectedStudyplanId,
  (studyplans, selectedStudyplanId) => {
    return studyplans.find(
      (studyplan) => studyplan._id === selectedStudyplanId
    );
  }
);

export const getSemesterplansOfActiveStudyplan = createSelector(
  getActiveStudyplan,
  (studyplan) => {
    if (studyplan) {
      return studyplan.semesterPlans;
    } else {
      return;
    }
  }
);

export const getSemesterplansOfSelectedStudyplan = createSelector(
  getSelectedStudyplan,
  (studyplan) => {
    return studyplan ? studyplan.semesterPlans : [];
  }
);

export const getFilteredStudyplans = createSelector(
  getStudyplans,
  (studyplans) => {
    return studyplans.map((studyplan) => ({
      ...studyplan,
      semesterPlans: studyplan.semesterPlans.filter((sp) => !sp.isPastSemester),
    }));
  }
);

export const getSemesterplanOfSelectedStudyplanById = (
  semesterplanId: string
) =>
  createSelector(getSemesterplansOfSelectedStudyplan, (semesterPlans) => {
    if (semesterPlans) {
      return semesterPlans.find(
        (semesterplan) => semesterplan._id === semesterplanId
      );
    } else {
      return;
    }
  });

export const getModulesWithinSemesterplanOfSelectedStudyplan = (
  semesterplanId: string
) =>
  createSelector(
    getSemesterplanOfSelectedStudyplanById(semesterplanId),
    (semesterplan) => {
      if (semesterplan) {
        return semesterplan.modules;
      } else {
        return;
      }
    }
  );

export const getSelectedSemesterplanSemesterById = (semesterplanId: string) =>
  createSelector(getSemesterplansOfSelectedStudyplan, (semesterPlans) => {
    if (semesterPlans) {
      let semesterplan = semesterPlans.find((item) => {
        return item._id === semesterplanId;
      });
      if (semesterplan) {
        return semesterplan.semester;
      } else {
        return;
      }
    } else {
      return;
    }
  });

export const getSemesterplanSemesterByStudyplanId = (
  studyplanId: string,
  ppId: string
) =>
  createSelector(getStudyplans, (studyplans) => {
    if (studyplans) {
      let studyplan = studyplans.find((item) => {
        return item._id === studyplanId;
      });
      if (studyplan) {
        let semesterplan = studyplan.semesterPlans.find((item) => {
          return item._id === ppId;
        });
        if (semesterplan) {
          return semesterplan.semester;
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

export const getStudyplanStatus = createSelector(
  getSelectedStudyplan,
  (selectedStudyplanId) => {
    return selectedStudyplanId?.status;
  }
);

export const getSemesterPlanIdBySemester = (semester: string) =>
  createSelector(getSelectedStudyplan, (selectedStudyplan) => {
    if (selectedStudyplan && selectedStudyplan.semesterPlans) {
      const matchingSemesterPlan = selectedStudyplan.semesterPlans.find(
        (sp) => sp.semester === semester
      );
      return matchingSemesterPlan ? matchingSemesterPlan._id : undefined;
    } else {
      return undefined;
    }
  });

export const getPlannedModulesOfActiveStudyplan = createSelector(
  getActiveStudyplan,
  (studyplan) =>
    studyplan?.semesterPlans
      .map((plan) => plan.modules)
      .reduce((pv, cv) => pv.concat(cv), [])
);

// returns an array of semesters a module is planned in or null
export const getPlannedSemestersForModule = (acronym: string) =>
  createSelector(getActiveStudyplan, (activeStudyplan) => {
    if (activeStudyplan) {
      const plannedSemesters = activeStudyplan.semesterPlans
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
    state.studyplans
      .find((el) => el.status)
      ?.semesterPlans.find((el) => el.semester === state.activeSemester)
);

export const getPlanCourses = createSelector(
  selectStudyPlanningState,
  (state) => {
    const semesterplan = state.studyplans
      .find((el) => el.status)
      ?.semesterPlans.find((el) => el.semester === state.activeSemester)
    return semesterplan ? semesterplan.courses : []
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
