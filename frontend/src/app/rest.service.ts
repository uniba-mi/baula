import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Module } from '../../../interfaces/module';
import { Course } from '../../../interfaces/course';
import { Studyprogramme } from '../../../interfaces/studyprogramme';
import { Modulehandbook } from '../../../interfaces/modulehandbook';
import { Studyplan, StudyplanTemplate } from '../../../interfaces/studyplan';
import {
  UserGeneratedModule,
  UserGeneratedModuleTemplate,
} from '../../../interfaces/usergeneratedmodule';
import { Studypath, PathModule } from '../../../interfaces/studypath';
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
  Semesterplan,
  SemesterplanTemplate,
  TimetableSettings,
} from '../../../interfaces/semesterplan';
import { config } from 'src/environments/config.local';
import { AcademicDate, DateType } from '../../../interfaces/academicDate';
import { ExtendedJob, Jobtemplate } from '../../../interfaces/job';
import { FlexNowUser } from '../../../interfaces/flexNowUser';

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
  private urlBase = config.apiUrl;

  constructor(private http: HttpClient) {}
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
        studypath: undefined,
        completedModules: user.studypath.completedModules,
      },
    };
    return this.http.put<any>(this.urlBase + 'user/', requestBody, httpOptions);
  }

  getAcademicDatesOfSemester(semester: string): Observable<AcademicDate[]> {
    return this.http.get<AcademicDate[]>(
      `${this.urlBase}user/academicdates/${semester}`,
      httpOptions
    );
  }

  getDateTypes(): Observable<DateType[]> {
    return this.http.get<DateType[]>(
      `${this.urlBase}user/datetypes`,
      httpOptions
    );
  }

  updateHint(key: string, hasConfirmed: boolean): Observable<Hint[]> {
    return this.http.put<Hint[]>(
      this.urlBase + 'user/hint',
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
    return this.http.put<Consent[]>(
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
      this.urlBase + 'user/dashboard',
      { chartName },
      httpOptions
    );
  }

  updateTimetableSettings(
    showWeekends: boolean
  ): Observable<TimetableSettings[]> {
    return this.http.put<TimetableSettings[]>(
      this.urlBase + 'user/timetable',
      { showWeekends },
      httpOptions
    );
  }

  /** Updates the favourite module list of a user*/
  updateFavouriteModulesIds(acronym: string): Observable<string[]> {
    return this.http.put<string[]>(
      this.urlBase + 'user/favourite-modules-acronyms',
      { acronym },
      httpOptions
    );
  }

  /** Updates the list of modules the user does not find interesting */
  updateNotInterestingModules(acronym: string): Observable<string[]> {
    return this.http.put<string[]>(
      this.urlBase + 'user/not-interesting-module-id',
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
      `${this.urlBase}user/aims`,
      { aims },
      httpOptions
    );
  }

  addInterest(interest: string): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.urlBase}user/interest`,
      { interest },
      httpOptions
    );
  }

  deleteInterest(interest: string): Observable<string[]> {
    return this.http.delete<string[]>(`${this.urlBase}user/interest`, {
      body: {
        interest,
      },
      headers: httpOptions.headers,
    });
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
  updateSemesterplan(
    semester: string,
    semesterplan: SemesterplanTemplate
  ): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}semesterplan/`,
      { semester, semesterplan },
      httpOptions
    );
  }

  addCourseToSemesterplan(
    semester: string,
    course: PlanCourse,
    isPastSemester: boolean
  ): Observable<PlanCourse[]> {
    return this.http.post<PlanCourse[]>(
      `${this.urlBase}semesterplan/course`,
      {
        semester,
        course,
        isPastSemester,
      },
      httpOptions
    );
  }

  deleteCourseFromSemesterplan(
    semester: string,
    courseId: string
  ): Observable<PlanCourse[]> {
    return this.http.delete<PlanCourse[]>(
      `${this.urlBase}semesterplan/course`,
      {
        body: {
          semester,
          courseId,
        },
        headers: httpOptions.headers,
      }
    );
  }

  addCoursesToSemesterplan(
    semester: string,
    courses: PlanCourse[],
    isPastSemester: boolean
  ): Observable<PlanCourse[]> {
    return this.http.post<PlanCourse[]>(
      `${this.urlBase}semesterplan/courses`,
      {
        semester,
        courses,
        isPastSemester,
      },
      httpOptions
    );
  }

  deleteCoursesFromSemesterplan(
    semester: string,
    courseIds: string[]
  ): Observable<PlanCourse[]> {
    return this.http.delete<PlanCourse[]>(
      `${this.urlBase}semesterplan/courses`,
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
   * REST Queries for Studyplanning Assistant
      ---------------------------------------*/

  getStudyprogrammes(): Observable<Studyprogramme[]> {
    return this.http.get<Studyprogramme[]>(
      `${this.urlBase}studyprogramme/all`,
      httpOptions
    );
  }

  updateStudyprogramme(
    spId: string,
    poVersion: number,
    mhbId: string,
    mhbVersion: number
  ): Observable<Studyprogramme[]> {
    const body = {
      spId,
      poVersion,
      mhbId,
      mhbVersion,
    };
    return this.http.put<Studyprogramme[]>(
      `${this.urlBase}user/studyprogramme`,
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

  updateModuleInStudypath(module: PathModule): Observable<Studypath> {
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

    return this.http.put<Studypath>(
      `${this.urlBase}user/module`,
      body,
      httpOptions
    );
  }

  updateStudypath(completedModules: PathModule[]): Observable<Studypath> {
    const body = {
      completedModules,
    };
    return this.http.put<Studypath>(
      `${this.urlBase}user/studypath`,
      body,
      httpOptions
    );
  }

  finishSemester(
    completedModules: PathModule[], droppedModules: PathModule[], semester: string,
  ): Observable<Studypath> {
    const body = {
      completedModules,
      droppedModules,
      semester,
    };
    return this.http.put<Studypath>(
      `${this.urlBase}user/semester-studypath`,
      body,
      httpOptions
    );
  }

  deleteModuleFromStudypath(
    id: string,
    semester: string
  ): Observable<Studypath> {
    const body = {
      id,
      semester,
    };

    return this.http.delete<Studypath>(`${this.urlBase}user/studypath/module`, {
      body,
      headers: httpOptions.headers,
    });
  }

  deleteStudypath(): Observable<any> {
    return this.http.delete<Studypath>(
      `${this.urlBase}user/studypath`,
      httpOptions
    );
  }

  deleteFavouriteModules(): Observable<any> {
    return this.http.delete<Studypath>(
      `${this.urlBase}user/favourite-modules`,
      httpOptions
    );
  }

  deleteNotInterestingModules(): Observable<any> {
    return this.http.delete<Studypath>(
      `${this.urlBase}user/not-interesting-modules`,
      httpOptions
    );
  }

  deleteNotInterestingModule(acronym: string): Observable<any> {
    return this.http.delete<Studypath>(
      `${this.urlBase}user/not-interesting-module/${acronym}`,
      httpOptions
    );
  }

  getStudyprogrammeByIdAndVersion(
    id: string,
    version: number
  ): Observable<Studyprogramme> {
    return this.http.get<Studyprogramme>(
      `${this.urlBase}studyprogramme/${id}/${version}`,
      httpOptions
    );
  }

  getModulhandbookStructure(
    id: string,
    version: number
  ): Observable<Modulehandbook> {
    return this.http.get<Modulehandbook>(
      `${this.urlBase}mhb/${id}/${version}`,
      httpOptions
    );
  }

  getModuleByAcronymAndVersion(
    acronym: string,
    version?: number
  ): Observable<Module> {
    return this.http.get<Module>(
      `${this.urlBase}mhb/module/${acronym}/${version}`,
      httpOptions
    );
  }

  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.urlBase}mhb/modules`, httpOptions);
  }

  getAllCurrentModules(): Observable<Module[]> {
    return this.http.get<Module[]>(
      `${this.urlBase}mhb/current-modules`,
      httpOptions
    );
  }

  /**
   * STUDYPLAN Queries
   */
  // Get Requests
  getStudyPlans(): Observable<Studyplan[]> {
    return this.http.get<Studyplan[]>(
      `${this.urlBase}studyplan/all`,
      httpOptions
    );
  }

  checkTemplateAvailability(
    programId: string,
    semesterType: 'w' | 's'
  ): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.urlBase}studyplan/template-availablilty/${programId}/${semesterType}`,
      httpOptions
    );
  }

  getLatestTemplateForStudyProgram(
    programId: string,
    semesterType: 'w' | 's'
  ): Observable<Studyplan> {
    return this.http.get<Studyplan>(
      `${this.urlBase}studyplan/latest-template/${programId}/${semesterType}`,
      httpOptions
    );
  }

  getActiveStudyplan(): Observable<Studyplan> {
    return this.http.get<Studyplan>(
      `${this.urlBase}studyplan/active`,
      httpOptions
    );
  }

  // Post Requests
  createStudyPlan(studyplan: StudyplanTemplate): Observable<Studyplan> {
    const requestBody = { studyplan };
    return this.http.post<Studyplan>(
      `${this.urlBase}studyplan/`,
      requestBody,
      httpOptions
    );
  }

  initSemesterplans(
    studyplanId: string,
    semesterPlans: SemesterplanTemplate[]
  ): Observable<Semesterplan[]> {
    const body = { studyplanId, semesterPlans };
    return this.http.post<Semesterplan[]>(
      `${this.urlBase}semesterplan/init`,
      body,
      httpOptions
    );
  }

  addSemesterplanToStudyplan(
    studyplanId: string,
    semester: string
  ): Observable<Studyplan> {
    const body = { studyplanId, semester };
    return this.http.post<Studyplan>(
      `${this.urlBase}semesterplan/`,
      body,
      httpOptions
    );
  }

  addModule(
    studyplanId: string,
    semesterplanId: string,
    module: string,
    ects: number
  ): Observable<string> {
    const body = { studyplanId, semesterplanId, module, ects };
    return this.http.post<string>(
      `${this.urlBase}semesterplan/module`,
      body,
      httpOptions
    );
  }

  addModulesToCurrentSemesterOfAllStudyplans(
    modules: UserGeneratedModuleTemplate[],
    semesterName: string
  ): Observable<Studyplan[]> {
    const body = { modules, semesterName };
    return this.http.post<Studyplan[]>(
      `${this.urlBase}studyplan/all`,
      body,
      httpOptions
    );
  }

  createUserGeneratedModule(
    studyplanId: string,
    semesterplanId: string,
    module: UserGeneratedModuleTemplate
  ): Observable<UserGeneratedModule> {
    const body = { studyplanId, semesterplanId, module };
    return this.http.post<UserGeneratedModule>(
      `${this.urlBase}semesterplan/user-generated-module`,
      body,
      httpOptions
    );
  }

  transferModule(
    studyplanId: string,
    oldSemesterplanId: string,
    oldSemesterplanSemester: string,
    newSemesterPlanId: string,
    newSemesterPlanSemester: string,
    acronym: string,
    ects: number
  ): Observable<{
    oldSemesterplan: Semesterplan;
    newSemesterplan: Semesterplan;
  }> {
    return this.http.put<{
      oldSemesterplan: Semesterplan;
      newSemesterplan: Semesterplan;
    }>(
      `${this.urlBase}studyplan/transfer/module`,
      {
        studyplanId,
        oldSemesterplanId,
        newSemesterPlanId,
        acronym,
        ects,
      },
      httpOptions
    );
  }

  transferUserGeneratedModule(
    studyplanId: string,
    oldSemesterplanId: string,
    newSemesterPlanId: string,
    newSemesterPlanSemester: string,
    module: UserGeneratedModule
  ): Observable<{
    oldSemesterplan: Semesterplan;
    newSemesterplan: Semesterplan;
  }> {
    return this.http.put<{
      oldSemesterplan: Semesterplan;
      newSemesterplan: Semesterplan;
    }>(
      `${this.urlBase}studyplan/transfer/user-generated-module`,
      {
        studyplanId,
        oldSemesterplanId,
        newSemesterPlanId,
        newSemesterPlanSemester,
        module,
      },
      httpOptions
    );
  }

  updateStudyplan(
    studyplanId: string,
    studyplan: StudyplanTemplate
  ): Observable<Studyplan> {
    const body = {
      studyplanId: studyplanId,
      studyplan,
    };
    return this.http.put<any>(`${this.urlBase}studyplan/`, body, httpOptions);
  }

  updateIsPastSemester(
    studyplanId: string,
    semesterplanId: string,
    isPast: boolean
  ): Observable<any> {
    const body = {
      studyplanId,
      semesterplanId,
      isPast,
    };
    return this.http.put<any>(
      `${this.urlBase}semesterplan/is-past-semester`,
      body,
      httpOptions
    );
  }

  updateAimedEcts(
    studyplanId: string,
    semesterplanId: string,
    aimedEcts: number
  ): Observable<any> {
    const body = {
      studyplanId,
      semesterplanId,
      aimedEcts,
    };
    return this.http.put<any>(
      `${this.urlBase}semesterplan/aimed-ects`,
      body,
      httpOptions
    );
  }

  updateUserGeneratedModule(
    studyplanId: string,
    semesterplanId: string,
    semesterplanSemester: string,
    moduleId: string,
    module: UserGeneratedModule
  ): Observable<UserGeneratedModule> {
    const body = {
      studyplanId,
      semesterplanId,
      semesterplanSemester,
      moduleId,
      module,
    };
    return this.http.put<any>(
      `${this.urlBase}semesterplan/user-generated-module`,
      body,
      httpOptions
    );
  }

  // DELETE Requests
  deleteStudyPlan(studyplanId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.urlBase}studyplan/${studyplanId}`,
      httpOptions
    );
  }

  deleteModule(
    studyplanId: string,
    semesterplanId: string,
    semesterplanSemester: string,
    module: string,
    ects: number
  ): Observable<any> {
    const body = {
      studyplanId,
      semesterplanId,
      semesterplanSemester,
      module,
      ects,
    };
    return this.http.delete<any>(`${this.urlBase}semesterplan/module`, {
      headers: httpOptions.headers,
      body,
    });
  }

  deleteUserGeneratedModule(
    studyplanId: string,
    semesterplanId: string,
    semesterplanSemester: string,
    module: UserGeneratedModule
  ): Observable<any> {
    const body = { studyplanId, semesterplanId, semesterplanSemester, module };
    return this.http.delete<any>(
      `${this.urlBase}semesterplan/user-generated-module`,
      { headers: httpOptions.headers, body }
    );
  }

  deleteUserGeneratedModules(
    studyplanId: string,
    semesterplanId: string,
    moduleIds: string[]
  ): Observable<UserGeneratedModule[]> {
    const body = { studyplanId, semesterplanId, moduleIds };
    return this.http.delete<UserGeneratedModule[]>(
      `${this.urlBase}semesterplan/user-generated-modules`,
      { headers: httpOptions.headers, body }
    );
  }

  /* --------------------------------
  ---- Test Queries on UnivIS -------
  -----------------------------------*/
  getCoursesBySemester(semester: string): Observable<Course[]> {
    return this.http.get<Course[]>(
      `${this.urlBase}univis/courses/${semester}`,
      httpOptions
    );
  }

  getCourseDetails(id: string, semester: string): Observable<Course> {
    return this.http.get<Course>(
      `${this.urlBase}univis/course/${id}/${semester}`,
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

  /** --------------------------------------------
   * Queries for the job recommendation
   *  -------------------------------------------- */
  crawlJob(url: string): Observable<Jobtemplate> {
    return this.http.post<Jobtemplate>(
      `${this.urlBase}job-proposal/crawl`,
      { url },
      httpOptions
    );
  }

  generateJobKeywords(job: Jobtemplate): Observable<Jobtemplate> {
    return this.http.post<Jobtemplate>(
      `${this.urlBase}job-proposal/keywords`,
      job,
      httpOptions
    );
  }

  recommendModulesToJob(
    job: Jobtemplate,
    jobId?: string
  ): Observable<ExtendedJob> {
    return this.http.post<ExtendedJob>(
      `${this.urlBase}job-proposal/recommend`,
      { job, jobId },
      httpOptions
    );
  }

  getStudentDataViaFlexNow(importStudypath: boolean): Observable<FlexNowUser> {
    return this.http.post<FlexNowUser>(`${this.urlBase}user/fn2student`, { importStudypath }, httpOptions);
  }
}
