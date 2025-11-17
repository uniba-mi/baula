import { ExtendedJob, Job } from "./job";
import { TimetableSettings } from "./semester-plan";
import { PathModule, StudyPath } from "./study-path";
export interface MetaUser {
    _id: string;
    shibId: string;
    roles: string[];
    authType: string;
    interests?: string[];
    topics: string[];
    compAims?: CompAim[];
    startSemester?: string;
    duration?: number;
    maxEcts?: number;
    sps?: MStudyProgramme[];
    fulltime: boolean;
    dashboardSettings: ChartVisibility[];
    timetableSettings: TimetableSettings[];
    favouriteModulesAcronyms: string[];
    excludedModulesAcronyms: string[];
    moduleFeedback?: ModuleFeedback[];
    hints?: Hint[];
    consents: Consent[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserServer extends MetaUser {
    jobs?: Job[];
    completedModules: PathModule[];
}
export interface User extends MetaUser {
    jobs?: ExtendedJob[];
    studyPath: StudyPath;
    sync?: boolean;
}
export interface ChartVisibility {
    key: string;
    visible: boolean;
}
export interface MStudyProgramme {
    spId: string;
    poVersion: number;
    name: string;
    faculty: string;
    mhbId: string;
    mhbVersion: number;
}
export interface Status {
    status: string;
    name: string;
    iconClass: string;
}
export interface CompAim {
    compId: string;
    aim: number;
    standard: string;
    parent?: string;
}
export interface Hint {
    key: string;
    hasConfirmed: boolean;
}
export interface Consent {
    ctype: ConsentType;
    hasConfirmed: boolean;
    hasResponded?: boolean;
    timestamp: Date;
}
export interface Feedback {
    similarmods?: number;
    similarchair?: number;
    priorknowledge?: number;
    contentmatch?: number;
}
export interface ModuleFeedback extends Feedback {
    acronym: string;
}
export type ConsentType = 'upload-exam-data' | '2512-privacy-change' | 'flexnow-api' | 'terms-of-use' | 'bakule-survey';
export declare function convertUserRole(userRole: string | string[]): string[];
