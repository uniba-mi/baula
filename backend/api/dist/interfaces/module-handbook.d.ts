import { ModuleGroup } from "./module-group";
export declare class ModuleHandbook {
    mhbId: string;
    version: number;
    name: string;
    desc: string;
    semester: string;
    mgs: ModuleGroup[];
    constructor(id: string, version: number, name: string, desc: string, semester: string);
    addModuleGroups(mgs: ModuleGroup[]): void;
}
