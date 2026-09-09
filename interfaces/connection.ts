import { ModuleCourse } from './module-course';
import { Course } from './course';

export interface ModuleCourse2CourseConnection {
    cId: string,
    course: Course,
    modCourse: ModuleCourse,
    mcId: string,
    semester: string,
}

/**
 * Plain link between a module course and a course, without the joined rows.
 * Used where the courses are already loaded separately (admin module-course overview), so that
 * the full course and module course are not sent a second time for every single link.
 */
export interface ModuleCourse2CourseLink {
    mcId: string,
    cId: string,
    semester: string,
}
