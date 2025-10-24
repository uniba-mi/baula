import { CompetenceFulfillment } from './competence';
import { ModuleCourse } from './module-course';
import { Person } from './person';
import { Room } from './room';
import { PlanCourse } from './semesterplan';
export interface Term {
    startdate: string;
    enddate?: string | null;
    starttime: string;
    endtime: string;
    repeat: string;
    exclude: string;
    roomId?: string | null;
    room?: Room | null;
}
export interface UnivISCourse {
    id: string;
    name: string;
    short?: string;
    organizational: string;
    desc?: string;
    literature: string;
    orgname: string;
    chair: string;
    type: string;
    ects?: number | null;
    sws?: number | null;
    terms: Term[];
    dozs: {
        person: Person;
    }[];
    semester: string;
    participationCopy: boolean;
    importCopy: boolean;
    children?: {
        key: string;
    }[];
    keywords?: string;
    lang?: string;
    expAttendance?: number | null;
    format?: string;
    benschein: boolean;
    schein: boolean;
    entre: boolean;
    erwei: boolean;
    frueh: boolean;
    gasth: boolean;
    generale: boolean;
    kultur: boolean;
    modulstud: boolean;
    nach: boolean;
    spracha: boolean;
    womspe: boolean;
    zemas: boolean;
    zenis: boolean;
    nameEn: string;
    literatureEn: string;
    organizationalEn: string;
    descEn: string;
}
export interface Course {
    id: string;
    name: string;
    short?: string | null;
    organizational?: string | null;
    desc?: string | null;
    literature?: string | null;
    addInfo?: string | null;
    orgname: string;
    chair: string;
    type: string;
    ects?: number | null;
    sws?: number | null;
    terms: Term[];
    dozs: Person[];
    semester: string;
    lastUpdated?: string;
    competence: CompetenceFulfillment[];
    mCourses?: {
        modCourse: ModuleCourse;
    }[];
    expandedContent?: boolean;
    keywords?: string;
    lang?: string;
    expAttendance?: number | null;
    format?: string;
    nameEn: string;
    literatureEn: string;
    organizationalEn: string;
    descEn: string;
}
export interface ExpandedCourse extends PlanCourse, Course {
}
