import { Exam } from "./exam";
import { ModuleCourse } from "./module-course";
import { Person } from "./person";
export declare class Module {
    _id?: string;
    mId: string;
    version: number;
    acronym: string;
    mgId: string;
    name: string;
    content: string;
    skills: string;
    addInfo: string;
    priorKnowledge: string;
    ects: number;
    type: string;
    term: string;
    recTerm: string;
    duration: string;
    chair: string;
    respPerson?: Person | null;
    exams: Exam[];
    offerBegin?: string | null;
    offerEnd?: string | null;
    workload?: string | null;
    prevModules: any;
    extractedPrevModules: string[];
    allPriorModules: string[];
    mCourses: ModuleCourse[];
    isDropped: boolean;
    recSource?: 'new-chair' | 'less-popular' | null;
    isOld?: boolean;
    constructor(mId: string, version: number, acronym: string, name: string, content: string, skills: string, addInfo: string, priorKnowledge: string, ects: number, term: string, recTerm: string, duration: string, chair: string, respPerson: Person | null, exams: Exam[], prevModules: any, offerBegin?: string | null, offerEnd?: string | null, workload?: string | null);
    addCourses(courses: ModuleCourse[]): void;
    addParentMgId(mgId: string): void;
    addExtractedPrevModules(extractedPrevModules: string[]): void;
    addAllPriorModules(allPriorModules: string[]): void;
    addTypeInfo(type: string): void;
}
export interface ModuleAcronym {
    acronym: string;
    name: string;
}
export interface ModuleChangelog {
    oldModuleAcronym: string;
    oldModuleName: string;
    oldModuleSemesterEnd: string;
    newModuleAcronym: string;
    newModuleName: string;
    newModuleSemesterStart: string;
}
