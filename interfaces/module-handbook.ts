import { ModuleGroup } from "./module-group";

export class ModuleHandbook {
    mhbId: string;
    version: number;
    name: string;
    desc: string;
    semester: string;
    mgs: ModuleGroup[];
  
    constructor(id: string, version: number, name: string, desc: string, semester: string) {
        this.mhbId = id;
        this.version = version;
        this.name = name;
        this.desc = desc;
        this.semester = semester;
        this.mgs = [];
    }
  
    addModuleGroups(mgs: ModuleGroup[]) {
      this.mgs = this.mgs.concat(mgs);
    }
}

