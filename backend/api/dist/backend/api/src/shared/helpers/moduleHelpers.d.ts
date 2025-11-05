import { Modulehandbook } from "../../../../../interfaces/modulehandbook";
import { ModuleGroup } from "../../../../../interfaces/module-group";
import { Module } from "../../../../../interfaces/module";
export declare function extractModules(mhbId: string, version: number): Promise<Module[] | undefined>;
export declare function findAndBuildModulehandbookByIdAndVersion(mhbId: string, version: number): Promise<Modulehandbook | undefined>;
/**------------------------------------------------------------
 * Helper function to add courses to modules, used in the function buildStructure
 * @param modules contains the modules to which the courses should be found and added
 -------------------------------------------------------------- */
export declare function addModuleCourses(modules: Module[]): Promise<void>;
/**------------------------------------------------------------
 * Helper function to add module acronyms extracted from priorKnowledge to modules, used in the function buildStructure
 * @param modules contains the modules to which the acronyms should be found and added
 -------------------------------------------------------------- */
export declare function addExtractedModules(modules: Module[]): Promise<void>;
/**------------------------------------------------------------
 * Helper function to find all unique module acronyms from prevModules and prevModules acronyms, used in the function buildStructure
 * @param modules contains the modules to which the acronyms should be found and added
 -------------------------------------------------------------- */
export declare function addAllPriorModules(modules: Module[]): Promise<void>;
export declare function iterateOverMgsAndReturnModules(mgs: ModuleGroup[]): Module[];
export declare function removeDuplicates(arr: Module[]): Module[];
