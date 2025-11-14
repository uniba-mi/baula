import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Semester } from '../../../../interfaces/semester';
import { State as UserState } from '../reducers/user.reducer';
import { ModuleFeedback } from '../../../../interfaces/user';

export const getUserState = createFeatureSelector<UserState>('user');

export const getUser = createSelector(
  getUserState,
  (state) => state.currentUser
);

export const getUserStudyprogrammes = createSelector(
  getUser,
  (state) => state.sps
)

// get mhb version and id saved in user state (currently works for one sp)
export const getModuleHandbookVersion = createSelector(
  getUserStudyprogrammes,
  (state) => state![0].mhbVersion
);

export const getModuleHandbookId = createSelector(
  getUserStudyprogrammes,
  (state) => state![0].mhbId
);

export const getFaculties = createSelector(
  getUserStudyprogrammes,
  (state) => state?.map(sp => sp.faculty)
)

export const getSemesterList = createSelector(getUser, (user) => {
  if (user.startSemester && user.duration) {
    const semester = new Semester(user.startSemester);
    const semesterList = semester.getSemesterList(user.duration);
    return semesterList;
  } else {
    return [];
  }
});

export const getUserStudyPath = createSelector(
  getUserState,
  (state) => state.currentUser.studyPath
);

export const getDashboardSettings = createSelector(
  getUser,
  (state) => state.dashboardSettings
)

export const getTimetableSettings = createSelector(
  getUser,
  (state) => state.timetableSettings
)

export const getHints = createSelector(
  getUser,
  (state) => state.hints
)

export const getHintByKey = (key: string) => createSelector(
  getHints,
  (hints) => hints?.find(hint => hint.key === key)
);

export const getConsents = createSelector(
  getUser,
  (state) => state.consents
)

// Select last consent with ctype
export const getLastConsentByType = (ctype: string) => createSelector(
  getConsents,
  (consents) => {
    const consentsOfType = consents
      .filter(consent => consent.ctype === ctype && consent.timestamp);

    // Sort by timestamp in descending order
    consentsOfType.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return consentsOfType.length > 0 ? consentsOfType[0] : null;
  }
);

export const getAllModuleFeedback = createSelector(
  getUser,
  (state) => state.moduleFeedback || []
)

// check if module is in study path
export const isModuleInStudyPath = (acronym: string) =>
  createSelector(
    getUserStudyPath,
    (studyPath) => {
      const module = studyPath.completedModules.find((module) => module.acronym === acronym);
      return !!module;
    }
  );

// get feedback with acronym
export const getModuleFeedback = (acronym: string) =>
  createSelector(
    getAllModuleFeedback,
    (moduleFeedback: ModuleFeedback[]): ModuleFeedback | null => {
      const feedback = moduleFeedback.find((feedback) => feedback.acronym === acronym);
      if (feedback) {
        return feedback;
      }
      return null;
    }
  );

export const getFavouriteModuleAcronyms = createSelector(
  getUser,
  (state) => state.favouriteModulesAcronyms
)

export const getExcludedModulesAcronyms = createSelector(
  getUser,
  (state) => state.excludedModulesAcronyms
)

export const getVisibleCharts = createSelector(
  getUser,
  (state) => state.dashboardSettings.filter(el => el.visible)
);

export const getUserAims = createSelector(
  getUserState,
  (state) => state.currentUser.compAims
);

export const getUserTopics = createSelector(
  getUser,
  (state) => state.topics ? state.topics : []
);

export const getJobs = createSelector(
  getUser,
  (state) => state.jobs
);
