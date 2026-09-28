import { PlanCourse, StudySemester } from "./semester-plan";
import { UserGeneratedModuleTemplate } from "./user-generated-module";

export interface StudyPath {
  completedModules: PathModule[];
  completedCourses: PathCourse[];
}

export interface SemesterStudyPath extends StudySemester {
  modules: PathModule[],
  courses: PathCourse[],
}

// completed or ongoing module of the study path
export interface PathModule extends UserGeneratedModuleTemplate {
  _id?: string;
  semester: string;
  isUserGenerated: boolean;
  flexNowImported: boolean;
  grade: number;
  // optional - leaving it out keeps the stored attempts, sending [] clears them
  examAttempts?: ExamAttempt[];
}

// a single exam attempt (FlexNow: Studium/Prfstds/Prfstd)
export interface ExamAttempt {
  examId?: string, // Teilprf/ModulPrf/@ModulPrf, not always present
  name: string, // Teilprf/Bez
  count: number, // number of the attempt
  grade: number | null, // null while the attempt is not graded
  semester: string, // univis format yyyy(s|w), not the FlexNow apnr
  status: string, // taken | failed | passed
  remark: string, // Prfbem/Bez
  flexNowImported: boolean // missing or false means entered by the user
}

export interface PathCourse extends PlanCourse {
  semester: string
}
