import { CompetenceFulfillment } from './competence';
import { ModuleCourse } from './module-course';
import { Person } from './person';
import { Room } from './room';
import { PlanCourse } from './semester-plan';

export interface Term {
  startdate: string,
  enddate?: string | null,
  starttime: string,
  endtime: string,
  repeat: string,
  exclude: string,
  roomId?: string | null,
  room?: Room | null
}

export interface UnivISCourse {
  id: string,
  name: string,
  short?: string,
  organizational: string,
  desc?: string,
  literature: string,
  orgname: string,
  chair: string,
  type: string,
  ects?: number | null,
  sws?: number | null,
  terms: Term[];
  dozs: { person: Person }[];
  semester: string;
  participationCopy: boolean,
  importCopy: boolean,
  children?: {key: string}[]
  keywords?: string,
  lang?: string, 
  expAttendance?: number | null, 
  format?: string, /* praesenz (Präsenz), 
                        hybrid (Präsenz + Online-Anteile), 
                        both (Präsenz/Online parallel),
                        online (Rein Online),
                        none (Fällt aus) */

  // additional information, that will be merged into add_info later
  benschein: boolean, // benoteter Schein
  schein: boolean, // Schein
  entre: boolean, // Entrepreneurship und Existenzgründung
  erwei: boolean, // Erweiterungsbereich
  frueh: boolean, // Frühstudium
  gasth: boolean, // Gaststudierendenverzeichnis
  generale: boolean, // Studium Generale
  kultur: boolean, // Kultur und Bildung
  modulstud: boolean, // Modulstudium
  nach: boolean, // Nachhaltigkeit
  spracha: boolean, // Sprachangebot
  womspe: boolean, // Gender und Diversität
  zemas: boolean, // Zentrum für Mittelalterstudien
  zenis: boolean, // Zentrum für Interreligiöse Studien

  // english course information
  nameEn: string,
  literatureEn: string,
  organizationalEn: string,
  descEn: string
}

export interface Course {
  id: string
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
  mCourses?: { modCourse: ModuleCourse }[];
  expandedContent?: boolean;
  keywords?: string,
  lang?: string, 
  expAttendance?: number | null, 
  format?: string, /* praesenz (Präsenz), 
                        hybrid (Präsenz + Online-Anteile), 
                        both (Präsenz/Online parallel),
                        online (Rein Online),
                        none (Fällt aus) */
  // english course information
  nameEn: string,
  literatureEn: string,
  organizationalEn: string,
  descEn: string
}

export interface ExpandedCourse extends PlanCourse, Course {

}