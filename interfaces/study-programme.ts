import { ModuleHandbook } from "./module-handbook";

export interface StudyProgramme {
    spId: string;
    poVersion: number;
    desc: string;
    faculty: string;
    name: string;
    date: string;
    mhbs?: ModuleHandbook[];
}

export interface StudyProgrammeChangelog {
    oldProgramId: string;
    newProgramId: string;
}