import { StudyProgramme } from '../../../../interfaces/study-programme';
import { createReducer, on } from '@ngrx/store';
import * as ModuleOverviewActions from '../actions/module-overview.actions';
import { ModuleHandbook } from '../../../../interfaces/module-handbook';
import { Module } from '../../../../interfaces/module';
import { ModuleGroup } from '../../../../interfaces/module-group';
import { ModuleHandbookActions, UnknownModulesActions, ModuleInteractionActions } from '../actions/module-overview.actions';

export const moduleOverviewFeatureKey = 'module-overview';

export interface State {
  selectedModule: Module | undefined;
  // contains only the module group to make path en
  hoveredModule: Module | undefined;
  selectedStudyProgramme: StudyProgramme | undefined;
  moduleHandbook: ModuleHandbook | undefined;
  modules: Module[];
  oldModules: Module[];
}

export const initialState: State = {
  selectedModule: undefined,
  hoveredModule: undefined,
  selectedStudyProgramme: undefined,
  moduleHandbook: undefined,
  modules: [],
  oldModules: [],
};

export const reducer = createReducer(
  initialState,

  /* set and unset selection of module */
  on(ModuleInteractionActions.setSelectedModule, (state, props) => {
    return {
      ...state,
      selectedModule: props.module,
    };
  }),

  on(ModuleInteractionActions.unsetSelectedModule, (state) => {
    return {
      ...state,
      selectedModule: undefined,
    };
  }),

  on(ModuleInteractionActions.setHoverModule, (state, props) => {
    return {
      ...state,
      hoveredModule: props.module
    }
  }),

  on(ModuleInteractionActions.unsetHoverModule, (state, props) => {
    return {
      ...state,
      hoveredModule: undefined
    }
  }),

  /* select studyprogramme */
  on(ModuleOverviewActions.selectStudyProgramme, (state, props) => {
    return {
      ...state,
      selectedStudyProgramme: props.studyProgramme,
    };
  }),

  /* load of module handbook */
  on(ModuleHandbookActions.loadModuleHandbookSuccess, (state, props) => {
    let modules = iterateOverMgsAndReturnModules(props.mhb.mgs);
    modules = modules.sort((a, b) => (a.acronym < b.acronym) ? -1 : (a.acronym > b.acronym) ? 1 : 0)

    // change displayal for mgs with only one top level mg
    if (props.mhb.mgs.length === 1 && props.mhb.mgs[0].children) {
      props.mhb.mgs = props.mhb.mgs[0].children;
    }

    return {
      ...state,
      moduleHandbook: props.mhb,
      modules: modules,
    };
  }),

  on(ModuleHandbookActions.unloadModuleHandbook, (state) => {
    return {
      ...state,
      moduleHandbook: undefined,
    };
  }),

  on(UnknownModulesActions.loadUnknownModuleSuccess, (state, props) => {
    props.module.isOld = true;
    state.oldModules.push(props.module);
    
    return {
      ...state,
      oldModules: [...state.oldModules]
    }
  })
);

// Helper function to get modules out of mhb
function iterateOverMgsAndReturnModules(mgs: ModuleGroup[]): Module[] {
  let modules: Module[] = [];
  //iterate over modulegroups
  for (let mg of mgs) {
    // add modules to list
    if (mg.modules) {
      modules = modules.concat(mg.modules);
    }
    if (mg.children) {
      let childModules = iterateOverMgsAndReturnModules(mg.children);
      modules = modules.concat(childModules);
    }
  }
  return modules;
}
