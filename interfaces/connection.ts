import { ModuleCourse } from './module-course';
import { Course } from './course';

export interface ModuleCourse2CourseConnection {
    cId: string,
    course: Course,
    modCourse: ModuleCourse,
    mcId: string,
    semester: string,
}