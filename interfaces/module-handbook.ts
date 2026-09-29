import { ModuleGroup } from "./module-group";

export class ModuleHandbook {
    mhbId: string;
    version: number;
    name: string;
    desc: string;
    semester: string;
    mgs: ModuleGroup[];
    upToDate: boolean;
  
    constructor(id: string, version: number, name: string, desc: string, semester: string, versions: number[]) {
        this.mhbId = id;
        this.version = version;
        this.name = name;
        this.desc = desc;
        this.semester = semester;
        this.mgs = [];
        this.upToDate = this.isUpToDate(versions);
    }
  
    addModuleGroups(mgs: ModuleGroup[]) {
      this.mgs = this.mgs.concat(mgs);
    }

    isUpToDate(versionsOfOtherMhbs: number[]): boolean {
        versionsOfOtherMhbs.sort((a: number, b: number) => b - a)
        const highestVersion = versionsOfOtherMhbs[0];

        return highestVersion === this.version;
    }
}

