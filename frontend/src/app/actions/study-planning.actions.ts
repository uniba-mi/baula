import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  UserGeneratedModule,
  UserGeneratedModuleTemplate
} from '../../../../interfaces/user-generated-module';
import { StudyPlan, StudyPlanTemplate } from '../../../../interfaces/study-plan';
import { PlanCourse, PlanningHints, SemesterPlan, SemesterPlanTemplate } from '../../../../interfaces/semester-plan';
import { Course } from '../../../../interfaces/course';

/************** GENERAL *********************/

export const StudyPlanActions = createActionGroup({
  source: 'Study Plan',
  events: {
    // Load
    'Load Study Plans': emptyProps(),
    'Load Study Plans Success': props<{ studyPlans: StudyPlan[] }>(),
    'Load Study Plans Failure': props<{ error: HttpErrorResponse }>(),

    // Select
    'Select Study Plan': props<{ studyPlanId: string }>(),
    'Deselect Study Plan': emptyProps(),

    // CRUD Operations
    // Create
    'Create Study Plan': props<{ studyPlan: StudyPlanTemplate; semesterPlans: SemesterPlanTemplate[] }>(),
    'Create Study Plan Success': props<{ studyPlan: StudyPlan; semesterPlans: SemesterPlanTemplate[]; }>(),
    'Create Study Plan Failure': props<{ error: HttpErrorResponse }>(),
    // Load
    'Load Active Study Plan': emptyProps(),
    'Load Active Study Plan Success': props<{ studyPlan: StudyPlan }>(),
    'Load Active Study Plan Failure': props<{ error: HttpErrorResponse }>(),
    // Update
    'Update Study Plan': props<{ studyPlanId: string; studyPlan: StudyPlanTemplate }>(),
    'Update Study Plan Success': props<{ studyPlanId: string; studyPlan: StudyPlanTemplate }>(),
    'Update Study Plan Failure': props<{ error: HttpErrorResponse }>(),
    // Delete
    'Delete Study Plan': props<{ studyPlanId: string }>(),
    'Delete Study Plan Success': props<{ studyPlanId: string }>(),
    'Delete Study Plan Failure': props<{ error: HttpErrorResponse }>()
  }
});

export const SemesterPlanActions = createActionGroup({
  source: 'Semester Plan',
  events: {
    'Init Semester Plans': props<{ studyPlanId: string; semesterPlans: SemesterPlanTemplate[]; }>(),
    'Init Semester Plans Success': props<{ studyPlanId: string; semesterPlans: SemesterPlan[] }>(),
    'Init Semester Plans Failure': props<{ error: HttpErrorResponse }>(),

    'Add Semester Plan to Study Plan': props<{ semester: string, studyPlanId: string }>(),
    'Add Semester Plan to Study Plan Success': props<{ studyPlanId: string; studyPlan: StudyPlan }>(),
    'Add Semester Plan to Study Plan Failure': props<{ error: HttpErrorResponse }>(),

    'Update Is Past Semester': props<{ studyPlanId: string; semesterPlanId: string; isPast: boolean }>(),
    'Update Is Past Semester Success': props<{ studyPlanId: string; semesterPlanId: string; isPast: boolean }>(),
    'Update Is Past Semester Failure': props<{ error: HttpErrorResponse }>(),

    'Update Aimed Ects': props<{ studyPlanId: string; semesterPlanId: string; aimedEcts: number; }>(),
    'Update Aimed Ects Success': props<{ studyPlanId: string; semesterPlanId: string; aimedEcts: number; }>(),
    'Update Aimed Ects Failure': props<{ error: HttpErrorResponse }>(),

    'Update Show Finish Semester Hint': props<{ showFinishSemesterHint: boolean; }>(),
  }
});

export const TimetableActions = createActionGroup({
  source: 'Timetable',
  events: {
    'Update Active Semester': props<{ semester: string }>(),

    'Import Semester Plan': props<{ newSemesterPlan: SemesterPlanTemplate }>(),
    'Import Semester Plan Success': props<{ newSemesterPlan: SemesterPlan }>(),
    'Import Semester Plan Failure': props<{ error: HttpErrorResponse }>(),

    'Update Planning Hints': props<{ hints: PlanningHints[] }>(),
  }
});

/************ USER GENERATED MODULE CRUD **************** */
export const UserGeneratedModuleActions = createActionGroup({
  source: 'User Generated Module',
  events: {
    // Create
    'Create User Generated Module': props<{ studyPlanId: string; semesterPlanId: string; module: UserGeneratedModuleTemplate; }>(),
    'Create User Generated Module Success': props<{ studyPlanId: string; semesterPlanId: string; module: UserGeneratedModule; }>(),
    'Create User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Update
    'Update User Generated Module': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, moduleId: string; module: UserGeneratedModule; }>(),
    'Update User Generated Module Success': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, moduleId: string; module: UserGeneratedModule; }>(),
    'Update User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Transfer UserGeneratedModule between semester plans
    'Transfer User Generated Module': props<{ studyPlanId: string; oldSemesterPlanId: string; oldSemesterPlanSemester: string, newSemesterPlanId: string, newSemesterPlanSemester: string, module: UserGeneratedModule }>(),
    'Transfer User Generated Module Success': props<{ studyPlanId: string, oldSemesterPlan: SemesterPlan, newSemesterPlan: SemesterPlan }>(),
    'Transfer User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Delete
    'Delete User Generated Module': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, module: UserGeneratedModule; }>(),
    'Delete User Generated Module Success': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, module: UserGeneratedModule; }>(),
    'Delete User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Delete several at once
    'Delete User Generated Modules': props<{ studyPlanId: string; semesterPlanId: string; moduleIds: string[]; }>(),
    'Delete User Generated Modules Success': props<{ studyPlanId: string; semesterPlanId: string; deletedModules: UserGeneratedModule[]; }>(),
    'Delete User Generated Modules Failure': props<{ error: HttpErrorResponse }>()
  }
});

/************ MODULE PLANNING CRUD **************** */
export const ModulePlanningActions = createActionGroup({
  source: 'Module Planning',
  events: {
    // Plan Module for Specific Study plan and Semester
    'Add Module To Semester': props<{ studyPlanId: string; semesterPlanId: string; acronym: string; ects: number; }>(),
    'Add Module To Semester Success': props<{ studyPlanId: string; semesterPlanId: string; acronym: string; ects: number; }>(),
    'Add Module To Semester Failure': props<{ error: HttpErrorResponse }>(),

    // Plan Modules into All Study Plans (for uploading current modules in the flex now upload (Anerkennungen, Belegte Module, ...))
    'Add Modules To Current Semester Of All Study Plans': props<{ modules: UserGeneratedModuleTemplate[], semesterName: string }>(),
    'Add Modules To Current Semester Of All Study Plans Success': props<{ studyPlans: StudyPlan[] }>(),
    'Add Modules To Current Semester Of All Study Plans Failure': props<{ error: HttpErrorResponse }>(),

    // Transfer Module between semester plans
    'Transfer Module': props<{ studyPlanId: string; oldSemesterPlanId: string; oldSemesterPlanSemester: string, newSemesterPlanId: string, newSemesterPlanSemester: string, acronym: string; ects: number; }>(),
    'Transfer Module Success': props<{ studyPlanId: string, oldSemesterPlan: SemesterPlan, oldSemesterPlanSemester: string, newSemesterPlan: SemesterPlan, newSemesterPlanSemester: string }>(),
    'Transfer Module Failure': props<{ error: HttpErrorResponse }>(),

    // Delete Module for Specific Study plan and Semester
    'Delete Module From Semester Plan': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, acronym: string; ects: number; }>(),
    'Delete Module From Semester Plan Success': props<{ studyPlanId: string; semesterPlanId: string; semesterPlanSemester: string, acronym: string; ects: number; }>(),
    'Delete Module From Semester Plan Failure': props<{ error: HttpErrorResponse }>()
  }
});

/************ COURSE PLANNING CRUD **************** */
export const CoursePlanningActions = createActionGroup({
  source: 'Course Planning',
  events: {
    'Select Course': props<{ course: Course, contributeTo?: string, contributeAs?: string, sws?: number, ects?: number, isPastSemester: boolean }>(),
    'Select Course Failure': props<{ error: HttpErrorResponse }>(),

    'Deselect Course': props<{ semester: string, courseId: string }>(),
    'Deselect Course Failure': props<{ error: HttpErrorResponse }>(),

    'Select Courses': props<{ courses: PlanCourse[], isPastSemester: boolean, semester: string }>(),
    'Select Courses Failure': props<{ error: HttpErrorResponse }>(),

    'Deselect Courses': props<{ courseIds: string[], semester: string }>(),
    'Deselect Courses Failure': props<{ error: HttpErrorResponse }>(),

    // Update Courses Array is used for select and deselect of single or multiple courses to update the courses array within a semester plan
    'Update Courses Array In Semester Plan': props<{ courses: PlanCourse[] }>()
  }
});

/************ LOADING **************** */
export const LoadingActions = createActionGroup({
  source: 'Loading',
  events: {
    'Start Loading': emptyProps(),
    'Stop Loading': emptyProps()
  }
})
