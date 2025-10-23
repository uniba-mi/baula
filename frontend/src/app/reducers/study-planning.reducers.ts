import { createReducer, on } from '@ngrx/store';
import { Studyplan } from '../../../../interfaces/studyplan';
import { ModulePlanningActions, UserGeneratedModuleActions, SemesterplanActions, StudyplanActions, CoursePlanningActions, TimetableActions, LoadingActions } from '../actions/study-planning.actions';
import { PlanningHints } from '../../../../interfaces/semesterplan';
import { Semester } from '../../../../interfaces/semester';

export const studyPlanningFeatureKey = 'study-planning';

// helper function
const getStudyplanById = (studyplanId: string, studyplans: Studyplan[]) => {
  let selectedStudyplan = studyplans.find((sp) => sp._id == studyplanId);
  return selectedStudyplan;
};

const getActiveSemesterplanBySemester = (semester: string, studyplans: Studyplan[]) => {
  const activePlan = studyplans.find(el => el.status);
  return activePlan?.semesterPlans.find(el => el.semester === semester);
}

const getSemesterplanOfStudyplanByIds = (
  studyplanId: string,
  studyplans: Studyplan[],
  semesterplanId: string
) => {
  const studyplan = getStudyplanById(studyplanId, studyplans);
  if (studyplan) {
    return studyplan.semesterPlans.find((plan) => plan._id === semesterplanId);
  } else {
    return;
  }
};

export interface State {
  studyplans: Studyplan[];
  selectedStudyplanId: string;
  activeStudyplanId: string;
  activeSemester: string;
  loading: boolean;
  hints: PlanningHints[];
  showFinishSemesterHint: boolean;
}

export const initialState: State = {
  studyplans: [],
  selectedStudyplanId: '',
  activeStudyplanId: '',
  activeSemester: new Semester().name,
  loading: false,
  showFinishSemesterHint: false,
  hints: []
};

export const reducer = createReducer(
  initialState,

  /******************* STUDYPLANS GENERAL ********************/

  // load study plans
  on(StudyplanActions.loadStudyplansSuccess, (state, props) => {
    return {
      ...state,
      studyplans: props.studyplans,
    };
  }),

  on(StudyplanActions.loadActiveStudyplanSuccess, (state, props) => {
    return {
      ...state,
      activeStudyplanId: props.studyplan._id,
    };
  }),

  // select studyplan
  on(StudyplanActions.selectStudyplan, (state, props) => {
    return {
      ...state,
      selectedStudyplanId: props.studyplanId,
    };
  }),

  on(StudyplanActions.deselectStudyplan, (state, props) => {
    return {
      ...state,
      selectedStudyplanId: '',
    };
  }),

  /******************* STUDYPLANS CRUD ********************/

  // create studyplan
  on(StudyplanActions.createStudyplanSuccess, (state, props) => {
    return {
      ...state,
      studyplans: [...state.studyplans, props.studyplan],
    };
  }),

  // init semesterplans
  on(SemesterplanActions.initSemesterplansSuccess, (state, props) => {
    let selectedStudyplan = getStudyplanById(
      props.studyplanId,
      state.studyplans
    );

    if (selectedStudyplan) {
      selectedStudyplan.semesterPlans = props.semesterPlans;
    }

    return {
      ...state
    };
  }),

  // add semesterplan to studyplan
  on(SemesterplanActions.addSemesterplanToStudyplanSuccess, (state, props) => {
    const updatedStudyplans = state.studyplans.map(studyplan =>
      studyplan._id === props.studyplanId
        ? {
          ...studyplan,
          name: props.studyplan.name,
          semesterPlans: [...props.studyplan.semesterPlans],
          status: props.studyplan.status
        }
        : studyplan
    );

    return {
      ...state,
      studyplans: updatedStudyplans,
      activeStudyplanId: props.studyplan.status ? props.studyplanId : state.activeStudyplanId
    };
  }),

  // update studyplan
  on(StudyplanActions.updateStudyplanSuccess, (state, props) => {

    const updatedStudyplans = state.studyplans.map(studyplan =>
      studyplan._id === props.studyplanId
        ? {
          ...studyplan,
          name: props.studyplan.name,
          semesterPlans: [...props.studyplan.semesterPlans],
          status: props.studyplan.status
        }
        : studyplan
    );

    return {
      ...state,
      studyplans: updatedStudyplans,
      activeStudyplanId: props.studyplan.status ? props.studyplanId : state.activeStudyplanId
    };
  }),

  // adding modules to current semester of all studyplans (fn upload of Anerkennungen, belegt usw.)
  on(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyplansSuccess, (state, props) => {

    const updatedStudyplans = props.studyplans;

    return {
      ...state,
      loading: false,
      studyplans: updatedStudyplans,
    };
  }),

  // delete studyplan
  on(StudyplanActions.deleteStudyplanSuccess, (state, props) => {
    return {
      ...state,
      studyplans: state.studyplans.filter(
        (plan) => plan._id !== props.studyplanId
      ),
    };
  }),

  // create module
  on(UserGeneratedModuleActions.createUserGeneratedModuleSuccess, (state, props) => {
    const selectedSemesterplan = getSemesterplanOfStudyplanByIds(
      props.studyplanId,
      state.studyplans,
      props.semesterplanId
    );
    if (selectedSemesterplan) {
      selectedSemesterplan.userGeneratedModules.push(props.module);
      selectedSemesterplan.summedEcts += props.module.ects;
    }

    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterplanId) && selectedSemesterplan
                ? selectedSemesterplan
                : sPlan
            ),
          }
          : plan
      ),
    };
  }),

  // update module
  on(UserGeneratedModuleActions.updateUserGeneratedModuleSuccess, (state, props) => {
    const selectedSemesterplan = getSemesterplanOfStudyplanByIds(props.studyplanId, state.studyplans, props.semesterplanId);
    if (selectedSemesterplan) {
      let moduleToBeUpdated = selectedSemesterplan.userGeneratedModules.find(
        (ph) => {
          return ph._id === props.module._id;
        }
      );

      if (moduleToBeUpdated) {
        // update semesterplan ects by subtracting old and adding new ects
        selectedSemesterplan.summedEcts -= moduleToBeUpdated.ects;
        selectedSemesterplan.summedEcts += props.module.ects;

        moduleToBeUpdated.ects = props.module.ects;
        moduleToBeUpdated.acronym = props.module.acronym;
        moduleToBeUpdated.name = props.module.name;
        moduleToBeUpdated.notes = props.module.notes;
      }
    }

    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterplanId) && selectedSemesterplan
                ? selectedSemesterplan
                : sPlan
            ),
          }
          : plan
      ),
    };
  }),

  // delete module
  on(UserGeneratedModuleActions.deleteUserGeneratedModule, (state, props) => {
    const selectedSemesterplan = getSemesterplanOfStudyplanByIds(props.studyplanId, state.studyplans, props.semesterplanId);
    if (selectedSemesterplan) {
      let newSemesterplan = selectedSemesterplan.userGeneratedModules.filter(
        (item) => item !== props.module
      );

      if (newSemesterplan) {
        selectedSemesterplan.userGeneratedModules = newSemesterplan;
        selectedSemesterplan.summedEcts -= props.module.ects;
      }
    }

    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterplanId) && selectedSemesterplan
                ? selectedSemesterplan
                : sPlan
            ),
          }
          : plan
      ),
    }
  }),

  // delete several user generated modules at once
  on(UserGeneratedModuleActions.deleteUserGeneratedModulesSuccess, (state, props) => {
    return {
      ...state,
      studyplans: state.studyplans.map((studyplan) =>
        studyplan._id === props.studyplanId
          ? {
            ...studyplan,
            semesterPlans: studyplan.semesterPlans.map((semesterPlan) =>
              semesterPlan._id === props.semesterplanId
                ? {
                  ...semesterPlan,
                  userGeneratedModules: semesterPlan.userGeneratedModules.filter(
                    (module) => !props.deletedModules.some((deleted) => deleted._id === module._id)
                  ),
                  summedEcts: semesterPlan.summedEcts - props.deletedModules.reduce((sum, mod) => sum + mod.ects, 0),
                }
                : semesterPlan
            ),
          }
          : studyplan
      ),
    };
  }),

  // add module to semesteplan
  on(ModulePlanningActions.addModuleToSemesterSuccess, (state, props) => {
    const selectedSemesterplan = getSemesterplanOfStudyplanByIds(props.studyplanId, state.studyplans, props.semesterplanId)

    if (selectedSemesterplan) {
      selectedSemesterplan.modules.push(props.acronym);
      selectedSemesterplan.summedEcts += props.ects;
    }

    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              sPlan._id === selectedSemesterplan?._id
                ? selectedSemesterplan
                : sPlan
            ),
          }
          : plan
      ),
    };
  }),

  // transfer module 
  on(ModulePlanningActions.transferModuleSuccess, (state, props) => {
    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) => {
              if (sPlan._id === props.newSemesterplan._id) {
                return props.newSemesterplan
              } else if (sPlan._id === props.oldSemesterplan._id) {
                return props.oldSemesterplan
              } else {
                return sPlan;
              }
            })
          }
          : plan
      ),
    }
  }),

  // transfer module 
  on(UserGeneratedModuleActions.transferUserGeneratedModuleSuccess, (state, props) => {
    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan._id === props.studyplanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) => {
              if (sPlan._id === props.newSemesterplan._id) {
                return props.newSemesterplan
              } else if (sPlan._id === props.oldSemesterplan._id) {
                return props.oldSemesterplan
              } else {
                return sPlan;
              }
            })
          }
          : plan
      ),
    }
  }),

  // delete module from semesterplan
  on(
    ModulePlanningActions.deleteModuleFromSemesterplanSuccess,
    (state, props) => {
      const selectedSemesterplan = getSemesterplanOfStudyplanByIds(props.studyplanId, state.studyplans, props.semesterplanId)

      if (selectedSemesterplan) {
        let newSemesterplan = selectedSemesterplan.modules.filter(
          (item) => item !== props.acronym
        );

        if (newSemesterplan) {
          selectedSemesterplan.modules = newSemesterplan;
          selectedSemesterplan.summedEcts -= props.ects;
        }
      }
      return {
        ...state,
        studyplans: state.studyplans.map((plan) =>
          plan._id === props.studyplanId
            ? {
              ...plan,
              semesterPlans: plan.semesterPlans.map((sPlan) =>
                sPlan._id === selectedSemesterplan?._id
                  ? selectedSemesterplan
                  : sPlan
              ),
            }
            : plan
        ),
      };
    }
  ),

  // update aimed ects
  on(SemesterplanActions.updateAimedEctsSuccess, (state, props) => {
    let selectedStudyplan = getStudyplanById(
      props.studyplanId,
      state.studyplans
    );

    if (selectedStudyplan) {
      let selectedSemesterplan = selectedStudyplan.semesterPlans.find(
        (plan) => {
          return plan._id === props.semesterplanId;
        }
      );

      if (selectedSemesterplan) {
        selectedSemesterplan.aimedEcts = props.aimedEcts;
      }
    }
    return state;
  }),

  // update is past semester for studyplans
  on(
    SemesterplanActions.updateIsPastSemester,
    (state, { studyplanId, semesterplanId, isPast }) => {

      const newState = {
        ...state,
        studyplans: state.studyplans.map((studyplan) => {
          if (studyplan._id !== studyplanId) return studyplan;

          return {
            ...studyplan,
            semesterPlans: studyplan.semesterPlans.map((semesterPlan) => {
              if (semesterPlan._id !== semesterplanId) return { ...semesterPlan };
              return { ...semesterPlan, isPastSemester: isPast };
            }),
          };
        }),
      };
      return newState;
    }
  ),

  on(SemesterplanActions.updateShowFinishSemesterHint, (state, props) => {
    return {
      ...state,
      showFinishSemesterHint: props.showFinishSemesterHint,
    };
  }),

  // timetable
  on(TimetableActions.importSemesterplanSuccess, (state, props) => {
    return {
      ...state,
      studyplans: state.studyplans.map(plan =>
        plan.status
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map(sPlan =>
              sPlan.semester === props.newSemesterplan.semester
                ? props.newSemesterplan
                : sPlan
            )
          }
          : plan
      )
    };
  }),

  on(TimetableActions.updatePlanningHints, (state, props) => {
    return {
      ...state,
      hints: props.hints,
    }
  }),

  on(TimetableActions.updateActiveSemester, (state, props) => {
    return {
      ...state,
      activeSemester: props.semester
    }
  }),

  // courses
  on(CoursePlanningActions.updateCoursesArrayInSemesterplan, (state, props) => {
    const semesterPlan = getActiveSemesterplanBySemester(state.activeSemester, state.studyplans);
    if (semesterPlan) {
      semesterPlan.courses = props.courses
    }
    return {
      ...state,
      studyplans: state.studyplans.map((plan) =>
        plan.status ? {
          ...plan,
          semesterPlans: plan.semesterPlans.map((sPlan) =>
            (sPlan.semester === state.activeSemester) && semesterPlan
              ? semesterPlan
              : sPlan
          )
        } : plan
      )
    };
  }),

  // Loading 
  on(LoadingActions.startLoading, (state) => {
    return {
      ...state,
      loading: true,
    };
  }),

  on(LoadingActions.stopLoading, (state) => {
    return {
      ...state,
      loading: false,
    };
  }),
);
