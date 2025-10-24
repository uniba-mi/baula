import { Modulehandbook } from "./modulehandbook";
export interface Studyprogramme {
    spId: string;
    poVersion: number;
    desc: string;
    faculty: string;
    name: string;
    date: string;
    mhbs?: Modulehandbook[];
}
export interface StudyProgrammeChangelog {
    oldProgramId: string;
    newProgramId: string;
}
