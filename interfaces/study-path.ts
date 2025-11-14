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

// holds past exams
export interface PathModule extends UserGeneratedModuleTemplate {
  _id?: string;
  semester: string;
  isUserGenerated: boolean;
  flexNowImported: boolean;
  grade: number;
  // exams: Exam[];
}

// each exam can have several attempts
export interface Exam {
  name: string;
  attempts: ExamAttempt[];
}

// holds attempt for each exam
export interface ExamAttempt {
  semester: string;
  status: string;
  grade: number;
}

export interface PathCourse extends PlanCourse {
  semester: string
}