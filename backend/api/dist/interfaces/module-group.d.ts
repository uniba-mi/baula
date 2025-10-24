import { Module } from "./module";
export declare class ModuleGroup {
    mgId: string;
    version: Number;
    name: string;
    fullName: string;
    desc: string;
    ectsMin: Number;
    ectsMax: Number;
    achievedEcts: Number;
    children?: ModuleGroup[];
    modules?: Module[];
    parent?: {
        mgId: string;
        root: boolean;
    };
    order: Number;
    constructor(mgId: string, version: Number, name: string, fullName: string, desc: string, ectsMin: Number | null, ectsMax: Number | null, achievedEcts: Number, parent?: {
        mgId: string;
        root: boolean;
    }, order?: Number);
    addChildren(children: ModuleGroup[]): void;
    addModules(modules: Module[]): void;
}
export interface ExtendedModuleGroup extends ModuleGroup {
    path: string;
    level?: number;
}
