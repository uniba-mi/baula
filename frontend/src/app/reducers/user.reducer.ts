import { User } from '../../../../interfaces/user';
import { createReducer, on } from '@ngrx/store';
import { CompetenceAimsActions, DashboardActions, FavoriteModulesActions, InterestsActions, JobActions, NotInterestingModuleActions, NotInterestingModulesActions, StudypathActions, TimetableActions, UserActions } from '../actions/user.actions';

export const userFeatureKey = 'user';

export interface State {
  currentUser: User;
}

export const initialState: State = {
  currentUser: {
    _id: '',
    shibId: '',
    roles: [],
    authType: '',
    studypath: {
      completedModules: [],
      completedCourses: [],
    },
    fulltime: true,
    hints: [],
    jobs: [],
    topics: [],
    consents: [],
    moduleFeedback: [],
    favouriteModulesAcronyms: [],
    notInterestingModulesAcronyms: [],
    dashboardSettings: [],
    timetableSettings: [],
  },
};

export const reducer = createReducer(
  initialState,

  /* check user data success */
  on(UserActions.checkUserDataSuccess, (state, props) => {
    const sync = props.user ? true : false;
    // need to create a new object, otherwise subscription will not fire
    let user = sync
      ? {
        ...props.user,
        sync: sync,
      }
      : {
        ...state.currentUser,
        sync: sync,
      };

    return {
      ...state,
      currentUser: user,
    };
  }),

  /* set user data after creation of user */
  on(UserActions.setUserData, (state, props) => {
    props.user.sync = true;
    return {
      ...state,
      currentUser: props.user,
    };
  }),

  /* update user success */
  on(UserActions.updateUserSuccess, (state, props) => {
    const updatedUser: User = {
      ...props.user,
    }
    return {
      ...state,
      currentUser: updatedUser,
    };
  }),
  
  /* change status of a module in the studypath */
  on(StudypathActions.updateModuleInStudypathSuccess, (state, props) => {
    let newUser = state.currentUser;
    newUser.studypath = props.studypath;
    return {
      ...state,
      currentUser: newUser,
    };
  }),

  on(StudypathActions.updateStudypathSuccess, (state, props) => {
    let newUser = state.currentUser;
    newUser.studypath = props.studypath;
    return {
      ...state,
      currentUser: newUser,
    };
  }),

  on(StudypathActions.updateStudypathFailure, (state, props) => {
    return state;
  }),

  on(StudypathActions.finishSemesterSuccess, (state, props) => {
    let newUser = state.currentUser;
    newUser.studypath = props.studypath;
    return {
      ...state,
      currentUser: newUser,
    };
  }),

  on(StudypathActions.deleteModuleFromStudypathSuccess, (state, props) => {
    state.currentUser.studypath = props.studypath;
    return { ...state };
  }),

  on(FavoriteModulesActions.deleteFavouriteModulesSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        favouriteModulesAcronyms: [],
      },
    }
  }),

  on(NotInterestingModulesActions.deleteNotInterestingModulesSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        notInterestingModulesAcronyms: [],
      },
    }
  }),

  on(NotInterestingModuleActions.deleteNotInterestingModuleSuccess, (state, props) => {
    if (state.currentUser && state.currentUser.notInterestingModulesAcronyms) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notInterestingModulesAcronyms: state.currentUser.notInterestingModulesAcronyms.filter(moduleAcronym => moduleAcronym !== props.acronym),
        },
      };
    }
    return state;
  }),

  on(StudypathActions.deleteStudypathSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        studypath: {
          ...state.currentUser.studypath,
          completedModules: [],
        },
      },
    };
  }),

  on(DashboardActions.updateDashboardViewSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        dashboardSettings: props.settings,
      },
    };
  }),

  on(TimetableActions.updateTimetableSettingsSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        timetableSettings: props.settings,
      },
    };
  }),

  on(FavoriteModulesActions.toggleFavouriteModule, (state, props) => {
    const isFavourite = state.currentUser.favouriteModulesAcronyms.includes(props.acronym);

    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        favouriteModulesAcronyms: isFavourite
          ? state.currentUser.favouriteModulesAcronyms.filter(id => id !== props.acronym)
          : [...state.currentUser.favouriteModulesAcronyms, props.acronym]
      },
    };
  }),

  on(NotInterestingModuleActions.toggleNotInterestingModule, (state, props) => {
    const isFavourite = state.currentUser.notInterestingModulesAcronyms.includes(props.acronym);

    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        notInterestingModulesAcronyms: isFavourite
          ? state.currentUser.notInterestingModulesAcronyms.filter(id => id !== props.acronym)
          : [...state.currentUser.notInterestingModulesAcronyms, props.acronym]
      },
    };
  }),

  on(UserActions.toggleTopicSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        topics: props.topics,
      },
    };
  }),

  on(CompetenceAimsActions.updateCompetenceAimsSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        compAims: props.aims,
      },
    };
  }),

  on(UserActions.updateHintSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        hints: props.hints
      },
    };
  }),

  on(UserActions.addConsentSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        consents: props.consents
      },
    };
  }),

  on(UserActions.updateModuleFeedbackSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        moduleFeedback: Array.isArray(props.moduleFeedback) ? props.moduleFeedback : [props.moduleFeedback]
      }
    };
  }),

  on(InterestsActions.addInterestSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        interests: props.interests
      }
    }
  }),

  on(InterestsActions.deleteInterestSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        interests: props.interests
      }
    }
  }),

  on(UserActions.deleteModuleFeedbackSuccess, (state, props) => {
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        moduleFeedback: props.moduleFeedback
      }
    };
  }),

  on(JobActions.upsertJob, (state, props) => {
    let jobs = state.currentUser.jobs ? state.currentUser.jobs : [];
    // check if job exists within user
    const index = jobs.findIndex(job => job._id === props.id);
    if (index !== -1) {
      jobs[index] = {
        ...jobs[index],
        ...props.job,
        recModules: [],
        loading: true
      };
    } else {
      jobs.unshift({
        ...props.job,
        _id: '',
        embeddingId: '',
        recModules: [],
        loading: true
      });
    }

    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        jobs: [...jobs],
      }
    }
  }),

  on(JobActions.upsertJobSuccess, (state, props) => {
    let jobs = state.currentUser.jobs ? state.currentUser.jobs : [];
    // find loading job and replace it with the new job
    const index = jobs.findIndex(job => job.loading && ((!job._id && job.title === props.job.title) || job._id === props.job._id));
    if (index !== -1) {
      jobs[index] = props.job;
    }
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        jobs: jobs,
      }
    }
  }),

  on(JobActions.upsertJobFailure, (state, props) => {
    // reset jobs that are loading
    const jobs = state.currentUser.jobs ? state.currentUser.jobs.filter(job => !job.loading) : [];
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        jobs: jobs,
      }
    }
  }),

  on(JobActions.deleteJobSuccess, (state, props) => {
    let jobs = state.currentUser.jobs ? state.currentUser.jobs : [];
    jobs = jobs.filter(job => job._id !== props.jobId);
    return {
      ...state,
      currentUser: {
        ...state.currentUser,
        jobs: jobs,
      }
    }
  })


);
