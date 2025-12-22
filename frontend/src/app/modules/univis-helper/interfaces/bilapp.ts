import { Fulfillment } from "../../../../../../interfaces/competence"

export interface BilAppCourse extends BilAppCourseShort {
    desc: string,
    sws: number,
    type: string,
    ects: number,
    semester: string,
    creator: string,
    modules: BilAppModule[],
    comp: Fulfillment[]
}

export interface BilAppCourseShort {
    id: string,
    name: string
}
 
export interface BilAppModule {
    modId: string
}