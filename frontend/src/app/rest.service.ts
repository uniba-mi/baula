import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Module } from '../../../interfaces/module';
import { Course } from '../../../interfaces/course';
import { StudyProgramme } from '../../../interfaces/study-programme';
import { ModuleHandbook } from '../../../interfaces/module-handbook';
import { StudyPlan, StudyPlanTemplate } from '../../../interfaces/study-plan';
import {
  UserGeneratedModule,
  UserGeneratedModuleTemplate,
} from '../../../interfaces/user-generated-module';
import { StudyPath, PathModule } from '../../../interfaces/study-path';
import {
  ChartVisibility,
  CompAim,
  Hint,
  Consent,
  User,
  ConsentType,
  ModuleFeedback,
} from '../../../interfaces/user';
import {
  PlanCourse,
  SemesterPlan,
  SemesterPlanTemplate,
  TimetableSettings,
} from '../../../interfaces/semester-plan';
import { config } from 'src/environments/config.local';
import { AcademicDate, DateType } from '../../../interfaces/academic-date';
import { FnUser } from '../../../interfaces/fn-user';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private urlBase = config.apiUrl + 'baula/';

  constructor(private http: HttpClient) { }
  /* -----------------------------
   * All Queries regarding the User
  --------------------------------*/
  /** create new User
   * @param user values of new user
   * @returns Observable of type any, contains message if create is successful */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.urlBase}user/`, { user }, httpOptions);
  }

  deleteUser(): Observable<string> {
    return this.http.delete<string>(`${this.urlBase}user/`, httpOptions);
  }

  deleteJob(jobId: string): Observable<string> {
    return this.http.delete<string>(`${this.urlBase}user/job`, {
      body: { id: jobId },
      headers: httpOptions.headers,
    });
  }

  /** update user settings
   * @param user updated values of the user
   * @returns Observable */
  updateUser(user: User): Observable<any> {
    const requestBody = {
      user: {
        ...user,
        studyPath: undefined,
        completedModules: user.studyPath.completedModules,
      },
    };
    return this.http.put<any>(this.urlBase + 'user/', requestBody, httpOptions);
  }

  getAcademicDatesOfSemester(semester: string): Observable<AcademicDate[]> {
    return this.http.get<AcademicDate[]>(
      `${this.urlBase}meta/academic-dates/${semester}`,
      httpOptions
    );
  }

  getDateTypes(): Observable<DateType[]> {
    return this.http.get<DateType[]>(
      `${this.urlBase}meta/date-types`,
      httpOptions
    );
  }

  updateHint(key: string, hasConfirmed: boolean): Observable<Hint[]> {
    return this.http.put<Hint[]>(
      this.urlBase + 'user/hints',
      { key, hasConfirmed },
      httpOptions
    );
  }

  addConsent(
    ctype: ConsentType,
    hasConfirmed: boolean,
    hasResponded: boolean,
    timestamp: Date
  ): Observable<Consent[]> {
    return this.http.post<Consent[]>(
      this.urlBase + 'user/consents',
      { ctype, hasConfirmed, hasResponded, timestamp },
      httpOptions
    );
  }

  updateModuleFeedback(
    feedback: ModuleFeedback
  ): Observable<ModuleFeedback> {
    return this.http.put<ModuleFeedback>(
      this.urlBase + 'user/module-feedback',
      { feedback },
      httpOptions
    );
  }

  updateDashboardSettings(
    chartName: string
  ): Observable<ChartVisibility[]> {
    return this.http.put<ChartVisibility[]>(
      this.urlBase + 'user/dashboard-settings',
      { chartName },
      httpOptions
    );
  }

  updateTimetableSettings(
    showWeekends: boolean
  ): Observable<TimetableSettings[]> {
    return this.http.put<TimetableSettings[]>(
      this.urlBase + 'user/timetable-settings',
      { showWeekends },
      httpOptions
    );
  }

  /** Updates the favourite module list of a user*/
  updateFavouriteModulesIds(acronym: string): Observable<string[]> {
    return this.http.put<string[]>(
      this.urlBase + 'user/favourite-module',
      { acronym },
      httpOptions
    );
  }

  /** Updates the list of modules the user wants to exclude */
  updateExcludedModules(acronym: string): Observable<string[]> {
    return this.http.put<string[]>(
      this.urlBase + 'user/excluded-module',
      { acronym },
      httpOptions
    );
  }

  /** Updates the list of topics the user finds interesting */
  toggleTopic(topic: string): Observable<string[]> {
    return this.http.put<{ topics: string[] }>(
      this.urlBase + 'user/topic',
      { topic },
      httpOptions
    ).pipe(
      map((response) => response.topics)
    );
  }

  /** Updates the competence aims of a user
   * @param aims that should be saved in database
   * @returns message to show in application */
  updateCompetenceAims(aims: CompAim[]): Observable<string> {
    return this.http.post<string>(
      `${this.urlBase}user/competence-aims`,
      { aims },
      httpOptions
    );
  }

  deleteModuleFeedback(feedback: ModuleFeedback): Observable<ModuleFeedback[]> {
    return this.http.delete<ModuleFeedback[]>(`${this.urlBase}user/module-feedback`, {
      body: {
        feedback,
      },
      headers: httpOptions.headers,
    });
  }

  /** get Userdata from shibId
   * @param shibId as input, should be queried before via shibboleth login
   * @returns the Userdata of the queried user.
   */
  getSingleUser(): Observable<User> {
    return this.http.get<User>(`${this.urlBase}user/`, httpOptions);
  }

  /* -----------------------
   * Queries regarding saved courses of user
  ---------------------------*/
  updateSemesterPlan(
    semester: string,
    semesterPlan: SemesterPlanTemplate
  ): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}semester-plans/`,
      { semester, semesterPlan },
      httpOptions
    );
  }

  addCourseToSemesterPlan(
    semester: string,
    course: PlanCourse,
    isPastSemester: boolean
  ): Observable<PlanCourse[]> {
    return this.http.post<PlanCourse[]>(
      `${this.urlBase}semester-plans/plan/course`,
      {
        semester,
        course,
        isPastSemester,
      },
      httpOptions
    );
  }

  deleteCourseFromSemesterPlan(
    semester: string,
    courseId: string
  ): Observable<PlanCourse[]> {
    return this.http.delete<PlanCourse[]>(
      `${this.urlBase}semester-plans/plan/course`,
      {
        body: {
          semester,
          courseId,
        },
        headers: httpOptions.headers,
      }
    );
  }

  addCoursesToSemesterPlan(
    semester: string,
    courses: PlanCourse[],
    isPastSemester: boolean
  ): Observable<PlanCourse[]> {
    return this.http.post<PlanCourse[]>(
      `${this.urlBase}semester-plans/plan/courses`,
      {
        semester,
        courses,
        isPastSemester,
      },
      httpOptions
    );
  }

  deleteCoursesFromSemesterPlan(
    semester: string,
    courseIds: string[]
  ): Observable<PlanCourse[]> {
    return this.http.delete<PlanCourse[]>(
      `${this.urlBase}semester-plans/plan/courses`,
      {
        body: {
          semester,
          courseIds,
        },
        headers: httpOptions.headers,
      }
    );
  }

  /** ---------------------------------------
   * REST Queries for Study Planning Assistant
      ---------------------------------------*/

  getStudyprogrammes(): Observable<StudyProgramme[]> {
    return this.http.get<StudyProgramme[]>(
      `${this.urlBase}study-programmes/`,
      httpOptions
    );
  }

  updateStudyprogramme(
    spId: string,
    poVersion: number,
    mhbId: string,
    mhbVersion: number
  ): Observable<StudyProgramme[]> {
    const body = {
      spId,
      poVersion,
      mhbId,
      mhbVersion,
    };
    return this.http.put<StudyProgramme[]>(
      `${this.urlBase}user/study-programmes`,
      body,
      httpOptions
    );
  }

  updateDuration(uId: string, duration: number): Observable<any> {
    const body = {
      uId,
      duration,
    };
    return this.http.put<any>(
      `${this.urlBase}user/duration`,
      body,
      httpOptions
    );
  }

  updateStartsemester(uId: string, startSemester: string): Observable<any> {
    const body = {
      uId,
      startSemester,
    };
    return this.http.put<any>(
      `${this.urlBase}user/startsemester`,
      body,
      httpOptions
    );
  }

  updateModuleInStudyPath(module: PathModule): Observable<StudyPath> {
    const body = {
      _id: module._id,
      acronym: module.acronym,
      name: module.name,
      status: module.status,
      ects: module.ects,
      grade: module.grade,
      semester: module.semester,
      // exams: module.exams,
      mgId: module.mgId,
      isUserGenerated: module.isUserGenerated,
      flexNowImported: module.flexNowImported
    };

    return this.http.put<StudyPath>(
      `${this.urlBase}user/study-path/module`,
      body,
      httpOptions
    );
  }

  updateStudyPath(completedModules: PathModule[]): Observable<StudyPath> {
    const body = {
      completedModules,
    };
    return this.http.put<StudyPath>(
      `${this.urlBase}user/study-path`,
      body,
      httpOptions
    );
  }

  finishSemester(
    completedModules: PathModule[], droppedModules: PathModule[], semester: string,
  ): Observable<StudyPath> {
    const body = {
      completedModules,
      droppedModules,
      semester,
    };
    return this.http.put<StudyPath>(
      `${this.urlBase}user/study-path/semester`,
      body,
      httpOptions
    );
  }

  deleteModuleFromStudyPath(
    id: string,
    semester: string
  ): Observable<StudyPath> {
    const body = {
      id,
      semester,
    };

    return this.http.delete<StudyPath>(`${this.urlBase}user/study-path/module`, {
      body,
      headers: httpOptions.headers,
    });
  }

  deleteStudyPath(): Observable<any> {
    return this.http.delete<StudyPath>(
      `${this.urlBase}user/study-path`,
      httpOptions
    );
  }

  deleteFavouriteModules(): Observable<any> {
    return this.http.delete<StudyPath>(
      `${this.urlBase}user/favourite-modules`,
      httpOptions
    );
  }

  deleteExcludedModules(): Observable<any> {
    return this.http.delete<StudyPath>(
      `${this.urlBase}user/excluded-modules`,
      httpOptions
    );
  }

  deleteExcludedModule(acronym: string): Observable<any> {
    return this.http.delete<StudyPath>(
      `${this.urlBase}user/excluded-module/${acronym}`,
      httpOptions
    );
  }

  getStudyprogrammeByIdAndVersion(
    id: string,
    version: number
  ): Observable<StudyProgramme> {
    return this.http.get<StudyProgramme>(
      `${this.urlBase}study-programmes/${id}/${version}`,
      httpOptions
    );
  }

  getModulhandbookStructure(
    id: string,
    version: number
  ): Observable<ModuleHandbook> {
    return this.http.get<ModuleHandbook>(
      `${this.urlBase}module-handbooks/${id}/${version}`,
      httpOptions
    );
  }

  getModuleByAcronymAndVersion(
    acronym: string,
    version?: number
  ): Observable<Module> {
    return this.http.get<Module>(
      `${this.urlBase}module-handbooks/modules/${acronym}/${version}`,
      httpOptions
    );
  }

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.urlBase}module-handbooks/modules`, httpOptions);
  }

  /**
   * STUDYPLAN Queries
   */
  // Get Requests
  getStudyPlans(): Observable<StudyPlan[]> {
    return this.http.get<StudyPlan[]>(
      `${this.urlBase}study-plans`,
      httpOptions
    );
  }

  checkTemplateAvailability(
    programId: string,
    semesterType: 'w' | 's'
  ): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.urlBase}study-plans/template/availablilty/${programId}/${semesterType}`,
      httpOptions
    );
  }

  getLatestTemplateForStudyProgram(
    programId: string,
    semesterType: 'w' | 's'
  ): Observable<StudyPlan> {
    return this.http.get<StudyPlan>(
      `${this.urlBase}study-plans/template/${programId}/${semesterType}`,
      httpOptions
    );
  }

  getActiveStudyPlan(): Observable<StudyPlan> {
    return this.http.get<StudyPlan>(
      `${this.urlBase}study-plans/plan/active`,
      httpOptions
    );
  }

  // Post Requests
  createStudyPlan(studyPlan: StudyPlanTemplate): Observable<StudyPlan> {
    const requestBody = { studyPlan };
    return this.http.post<StudyPlan>(
      `${this.urlBase}study-plans/plan`,
      requestBody,
      httpOptions
    );
  }

  initSemesterPlans(
    studyPlanId: string,
    semesterPlans: SemesterPlanTemplate[]
  ): Observable<SemesterPlan[]> {
    const body = { studyPlanId, semesterPlans };
    return this.http.post<SemesterPlan[]>(
      `${this.urlBase}semester-plans`,
      body,
      httpOptions
    );
  }

  addSemesterPlanToStudyPlan(
    studyPlanId: string,
    semester: string
  ): Observable<StudyPlan> {
    const body = { studyPlanId, semester };
    return this.http.post<StudyPlan>(
      `${this.urlBase}semester-plans/plan`,
      body,
      httpOptions
    );
  }

  addModule(
    studyPlanId: string,
    semesterPlanId: string,
    module: string,
    ects: number
  ): Observable<string> {
    const body = { studyPlanId, semesterPlanId, module, ects };
    return this.http.post<string>(
      `${this.urlBase}semester-plans/plan/module`,
      body,
      httpOptions
    );
  }

  addModulesToCurrentSemesterOfAllStudyPlans(
    modules: UserGeneratedModuleTemplate[],
    semesterName: string
  ): Observable<StudyPlan[]> {
    const body = { modules, semesterName };
    return this.http.post<StudyPlan[]>(
      `${this.urlBase}study-plans/modules`,
      body,
      httpOptions
    );
  }

  createUserGeneratedModule(
    studyPlanId: string,
    semesterPlanId: string,
    module: UserGeneratedModuleTemplate
  ): Observable<UserGeneratedModule> {
    const body = { studyPlanId, semesterPlanId, module };
    return this.http.post<UserGeneratedModule>(
      `${this.urlBase}semester-plans/plan/user-generated-module`,
      body,
      httpOptions
    );
  }

  transferModule(
    studyPlanId: string,
    oldSemesterPlanId: string,
    oldSemesterPlanSemester: string,
    newSemesterPlanId: string,
    newSemesterPlanSemester: string,
    acronym: string,
    ects: number
  ): Observable<{
    oldSemesterPlan: SemesterPlan;
    newSemesterPlan: SemesterPlan;
  }> {
    return this.http.put<{
      oldSemesterPlan: SemesterPlan;
      newSemesterPlan: SemesterPlan;
    }>(
      `${this.urlBase}study-plans/module/transfer`,
      {
        studyPlanId,
        oldSemesterPlanId,
        newSemesterPlanId,
        acronym,
        ects,
      },
      httpOptions
    );
  }

  transferUserGeneratedModule(
    studyPlanId: string,
    oldSemesterPlanId: string,
    newSemesterPlanId: string,
    newSemesterPlanSemester: string,
    module: UserGeneratedModule
  ): Observable<{
    oldSemesterPlan: SemesterPlan;
    newSemesterPlan: SemesterPlan;
  }> {
    return this.http.put<{
      oldSemesterPlan: SemesterPlan;
      newSemesterPlan: SemesterPlan;
    }>(
      `${this.urlBase}study-plans/user-generated-module/transfer`,
      {
        studyPlanId,
        oldSemesterPlanId,
        newSemesterPlanId,
        newSemesterPlanSemester,
        module,
      },
      httpOptions
    );
  }

  updateStudyPlan(
    studyPlanId: string,
    studyPlan: StudyPlanTemplate
  ): Observable<StudyPlan> {
    const body = {
      studyPlanId: studyPlanId,
      studyPlan,
    };
    return this.http.put<any>(`${this.urlBase}study-plans/plan`, body, httpOptions);
  }

  updateIsPastSemester(
    studyPlanId: string,
    semesterPlanId: string,
    isPast: boolean
  ): Observable<any> {
    const body = {
      studyPlanId,
      semesterPlanId,
      isPast,
    };
    return this.http.put<any>(
      `${this.urlBase}semester-plans/plan/past-semester`,
      body,
      httpOptions
    );
  }

  updateAimedEcts(
    studyPlanId: string,
    semesterPlanId: string,
    aimedEcts: number
  ): Observable<any> {
    const body = {
      studyPlanId,
      semesterPlanId,
      aimedEcts,
    };
    return this.http.put<any>(
      `${this.urlBase}semester-plans/plan/aimed-ects`,
      body,
      httpOptions
    );
  }

  updateUserGeneratedModule(
    studyPlanId: string,
    semesterPlanId: string,
    semesterPlanSemester: string,
    moduleId: string,
    module: UserGeneratedModule
  ): Observable<UserGeneratedModule> {
    const body = {
      studyPlanId,
      semesterPlanId,
      semesterPlanSemester,
      moduleId,
      module,
    };
    return this.http.put<any>(
      `${this.urlBase}semester-plans/plan/user-generated-module`,
      body,
      httpOptions
    );
  }

  // DELETE Requests
  deleteStudyPlan(studyPlanId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}study-plans/plan/${studyPlanId}`,
      httpOptions
    );
  }

  deleteModule(
    studyPlanId: string,
    semesterPlanId: string,
    semesterPlanSemester: string,
    module: string,
    ects: number
  ): Observable<any> {
    const body = {
      studyPlanId,
      semesterPlanId,
      semesterPlanSemester,
      module,
      ects,
    };
    return this.http.delete<any>(`${this.urlBase}semester-plans/plan/module`, {
      headers: httpOptions.headers,
      body,
    });
  }

  deleteUserGeneratedModule(
    studyPlanId: string,
    semesterPlanId: string,
    semesterPlanSemester: string,
    module: UserGeneratedModule
  ): Observable<any> {
    const body = { studyPlanId, semesterPlanId, semesterPlanSemester, module };
    return this.http.delete<any>(
      `${this.urlBase}semester-plans/plan/user-generated-module`,
      { headers: httpOptions.headers, body }
    );
  }

  deleteUserGeneratedModules(
    studyPlanId: string,
    semesterPlanId: string,
    moduleIds: string[]
  ): Observable<UserGeneratedModule[]> {
    const body = { studyPlanId, semesterPlanId, moduleIds };
    return this.http.delete<UserGeneratedModule[]>(
      `${this.urlBase}semester-plans/plan/user-generated-modules`,
      { headers: httpOptions.headers, body }
    );
  }

  getCoursesBySemester(semester: string): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${this.urlBase}courses/${semester}`,
      httpOptions
    );
  }

  getCourseDetails(id: string, semester: string): Observable<Course> {
    return this.http.get<Course>(
      `${this.urlBase}courses/${id}/${semester}`,
      httpOptions
    );
  }

  /* --------------------------------
  -- Queries for meta data (e.g. departments and semester)
  ----------------------------------- */
  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.urlBase}meta/departments`,
      httpOptions
    );
  }

  getCourseTypes(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.urlBase}meta/course-types`,
      httpOptions
    );
  }

  getStudentDataViaFlexNow(importStudyPath: boolean): Observable<FnUser> {
    return this.http.post<FnUser>(`${this.urlBase}user/fn2student`, { importStudyPath }, httpOptions);
  }
}
