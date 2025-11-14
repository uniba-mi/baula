import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Module } from '../../../../interfaces/module';
import { State as ModuleOverviewState } from '../reducers/module-overview.reducer';
import { ExtendedModuleGroup } from '../../../../interfaces/module-group';
import { Semester } from '../../../../interfaces/semester';

export const getModuleOverviewState =
  createFeatureSelector<ModuleOverviewState>('module-overview');

createFeatureSelector<ModuleOverviewState>('module-overview');

export const getModuleOvervieStateFull = createSelector(
  getModuleOverviewState,
  (state) => state
);

export const getSelectedModule = createSelector(
  getModuleOverviewState,
  (state) => state.selectedModule
);

export const getSelectedStudyprogramme = createSelector(
  getModuleOverviewState,
  (state) => state.selectedStudyProgramme
);

export const getModuleHandbook = createSelector(
  getModuleOverviewState,
  (state) => state.moduleHandbook
);

export const getFirstLevelModuleGroups = createSelector(
  getModuleHandbook,
  (state) => state?.mgs
);

export const getModules = createSelector(
  getModuleOverviewState,
  (state) => state.modules
);

export const getDistinctModules = createSelector(
  getModules,
  (modules) => removeDuplicates(modules)
);

// get modules with version 1 and offered in current or previous semester
// slice(0, -4) is needed to fix not matching semester names (e.g. 2024/25 vs. 2024/2025)
export const getNewModules = createSelector(
  getDistinctModules,
  (modules) => {
    const currentSemester = new Semester();
    const previousSemester = currentSemester.getPreviousSemester(currentSemester)
    return modules.filter(module => module.offerBegin && module.version === 1 && (module.offerBegin.slice(0,-4) === currentSemester.fullName.slice(0,-4) || module.offerBegin.slice(0,-4) === previousSemester.fullName.slice(0,-4)));
  }
);

export const getOldModules = createSelector(
  getModuleOverviewState,
  (state) => state.oldModules
);

export const getAllModules = createSelector(
  getModules,
  getOldModules,
  (modules, oldModules) => [...modules, ...oldModules]
);

export const getAllUniqueChairs = createSelector(
  getModules,
  (modules: Module[]): string[] => {
    const chairsSet = new Set<string>();
    modules.forEach(module => {
      if (module.chair) {
        chairsSet.add(module.chair);
      }
    });
    return Array.from(chairsSet);
  }
);

export const getChairByModuleAcronym = (acronym: string) =>
  createSelector(
    getModules,
    (modules: Module[]): string | undefined => {
      const module = modules.find(mod => mod.acronym === acronym);
      return module ? module.chair : undefined;
    }
  );
export const getAllDistinctModules = createSelector(
  getAllModules,
  (state) => removeDuplicates(state)
)

export const getModuleAcronyms = createSelector(
  getModules,
  (state) => state.map(el => el.acronym)
);

export const getModuleById = (id: string) =>
  createSelector(getAllModules, (modules: Module[]) =>
    modules.find((mod) => mod.mId == id)
  );

export const getOldModuleByAcronym = (acronym: string) =>
  createSelector(getAllModules, (modules: Module[]) =>
    modules.find((mod) => mod.acronym == acronym)
  );

export const getModuleByAcronym = (acronym: string) =>
  createSelector(getModules, (modules: Module[]) =>
    modules.find((mod) => mod.acronym == acronym)
  );

export const getModuleClasses = createSelector(getSelectedModule, (state) => {
  return state?.mCourses;
});

export const getHoveredModule = createSelector(
  getModuleOvervieStateFull,
  (state) => state.hoveredModule
)

// CURRENTLY NOT USED, but could be handy some time, recursive retrieval of mgs (flat list)
// export const getAllModuleGroups = createSelector(
//   getModuleOverviewState,
//   (state) => {
//     if (state.moduleHandbook && state.moduleHandbook.mgs) {
//       return getAllMgs(state.moduleHandbook.mgs);
//     }
//     return [];
//   }
// );

// recursive retrievel of mgs with hierarchy
export const getStructuredModuleGroups = createSelector(
  getModuleOverviewState,
  (state): ExtendedModuleGroup[] => {
    if (state.moduleHandbook && state.moduleHandbook.mgs) {
      return createStructuredModuleGroupsList(state.moduleHandbook.mgs);
    }
    return [];
  }
);

/******************* HELPER FUNCTIONS **********************************/

// helper function to get all mgs
// function getAllMgs(mgs: any[]): any[] {
//   return mgs.reduce((acc, mg) => {
//     if (mg.children && mg.children.length > 0) {
//       return acc.concat(getAllMgs(mg.children));
//     }
//     return acc.concat(mg);
//   }, []);
// }


// helper function to get all mgs with hierarchy
function createStructuredModuleGroupsList(mgs: any[], depth = 0): ExtendedModuleGroup[] {
  return mgs.reduce((acc, mg) => {
    const indent = '— '.repeat(depth); // Repeat the indent character for each level ↪ → ↳ ⮡ > —
    const displayName = `${indent}${depth == 0 ? mg.name : mg.fullName}`;
    acc.push({
      mgId: mg.mgId,
      name: depth == 0 ? mg.name : mg.fullName,
      path: displayName,
      level: depth // styling
    });
    if (mg.children && mg.children.length > 0) {
      acc = acc.concat(createStructuredModuleGroupsList(mg.children, depth + 1));
    }
    return acc;
  }, []);
}

// helper -> currently not needed, may be useful sometime
// export const getModulesGroupedByChair = createSelector(
//   getModules,
//   (modules: Module[]) => {
//     const modulesByChair = modules.reduce((acc: { [chair: string]: Module[] }, module: Module) => {
//       if (!acc[module.chair]) {
//         acc[module.chair] = [];
//       }
//       acc[module.chair].push(module);
//       return acc;
//     }, {});
//     return modulesByChair;
//   }
// );

// export const getModulesByChair = (chair: string) => createSelector(
//   getModulesGroupedByChair,
//   (modulesByChair) => modulesByChair[chair] || []
// );

// export const getUniqueChairs = createSelector(
//   getModules,
//   (modules) => {
//     const chairs = modules.map(module => module.chair);
//     return Array.from(new Set(chairs));
//   }
// );

// code inspiried by https://stackoverflow.com/questions/36032179/remove-duplicates-in-an-object-array-javascript
function removeDuplicates(arr: Module[]): Module[] {
  return arr.reduce(
    function (p: { temp: string[]; out: Module[] }, c) {
      // create an identifying id from the object values
      var id = [c.mId, c.version].join('|');

      // if the id is not found in the temp array
      // add the object to the output array
      // and add the key to the temp array
      if (p.temp.indexOf(id) === -1) {
        p.out.push(c);
        p.temp.push(id);
      }
      return p;

      // return the deduped array
    },
    {
      temp: [],
      out: [],
    }
  ).out;
}