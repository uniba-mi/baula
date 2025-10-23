import { Semesterplan } from "./semesterplan";

export interface Studyplan extends StudyplanTemplate {
    _id: string,
    userId?: string,
    createdAt?: Date,
    updatedAt?: Date
}

export interface StudyplanTemplate {
    name: string,
    status: boolean,
    semesterPlans: Semesterplan[]
}