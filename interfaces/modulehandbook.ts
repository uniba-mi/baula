import { ModuleGroup } from "./module-group";

export class Modulehandbook {
    mhbId: string;
    version: number;
    name: string;
    desc: string;
    semester: string;
    spId: string;
    poVersion: number;
    mgs: ModuleGroup[];
  
    constructor(id: string, version: number, name: string, desc: string, semester: string, spId: string, poVersion: number) {
        this.mhbId = id;
        this.version = version;
        this.name = name;
        this.desc = desc;
        this.semester = semester;
        this.spId = spId;
        this.poVersion = poVersion;
        this.mgs = [];
    }
  
    addModuleGroups(mgs: ModuleGroup[]) {
      this.mgs = this.mgs.concat(mgs);
    }
}

