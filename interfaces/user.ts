import { ExtendedJob, Job } from "./job";
import { TimetableSettings } from "./semester-plan";
import { PathModule, StudyPath } from "./study-path";

/* MetaUser is a general interface that summarize all attributes all users have whether server or client side */
export interface MetaUser {
  _id: string;
  shibId: string;
  roles: string[];
  authType: string;
  interests?: string[];
  topics: string[];
  compAims?: CompAim[]; // additional information for competence aims
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

/* UserServer integrates all attributes from MetaUser and adds the completedModules.
 * this interface is used to validate the mongo schema on the server side.
 */
export interface UserServer extends MetaUser {
  jobs?: Job[];
  completedModules: PathModule[]
}

/* User adds the study path to the MetaUser and represents the client side user structure. StudyPath represents all completedModules and completedCourses and is generated on the serverside */
export interface User extends MetaUser {
  jobs?: ExtendedJob[];
  studyPath: StudyPath;
  // additional attribute to mark if user is sync with database
  sync?: boolean;
}

export interface ChartVisibility {
  key: string;
  visible: boolean;
  // add addtional aspects in future
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

// Interface for competence aim
export interface CompAim {
  compId: string;
  aim: number;
  standard: string;
  parent?: string;
}

export interface Hint {
  key: string,
  hasConfirmed: boolean,
}

export interface Consent {
  ctype: ConsentType,
  hasConfirmed: boolean,
  hasResponded?: boolean,
  timestamp: Date,
}

export interface Feedback {
  similarmods?: number,
  similarchair?: number,
  priorknowledge?: number,
  contentmatch?: number,
}

export interface ModuleFeedback extends Feedback {
  acronym: string,
}

export type ConsentType = 'upload-exam-data' | '2512-privacy-change' | 'flexnow-api' | 'terms-of-use' | 'bakule-survey'; // add further options with |

export function convertUserRole(userRole: string | string[]): string[] {
  // Konvertierer @ in eindeutige Nutzerrollen (z.B. employee, student usw.) und trenne vorher beim ; oder ,
  let roles: string[] = [];

  if (typeof userRole == "string") {
    // check for comma or semicolon
    const userRoles =
      userRole.split(";").length != 1
        ? userRole.split(";")
        : userRole.split(",");

    for (const role of userRoles) {
      roles.push(role.split("@")[0]);
    }
  } else {
    for (const role of userRole) {
      roles.push(role.split("@")[0]);
    }
  }
  return roles;
}