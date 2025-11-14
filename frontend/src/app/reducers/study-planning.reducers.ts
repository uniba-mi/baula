import { createReducer, on } from '@ngrx/store';
import { StudyPlan } from '../../../../interfaces/study-plan';
import { ModulePlanningActions, UserGeneratedModuleActions, SemesterPlanActions, StudyPlanActions, CoursePlanningActions, TimetableActions, LoadingActions } from '../actions/study-planning.actions';
import { PlanningHints } from '../../../../interfaces/semester-plan';
import { Semester } from '../../../../interfaces/semester';

export const studyPlanningFeatureKey = 'study-planning';

// helper function
const getStudyPlanById = (studyPlanId: string, studyPlans: StudyPlan[]) => {
  let selectedStudyPlan = studyPlans.find((sp) => sp._id == studyPlanId);
  return selectedStudyPlan;
};

const getActiveSemesterPlanBySemester = (semester: string, studyPlans: StudyPlan[]) => {
  const activePlan = studyPlans.find(el => el.status);
  return activePlan?.semesterPlans.find(el => el.semester === semester);
}

const getSemesterPlanOfStudyPlanByIds = (
  studyPlanId: string,
  studyPlans: StudyPlan[],
  semesterPlanId: string
) => {
  const studyPlan = getStudyPlanById(studyPlanId, studyPlans);
  if (studyPlan) {
    return studyPlan.semesterPlans.find((plan) => plan._id === semesterPlanId);
  } else {
    return;
  }
};

export interface State {
  studyPlans: StudyPlan[];
  selectedStudyPlanId: string;
  activeStudyPlanId: string;
  activeSemester: string;
  loading: boolean;
  hints: PlanningHints[];
  showFinishSemesterHint: boolean;
}

export const initialState: State = {
  studyPlans: [],
  selectedStudyPlanId: '',
  activeStudyPlanId: '',
  activeSemester: new Semester().name,
  loading: false,
  showFinishSemesterHint: false,
  hints: []
};

export const reducer = createReducer(
  initialState,

  /******************* STUDYPLANS GENERAL ********************/

  // load study plans
  on(StudyPlanActions.loadStudyPlansSuccess, (state, props) => {
    return {
      ...state,
      studyPlans: props.studyPlans,
    };
  }),

  on(StudyPlanActions.loadActiveStudyPlanSuccess, (state, props) => {
    return {
      ...state,
      activeStudyPlanId: props.studyPlan._id,
    };
  }),

  // select study plan
  on(StudyPlanActions.selectStudyPlan, (state, props) => {
    return {
      ...state,
      selectedStudyPlanId: props.studyPlanId,
    };
  }),

  on(StudyPlanActions.deselectStudyPlan, (state, props) => {
    return {
      ...state,
      selectedStudyPlanId: '',
    };
  }),

  /******************* STUDYPLANS CRUD ********************/

  // create study plan
  on(StudyPlanActions.createStudyPlanSuccess, (state, props) => {
    return {
      ...state,
      studyPlans: [...state.studyPlans, props.studyPlan],
    };
  }),

  // init semester plans
  on(SemesterPlanActions.initSemesterPlansSuccess, (state, props) => {
    let selectedStudyPlan = getStudyPlanById(
      props.studyPlanId,
      state.studyPlans
    );

    if (selectedStudyPlan) {
      selectedStudyPlan.semesterPlans = props.semesterPlans;
    }

    return {
      ...state
    };
  }),

  // add semester plan to study plan
  on(SemesterPlanActions.addSemesterPlanToStudyPlanSuccess, (state, props) => {
    const updatedStudyPlans = state.studyPlans.map(studyPlan =>
      studyPlan._id === props.studyPlanId
        ? {
          ...studyPlan,
          name: props.studyPlan.name,
          semesterPlans: [...props.studyPlan.semesterPlans],
          status: props.studyPlan.status
        }
        : studyPlan
    );

    return {
      ...state,
      studyPlans: updatedStudyPlans,
      activeStudyPlanId: props.studyPlan.status ? props.studyPlanId : state.activeStudyPlanId
    };
  }),

  // update study plan
  on(StudyPlanActions.updateStudyPlanSuccess, (state, props) => {

    const updatedStudyPlans = state.studyPlans.map(studyPlan =>
      studyPlan._id === props.studyPlanId
        ? {
          ...studyPlan,
          name: props.studyPlan.name,
          semesterPlans: [...props.studyPlan.semesterPlans],
          status: props.studyPlan.status
        }
        : studyPlan
    );

    return {
      ...state,
      studyPlans: updatedStudyPlans,
      activeStudyPlanId: props.studyPlan.status ? props.studyPlanId : state.activeStudyPlanId
    };
  }),

  // adding modules to current semester of all study plans (fn upload of Anerkennungen, belegt usw.)
  on(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlansSuccess, (state, props) => {

    const updatedStudyPlans = props.studyPlans;

    return {
      ...state,
      loading: false,
      studyPlans: updatedStudyPlans,
    };
  }),

  // delete study plan
  on(StudyPlanActions.deleteStudyPlanSuccess, (state, props) => {
    return {
      ...state,
      studyPlans: state.studyPlans.filter(
        (plan) => plan._id !== props.studyPlanId
      ),
    };
  }),

  // create module
  on(UserGeneratedModuleActions.createUserGeneratedModuleSuccess, (state, props) => {
    const selectedSemesterPlan = getSemesterPlanOfStudyPlanByIds(
      props.studyPlanId,
      state.studyPlans,
      props.semesterPlanId
    );
    if (selectedSemesterPlan) {
      selectedSemesterPlan.userGeneratedModules.push(props.module);
      selectedSemesterPlan.summedEcts += props.module.ects;
    }

    return {
      ...state,
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterPlanId) && selectedSemesterPlan
                ? selectedSemesterPlan
                : sPlan
            ),
          }
          : plan
      ),
    };
  }),

  // update module
  on(UserGeneratedModuleActions.updateUserGeneratedModuleSuccess, (state, props) => {
    const selectedSemesterPlan = getSemesterPlanOfStudyPlanByIds(props.studyPlanId, state.studyPlans, props.semesterPlanId);
    if (selectedSemesterPlan) {
      let moduleToBeUpdated = selectedSemesterPlan.userGeneratedModules.find(
        (ph) => {
          return ph._id === props.module._id;
        }
      );

      if (moduleToBeUpdated) {
        // update semester plan ects by subtracting old and adding new ects
        selectedSemesterPlan.summedEcts -= moduleToBeUpdated.ects;
        selectedSemesterPlan.summedEcts += props.module.ects;

        moduleToBeUpdated.ects = props.module.ects;
        moduleToBeUpdated.acronym = props.module.acronym;
        moduleToBeUpdated.name = props.module.name;
        moduleToBeUpdated.notes = props.module.notes;
      }
    }

    return {
      ...state,
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterPlanId) && selectedSemesterPlan
                ? selectedSemesterPlan
                : sPlan
            ),
          }
          : plan
      ),
    };
  }),

  // delete module
  on(UserGeneratedModuleActions.deleteUserGeneratedModule, (state, props) => {
    const selectedSemesterPlan = getSemesterPlanOfStudyPlanByIds(props.studyPlanId, state.studyPlans, props.semesterPlanId);
    if (selectedSemesterPlan) {
      let newSemesterPlan = selectedSemesterPlan.userGeneratedModules.filter(
        (item) => item !== props.module
      );

      if (newSemesterPlan) {
        selectedSemesterPlan.userGeneratedModules = newSemesterPlan;
        selectedSemesterPlan.summedEcts -= props.module.ects;
      }
    }

    return {
      ...state,
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              (sPlan._id === props.semesterPlanId) && selectedSemesterPlan
                ? selectedSemesterPlan
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
      studyPlans: state.studyPlans.map((studyPlan) =>
        studyPlan._id === props.studyPlanId
          ? {
            ...studyPlan,
            semesterPlans: studyPlan.semesterPlans.map((semesterPlan) =>
              semesterPlan._id === props.semesterPlanId
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
          : studyPlan
      ),
    };
  }),

  // add module to semesteplan
  on(ModulePlanningActions.addModuleToSemesterSuccess, (state, props) => {
    const selectedSemesterPlan = getSemesterPlanOfStudyPlanByIds(props.studyPlanId, state.studyPlans, props.semesterPlanId)

    if (selectedSemesterPlan) {
      selectedSemesterPlan.modules.push(props.acronym);
      selectedSemesterPlan.summedEcts += props.ects;
    }

    return {
      ...state,
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) =>
              sPlan._id === selectedSemesterPlan?._id
                ? selectedSemesterPlan
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
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) => {
              if (sPlan._id === props.newSemesterPlan._id) {
                return props.newSemesterPlan
              } else if (sPlan._id === props.oldSemesterPlan._id) {
                return props.oldSemesterPlan
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
      studyPlans: state.studyPlans.map((plan) =>
        plan._id === props.studyPlanId
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map((sPlan) => {
              if (sPlan._id === props.newSemesterPlan._id) {
                return props.newSemesterPlan
              } else if (sPlan._id === props.oldSemesterPlan._id) {
                return props.oldSemesterPlan
              } else {
                return sPlan;
              }
            })
          }
          : plan
      ),
    }
  }),

  // delete module from semester plan
  on(
    ModulePlanningActions.deleteModuleFromSemesterPlanSuccess,
    (state, props) => {
      const selectedSemesterPlan = getSemesterPlanOfStudyPlanByIds(props.studyPlanId, state.studyPlans, props.semesterPlanId)

      if (selectedSemesterPlan) {
        let newSemesterPlan = selectedSemesterPlan.modules.filter(
          (item) => item !== props.acronym
        );

        if (newSemesterPlan) {
          selectedSemesterPlan.modules = newSemesterPlan;
          selectedSemesterPlan.summedEcts -= props.ects;
        }
      }
      return {
        ...state,
        studyPlans: state.studyPlans.map((plan) =>
          plan._id === props.studyPlanId
            ? {
              ...plan,
              semesterPlans: plan.semesterPlans.map((sPlan) =>
                sPlan._id === selectedSemesterPlan?._id
                  ? selectedSemesterPlan
                  : sPlan
              ),
            }
            : plan
        ),
      };
    }
  ),

  // update aimed ects
  on(SemesterPlanActions.updateAimedEctsSuccess, (state, props) => {
    let selectedStudyPlan = getStudyPlanById(
      props.studyPlanId,
      state.studyPlans
    );

    if (selectedStudyPlan) {
      let selectedSemesterPlan = selectedStudyPlan.semesterPlans.find(
        (plan) => {
          return plan._id === props.semesterPlanId;
        }
      );

      if (selectedSemesterPlan) {
        selectedSemesterPlan.aimedEcts = props.aimedEcts;
      }
    }
    return state;
  }),

  // update is past semester for study plans
  on(
    SemesterPlanActions.updateIsPastSemester,
    (state, { studyPlanId, semesterPlanId, isPast }) => {

      const newState = {
        ...state,
        studyPlans: state.studyPlans.map((studyPlan) => {
          if (studyPlan._id !== studyPlanId) return studyPlan;

          return {
            ...studyPlan,
            semesterPlans: studyPlan.semesterPlans.map((semesterPlan) => {
              if (semesterPlan._id !== semesterPlanId) return { ...semesterPlan };
              return { ...semesterPlan, isPastSemester: isPast };
            }),
          };
        }),
      };
      return newState;
    }
  ),

  on(SemesterPlanActions.updateShowFinishSemesterHint, (state, props) => {
    return {
      ...state,
      showFinishSemesterHint: props.showFinishSemesterHint,
    };
  }),

  // timetable
  on(TimetableActions.importSemesterPlanSuccess, (state, props) => {
    return {
      ...state,
      studyPlans: state.studyPlans.map(plan =>
        plan.status
          ? {
            ...plan,
            semesterPlans: plan.semesterPlans.map(sPlan =>
              sPlan.semester === props.newSemesterPlan.semester
                ? props.newSemesterPlan
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
  on(CoursePlanningActions.updateCoursesArrayInSemesterPlan, (state, props) => {
    const semesterPlan = getActiveSemesterPlanBySemester(state.activeSemester, state.studyPlans);
    if (semesterPlan) {
      semesterPlan.courses = props.courses
    }
    return {
      ...state,
      studyPlans: state.studyPlans.map((plan) =>
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
