import { Course } from "./course";
import { UserGeneratedModule } from "./user-generated-module";
export interface SemesterPlan extends SemesterPlanTemplate {
    _id: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface SemesterPlanTemplate extends StudySemester {
    modules: string[];
    userGeneratedModules: UserGeneratedModule[];
    courses: PlanCourse[];
    userId?: string;
}
export interface MetaSemester {
    semester: string;
    isPastSemester: boolean;
    expanded: boolean;
}
export interface StudySemester extends MetaSemester {
    aimedEcts: number;
    summedEcts: number;
}
export type ItemActionName = 'feedback' | 'edit' | 'delete' | 'changeMG' | 'editGrade' | 'select' | 'drag' | 'moveToSem';
export interface PlanCourse {
    id: string;
    name: string;
    status: string;
    sws?: number | null;
    ects?: number | null;
    contributeTo: string;
    contributeAs: string;
}
export interface DeletedCourse extends PlanCourse {
    isDeleted: boolean;
}
export interface TimetableSettings {
    showWeekends: boolean;
    [key: string]: boolean | string | number | undefined;
}
export interface PlanningHints {
    type: string;
    context: 'course-planning' | 'module-planning';
    begin: string;
    end: string;
    acronym?: string;
    courses?: Course[];
}
export interface CollidingEvent {
    title: string;
    start: Date;
    end: Date;
    course?: Course;
}
