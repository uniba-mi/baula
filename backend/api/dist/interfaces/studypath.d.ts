import { PlanCourse, StudySemester } from "./semesterplan";
import { UserGeneratedModuleTemplate } from "./usergeneratedmodule";
export interface Studypath {
    completedModules: PathModule[];
    completedCourses: PathCourse[];
}
export interface SemesterStudyPath extends StudySemester {
    modules: PathModule[];
    courses: PathCourse[];
}
export interface PathModule extends UserGeneratedModuleTemplate {
    _id?: string;
    semester: string;
    isUserGenerated: boolean;
    flexNowImported: boolean;
    grade: number;
}
export interface Exam {
    name: string;
    attempts: ExamAttempt[];
}
export interface ExamAttempt {
    semester: string;
    status: string;
    grade: number;
}
export interface PathCourse extends PlanCourse {
    semester: string;
}
