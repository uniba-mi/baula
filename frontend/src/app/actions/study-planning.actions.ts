import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  UserGeneratedModule,
  UserGeneratedModuleTemplate
} from '../../../../interfaces/usergeneratedmodule';
import { Studyplan, StudyplanTemplate } from '../../../../interfaces/studyplan';
import { PlanCourse, PlanningHints, Semesterplan, SemesterplanTemplate } from '../../../../interfaces/semesterplan';
import { Course } from '../../../../interfaces/course';

/************** GENERAL *********************/

export const StudyplanActions = createActionGroup({
  source: 'Studyplan',
  events: {
    // load Studyplans actions
    'Load Studyplans': emptyProps(),
    'Load Studyplans Success': props<{ studyplans: Studyplan[] }>(),
    'Load Studyplans Failure': props<{ error: HttpErrorResponse }>(),

    // select Studyplans actions
    'Select Studyplan': props<{ studyplanId: string }>(),
    'Deselect Studyplan': emptyProps(),

    // Studyplan CRUD Operations
    // Create
    'Create Studyplan': props<{ studyplan: StudyplanTemplate; semesterPlans: SemesterplanTemplate[] }>(),
    'Create Studyplan Success': props<{ studyplan: Studyplan; semesterPlans: SemesterplanTemplate[]; }>(),
    'Create Studyplan Failure': props<{ error: HttpErrorResponse }>(),
    // Load
    'Load Active Studyplan': emptyProps(),
    'Load Active Studyplan Success': props<{ studyplan: Studyplan }>(),
    'Load Active Studyplan Failure': props<{ error: HttpErrorResponse }>(),
    // Update
    'Update Studyplan': props<{ studyplanId: string; studyplan: StudyplanTemplate }>(),
    'Update Studyplan Success': props<{ studyplanId: string; studyplan: StudyplanTemplate }>(),
    'Update Studyplan Failure': props<{ error: HttpErrorResponse }>(),
    // Delete
    'Delete Studyplan': props<{ studyplanId: string }>(),
    'Delete Studyplan Success': props<{ studyplanId: string }>(),
    'Delete Studyplan Failure': props<{ error: HttpErrorResponse }>()
  }
});

export const SemesterplanActions = createActionGroup({
  source: 'Semesterplan',
  events: {
    'Init Semesterplans': props<{ studyplanId: string; semesterPlans: SemesterplanTemplate[]; }>(),
    'Init Semesterplans Success': props<{ studyplanId: string; semesterPlans: Semesterplan[] }>(),
    'Init Semesterplans Failure': props<{ error: HttpErrorResponse }>(),

    'Add Semesterplan to Studyplan': props<{ semester: string, studyplanId: string }>(),
    'Add Semesterplan to Studyplan Success': props<{ studyplanId: string; studyplan: Studyplan }>(),
    'Add Semesterplan to Studyplan Failure': props<{ error: HttpErrorResponse }>(),

    'Update Is Past Semester': props<{ studyplanId: string; semesterplanId: string; isPast: boolean }>(),
    'Update Is Past Semester Success': props<{ studyplanId: string; semesterplanId: string; isPast: boolean }>(),
    'Update Is Past Semester Failure': props<{ error: HttpErrorResponse }>(),

    'Update Aimed Ects': props<{ studyplanId: string; semesterplanId: string; aimedEcts: number; }>(),
    'Update Aimed Ects Success': props<{ studyplanId: string; semesterplanId: string; aimedEcts: number; }>(),
    'Update Aimed Ects Failure': props<{ error: HttpErrorResponse }>(),

    'Update Show Finish Semester Hint': props<{ showFinishSemesterHint: boolean; }>(),
  }
});

export const TimetableActions = createActionGroup({
  source: 'Timetable',
  events: {
    'Update Active Semester': props<{ semester: string }>(),

    'Import Semesterplan': props<{ newSemesterplan: SemesterplanTemplate }>(),
    'Import Semesterplan Success': props<{ newSemesterplan: Semesterplan }>(),
    'Import Semesterplan Failure': props<{ error: HttpErrorResponse }>(),

    'Update Planning Hints': props<{ hints: PlanningHints[] }>(),
  }
});

/************ USER GENERATED MODULE CRUD **************** */
export const UserGeneratedModuleActions = createActionGroup({
  source: 'User Generated Module',
  events: {
    // Create
    'Create User Generated Module': props<{ studyplanId: string; semesterplanId: string; module: UserGeneratedModuleTemplate; }>(),
    'Create User Generated Module Success': props<{ studyplanId: string; semesterplanId: string; module: UserGeneratedModule; }>(),
    'Create User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Update
    'Update User Generated Module': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, moduleId: string; module: UserGeneratedModule; }>(),
    'Update User Generated Module Success': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, moduleId: string; module: UserGeneratedModule; }>(),
    'Update User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Transfer UserGeneratedModule between Semesterplans
    'Transfer User Generated Module': props<{ studyplanId: string; oldSemesterplanId: string; oldSemesterplanSemester: string, newSemesterplanId: string, newSemesterplanSemester: string, module: UserGeneratedModule }>(),
    'Transfer User Generated Module Success': props<{ studyplanId: string, oldSemesterplan: Semesterplan, newSemesterplan: Semesterplan }>(),
    'Transfer User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Delete
    'Delete User Generated Module': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, module: UserGeneratedModule; }>(),
    'Delete User Generated Module Success': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, module: UserGeneratedModule; }>(),
    'Delete User Generated Module Failure': props<{ error: HttpErrorResponse }>(),
    // Delete several at once
    'Delete User Generated Modules': props<{ studyplanId: string; semesterplanId: string; moduleIds: string[]; }>(),
    'Delete User Generated Modules Success': props<{ studyplanId: string; semesterplanId: string; deletedModules: UserGeneratedModule[]; }>(),
    'Delete User Generated Modules Failure': props<{ error: HttpErrorResponse }>()
  }
});

/************ MODULE PLANNING CRUD **************** */
export const ModulePlanningActions = createActionGroup({
  source: 'Module Planning',
  events: {
    // Plan Module for Specific Studyplan and Semester
    'Add Module To Semester': props<{ studyplanId: string; semesterplanId: string; acronym: string; ects: number; }>(),
    'Add Module To Semester Success': props<{ studyplanId: string; semesterplanId: string; acronym: string; ects: number; }>(),
    'Add Module To Semester Failure': props<{ error: HttpErrorResponse }>(),

    // Plan Modules into All Studyplans (for uploading current modules in the flex now upload (Anerkennungen, Belegte Module, ...))
    'Add Modules To Current Semester Of All Studyplans': props<{ modules: UserGeneratedModuleTemplate[], semesterName: string }>(),
    'Add Modules To Current Semester Of All Studyplans Success': props<{ studyplans: Studyplan[] }>(),
    'Add Modules To Current Semester Of All Studyplans Failure': props<{ error: HttpErrorResponse }>(),

    // Transfer Module between Semesterplans
    'Transfer Module': props<{ studyplanId: string; oldSemesterplanId: string; oldSemesterplanSemester: string, newSemesterplanId: string, newSemesterplanSemester: string, acronym: string; ects: number; }>(),
    'Transfer Module Success': props<{ studyplanId: string, oldSemesterplan: Semesterplan, oldSemesterplanSemester: string, newSemesterplan: Semesterplan, newSemesterplanSemester: string }>(),
    'Transfer Module Failure': props<{ error: HttpErrorResponse }>(),

    // Delete Module for Specific Studyplan and Semester
    'Delete Module From Semesterplan': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, acronym: string; ects: number; }>(),
    'Delete Module From Semesterplan Success': props<{ studyplanId: string; semesterplanId: string; semesterplanSemester: string, acronym: string; ects: number; }>(),
    'Delete Module From Semesterplan Failure': props<{ error: HttpErrorResponse }>()
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

    // Update Courses Array is used for select and deselect of single or multiple courses to update the courses array within a semesterplan
    'Update Courses Array In Semesterplan': props<{ courses: PlanCourse[] }>()
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
