import { ModuleGroup } from "./module-group";
export declare class Modulehandbook {
    mhbId: string;
    version: number;
    name: string;
    desc: string;
    semester: string;
    spId: string;
    poVersion: number;
    mgs: ModuleGroup[];
    constructor(id: string, version: number, name: string, desc: string, semester: string, spId: string, poVersion: number);
    addModuleGroups(mgs: ModuleGroup[]): void;
}
