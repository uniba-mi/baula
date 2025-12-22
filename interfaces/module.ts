import { Exam } from "./exam";
import { ModuleCourse } from "./module-course";
import { Person } from "./person";

export class Module {
  _id?: string; // needed for retrieval of status from study path
  mId: string;
  version: number;
  acronym: string;
  mgId: string; // parent mgId
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
  extractedPrevModules: string[]; // extracted module acronyms from prior knowledge
  allPriorModules: string[];
  mCourses: ModuleCourse[];
  isDropped: boolean;
  isOld?: boolean;

  constructor(
    mId: string,
    version: number,
    acronym: string,
    name: string,
    content: string,
    skills: string,
    addInfo: string,
    priorKnowledge: string,
    ects: number,
    term: string,
    recTerm: string,
    duration: string,
    chair: string,
    respPerson: Person | null,
    exams: Exam[],
    prevModules: any,
    offerBegin?: string | null,
    offerEnd?: string | null,
    workload?: string | null,
  ) {
    this.mId = mId;
    this.version = version;
    this.acronym = acronym;
    this.name = name;
    this.content = content;
    this.skills = skills;
    this.addInfo = addInfo;
    this.priorKnowledge = priorKnowledge;
    this.ects = ects;
    this.type = "";
    this.term = term;
    this.recTerm = recTerm;
    this.duration = duration;
    this.chair = chair;
    this.respPerson = respPerson ? respPerson : null;
    this.exams = exams;
    this.prevModules = prevModules;
    this.mgId = "";
    this.extractedPrevModules = [];
    this.allPriorModules = [];
    this.mCourses = [];
    this.isDropped = false;
    this.offerBegin = offerBegin;
    this.offerEnd = offerEnd;
    this.workload = workload;

    // for filtering
    type T = keyof typeof Module;
  }

  addCourses(courses: ModuleCourse[]) {
    this.mCourses = courses;
  }

  addParentMgId(mgId: string) {
    this.mgId = mgId;
  }

  addExtractedPrevModules(extractedPrevModules: string[]) {
    this.extractedPrevModules = extractedPrevModules;
  }

  addAllPriorModules(allPriorModules: string[]) {
    this.allPriorModules = allPriorModules;
  }

  addTypeInfo(type: string) {
    this.type = type;
  }
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