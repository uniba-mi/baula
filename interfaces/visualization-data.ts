export interface AdvancedModuleIndicationSchema {
    isAdvancedModule: boolean;
    hasAdditionalPriorModules?: boolean;
}

export interface BasicModuleDependencyVisNodeSchema {
    id: string;
    mId: string,
    acronym: string,
    version: number,
    name: string,
    type: "Wahlmodul" | "Pflichtmodul",
    ects: number,
    term: string,
    status?: ModuleStatusSchema,
    isInStudentsMhb: boolean,
}

export interface ModuleCatalogDependencyVisNodeSchema extends BasicModuleDependencyVisNodeSchema {
    earliestSuccessorSemester?: string,
}

export interface ModuleDetailsDependencyVisNodeSchema extends BasicModuleDependencyVisNodeSchema{
    advancedModule: AdvancedModuleIndicationSchema,
}

export interface BasicModuleDependencyVisEdgeSchema {
    id: string,
    source: string,
    target: string,
    sourceStatus?: "passed" | "taken" | "planned",
    sourceSemester?: string,
    isPrerequisite: boolean,
}

export interface ModuleCatalogDependencyVisEdgeSchema extends BasicModuleDependencyVisEdgeSchema {
    targetSemester?: string,
}

export interface ModuleDetailsDependencyVisEdgeSchema extends BasicModuleDependencyVisEdgeSchema {}

export interface ModuleCatalogDependencyVisDataSchema {
    nodes: ModuleCatalogDependencyVisNodeSchema[],
    edges: ModuleCatalogDependencyVisEdgeSchema[],
}

export interface ModuleDetailsDependencyVisDataSchema {
    nodes: ModuleDetailsDependencyVisNodeSchema[],
    edges: ModuleDetailsDependencyVisEdgeSchema[],
}

export interface ModuleStatusSchema {
    statusText: string,
    semester: string,
    grade?: number,
}