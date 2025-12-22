import { SemesterPlan } from "./semester-plan";

export interface StudyPlan extends StudyPlanTemplate {
    _id: string,
    userId?: string,
    createdAt?: Date,
    updatedAt?: Date
}

export interface StudyPlanTemplate {
    name: string,
    status: boolean,
    semesterPlans: SemesterPlan[]
}