import { Course } from "../../../../../../interfaces/course";


export class CourseList {
    containerId: string;
    containerName: string;
    emptyMessage: string;
    courses?: Course[];

    constructor(id: string, name:string, courses:Course[] = []) {
        this.containerId = id;
        this.containerName = name;
        this.courses = courses;
    }
}