import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, skipWhile, take } from 'rxjs/operators';
import { getModuleHandbook } from 'src/app/selectors/module-overview.selectors';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { getUser, getUserStudyPath } from 'src/app/selectors/user.selectors';
import { Module } from '../../../../../interfaces/module';
import { ModuleGroup } from '../../../../../interfaces/module-group';
import { ModuleHandbook } from '../../../../../interfaces/module-handbook';
import { StudyPath, PathModule } from '../../../../../interfaces/study-path';
import {
  CollidingEvent,
  PlanCourse,
  PlanningHints,
} from '../../../../../interfaces/semester-plan';
import { ModService } from './module.service';
import { TimetableActions } from 'src/app/actions/study-planning.actions';
import { Course } from '../../../../../interfaces/course';
import { EventInput } from '@fullcalendar/core';
import { AcademicDate } from '../../../../../interfaces/academic-date';
import { datetime, RRule, RRuleSet } from 'rrule';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { AnalyticsService } from './analytics.service';
import { Semester } from '../../../../../interfaces/semester';

@Injectable({
  providedIn: 'root',
})
export class PlanningValidationService {
  studyPath$: Observable<StudyPath>;
  moduleHandbook$: Observable<ModuleHandbook | undefined>;
  moduleHandbook: ModuleHandbook;
  status: string | undefined;
  selectedSemesterPlan: string;
  modules$: Observable<string[] | undefined>;
  currentCollisionHints: PlanningHints[];
  currentEvents: EventInput[];

  // tracking
  private hasTrackedCollisions = false;

  /** ---------------------------------------
   * Currently only checks if modules can be planned 
   * Course check has to be added
      ---------------------------------------*/

  constructor(private store: Store, private mod: ModService, private analytics: AnalyticsService) {
    // reverse study path so the latest status of the module is returned with find method
    this.studyPath$ = this.store.select(getUserStudyPath);
    this.moduleHandbook$ = this.store.select(getModuleHandbook);
    this.moduleHandbook$.subscribe((mhb) => {
      if (mhb) {
        this.moduleHandbook = mhb;
      }
    });
  }

  /** ---------------------------------------
   * Module check
      ---------------------------------------*/

  /** returns warnings if priorModules have not been taken
   * @param module module to be checked
   * @param semesterPlanId current semester plan semester
   * @returns object with boolean and message that is returned to the component
   */
  priorModulesTaken(module: Module) {
    let returnResult = {
      success: true,
      message: '',
    };

    let priorModules: string[] = module.allPriorModules;
    let priorModulesNotTaken: string[] = [];

    for (let priorMod of priorModules) {
      // get latest status of module from study path
      this.getLatestStatusOfModuleByAcronym(priorMod).subscribe((status) => {
        this.status = status;
      });

      // add module to priorModulesNotTaken if status is not passed or taken
      if (this.status === 'taken' || this.status === 'passed') {
      } else {
        priorModulesNotTaken.push(priorMod);
      }
    }

    if (priorModulesNotTaken.length > 0) {
      returnResult.success = false;
      returnResult.message =
        'Dir fehlen folgende empfohlene Module: ' +
        priorModulesNotTaken.join(', ');
    } else {
      returnResult.success = true;
    }

    // reset status
    this.status = undefined;

    return returnResult;
  }

  /** check if module already exists in a semester plan
   * @param selectedModuleId module to be checked
   * @returns object with boolean and message that is returned to the component
   */
  isModuleInSemesterPlan(
    moduleAcronym: string,
    semesterPlanId: string,
    studyPlanId: string
  ): Observable<{ alreadyContained: boolean; message: string }> {
    return this.store.select(getStudyPlans).pipe(
      take(1),
      map((studyPlans: StudyPlan[]) => {
        const studyPlan = studyPlans.find((plan) => plan._id === studyPlanId);
        const semesterPlan = studyPlan?.semesterPlans.find(
          (plan) => plan._id === semesterPlanId
        );
        if (semesterPlan?.modules.includes(moduleAcronym)) {
          return {
            alreadyContained: true,
            message:
              'Du hast dieses Modul für das ausgewählte Semester schon einmal eingeplant.',
          };
        }
        return {
          alreadyContained: false,
          message: '',
        };
      })
    );
  }

  /** returns warnings if modules are not offered in the selected semester
   * @param module module to be checked
   * @param semesterPlanId current semester plan semester
   * @returns object with boolean and message that is returned to the component
   */
  isModuleOffered(module: Module, semesterPlanId: string) {
    let returnResult = {
      success: true,
      message: '',
    };

    if (!module.term.includes('WS') && semesterPlanId.includes('w')) {
      returnResult.success = false;
      returnResult.message =
        'Bitte beachte, dass dieses Modul im Wintersemester nicht angeboten wird.';
    }
    if (!module.term.includes('SS') && semesterPlanId.includes('s')) {
      returnResult.success = false;
      returnResult.message =
        'Bitte beachte, dass dieses Modul im Sommersemester nicht angeboten wird.';
    }
    return returnResult;
  }

  /** check if module can be planned into a study plan
   * @param acronym of module to be planned
   * @param ects ects of module to be planned
   * @returns object with boolean and message that is returned to the component
   */
  isModulePlannable(acronym: string, ects: number) {
    // define return object
    let returnResult = {
      success: false,
      message: 'Das Modul kann nicht eingeplant werden',
    };

    // get latest status of module from study path
    this.getLatestStatusOfModuleByAcronym(acronym).subscribe((status) => {
      if (status) {
        this.status = status;
      }
    });

    // Module cannot be planned if it has already been passed
    if (this.status === 'passed') {
      returnResult.success = false;
      returnResult.message = 'Du hast dieses Modul schon bestanden';
    }

    this.status = undefined;
    return returnResult;
  }

  /**
 * Check for module planning hints in study plan
 * @param studyPlan The active study plan to check
 */
  checkForModulePlanningHints(studyPlan: StudyPlan) {

    let hints: PlanningHints[] = [];

    const allModuleAcronyms = studyPlan.semesterPlans.flatMap(sp => sp.modules);
    const uniqueAcronyms = Array.from(new Set(allModuleAcronyms));

    if (uniqueAcronyms.length === 0) {
      this.store.dispatch(TimetableActions.updatePlanningHints({ hints }));
      return;
    }

    this.store.select(getUser).pipe(take(1)).subscribe(user => {

      if (user && user.sps && user.sps.length > 0) {
        const spName = user.sps[0].name;
        const startSemester = user.startSemester;
        const fulltime = user.fulltime;

        if (startSemester && spName && fulltime && fulltime === true) {

          // get full module data for planned modules
          this.mod
            .getFullModulesByAcronyms(uniqueAcronyms)
            .pipe(
              skipWhile((modules) => modules.length === 0),
              take(1)
            )
            .subscribe((modules) => {

              for (const semesterPlan of studyPlan.semesterPlans) {
                const semester = new Semester(semesterPlan.semester);

                for (const moduleAcronym of semesterPlan.modules) {
                  const module = modules.find(m => m.acronym === moduleAcronym);

                  if (module) {

                    // wrong semester type
                    const wrongSemesterHint = this.checkModuleSemesterType(module, semester);
                    if (wrongSemesterHint) {
                      hints.push(wrongSemesterHint);
                    }

                    // differs from recTerm
                    const recTermHint = this.checkWithRecommendedSemester(
                      module,
                      semesterPlan.semester,
                      startSemester
                    );
                    if (recTermHint) {
                      hints.push(recTermHint);
                    }
                  }
                }
              }

              // save all hints
              this.store.dispatch(TimetableActions.updatePlanningHints({ hints }));
            });
        }
      }
    })
  }

  /**
   * Check if module is planned too far from recommended semester
   * @param module The module to check
   * @param plannedSemesterName The semester name where module is planned (e.g., "2025w")
   * @param startSemesterName The user's start semester
   */
  private checkWithRecommendedSemester(
    module: Module,
    plannedSemesterName: string,
    startSemesterName: string
  ): PlanningHints | null {

    // Skip if module has no recommended term
    if (!module.recTerm || module.recTerm === "0") {
      return null;
    }

    const startSemester = new Semester(startSemesterName);

    const allSemesters = startSemester.getSemesterList(20);

    const plannedSemesterIndex = allSemesters.findIndex(
      sem => sem.name === plannedSemesterName
    );

    if (plannedSemesterIndex === -1) {
      return null;
    }

    const plannedSemesterNumber = plannedSemesterIndex + 1; // first sem is 1 not 0

    const deviation = Math.abs(plannedSemesterNumber - Number(module.recTerm));
    if (deviation >= 2) { // hint if deviation is min. 2

      return {
        type: 'warning',
        context: 'module-planning',
        begin: 'Das Modul',
        end: `wird im Modulhandbuch für das ${module.recTerm}. Semester empfohlen. Du hast es für das ${plannedSemesterNumber}. Semester eingeplant.`,
        acronym: module.acronym,
      };
    }

    return null;
  }

  /**
   * Check if module is planned in wrong semester type
   * @param module The module to check
   * @param semester The Semester instance where the module is planned
   */
  private checkModuleSemesterType(
    module: Module,
    semester: Semester
  ): PlanningHints | null {
    const isWinterSemester = semester.type === 'w';
    const isSummerSemester = semester.type === 's';

    if (isWinterSemester && !module.term.includes('WS')) {
      return {
        type: 'risk',
        context: 'module-planning',
        begin: 'Das Modul',
        end: `ist im ${semester.fullName} nicht verfügbar. Es wird nur im Sommersemester angeboten.`,
        acronym: module.acronym,
      };
    }

    if (isSummerSemester && !module.term.includes('SS')) {
      return {
        type: 'risk',
        context: 'module-planning',
        begin: 'Das Modul',
        end: `ist im ${semester.fullName} nicht verfügbar. Es wird nur im Wintersemester angeboten.`,
        acronym: module.acronym,
      };
    }

    return null;
  }

  /** ---------------------------------------
   * Module check helpers
      ---------------------------------------*/

  // is called for top level module group
  // recursively checks through module group tree if module can be added to module group
  canModuleBeAddedToModuleGroup(
    mg: ModuleGroup,
    mId: string,
    mVersion: number,
    ects: number
  ) {
    // define return object
    let returnResult = {
      success: false,
      message: 'Das Modul kann nicht eingeplant werden',
    };

    let isStructureValid = this.checkModuleStructure(mg, ects);

    // return true if the structure allows planning the module
    if (isStructureValid.success) {
      returnResult.success = true;
      returnResult.message = '';
      return returnResult;
    }
    // recursive check for module groups that have children
    if (mg.children) {
      let isAllowed;
      for (let i = 0; i < mg.children.length; i++) {
        isAllowed = this.canModuleBeAddedToModuleGroup(
          mg.children[i],
          mId,
          mVersion,
          ects
        );

        if (isAllowed.success) {
          returnResult.success = true;
          returnResult.message = '';
          return returnResult;
        }
      }
    }
    // if module check fails return failure message
    returnResult.success = false;
    returnResult.message = isStructureValid.message;
    return returnResult;
  }

  // called for every top-level module group
  // recursively checks if module is contained in a group, returns the found group
  getModuleGroupThatContainsModule(
    mg: ModuleGroup,
    mId: string,
    mVersion: number,
    ects: number
  ): ModuleGroup | null {
    if (this.isModuleContainedInModules(mId, mVersion, mg)) {
      return mg;
    }
    if (mg.children) {
      let group: ModuleGroup | null;
      for (let i = 0; i < mg.children.length; i++) {
        group = this.getModuleGroupThatContainsModule(
          mg.children[i],
          mId,
          mVersion,
          ects
        );
        if (group !== null) {
          return group;
        }
      }
    }
    return null;
  }

  // checks if the module can be planned into a module group
  // returns false if the ECTS limit is exceeded
  checkModuleStructure(mg: ModuleGroup, ects: number) {
    let returnResult = {
      success: false,
      message: '',
    };

    if (mg.modules) {
      // if mg has 0 ECTS make it plannable
      if (mg.ectsMax === 0) {
        returnResult.success = true;
        returnResult.message = '';
        return returnResult;
      } else {
        let isInEctsRange = this.isModuleInEctsRange(
          mg.name,
          mg.modules,
          Number(mg.ectsMax)
        );

        if (isInEctsRange.success) {
          returnResult.success = true;
          returnResult.message = '';
          return returnResult;
        } else {
          returnResult.success = false;
          returnResult.message = isInEctsRange.message;
          return returnResult;
        }
      }
    }

    return returnResult;
  }

  // check if a module is contained in the modules of a module group
  isModuleContainedInModules(
    mId: string,
    mVersion: number,
    mg: ModuleGroup | undefined
  ): boolean {
    let isContained = false;
    if (mg) {
      if (mg.modules) {
        for (let mod of mg.modules) {
          if (mod.mId === mId && mod.version === mVersion) {
            isContained = true;
          }
        }
      }
    }
    return isContained;
  }

  // check that group ects limit is not exceeded if module is added
  isModuleInEctsRange(mgName: String, modules: Module[], ectsMax: number) {
    let ectsSum = 0;
    let passedModules = [];
    let takenModules = [];

    let returnResult = {
      success: false,
      message:
        'Die ECTS Grenze für die Modulgruppe ' +
        mgName +
        ' wurde überschritten',
    };

    for (let mod of modules) {
      this.status = undefined;
      this.getLatestStatusOfModuleByAcronym(mod.acronym).subscribe((status) => {
        if (status) {
          this.status = status;
        }
      });
      // count ects of passed modules and save them in passedModules array
      if (this.status === 'passed') {
        ectsSum += mod.ects;
        passedModules.push(mod);
      }
      // count ects of taken modules and save them in takenModules array
      if (this.status === 'taken') {
        ectsSum += mod.ects;
        takenModules.push(mod);
      }
    }
    // sum of passed and taken modules must not be higher or equal to the ectsMax of the mg
    if (ectsSum >= ectsMax) {
      returnResult.success = false;

      // turn modules to string
      let passedNames: string = '';
      let takenNames: string = '';

      for (let mod of passedModules) {
        passedNames += '"' + mod.name + '" ';
      }

      for (let mod of takenModules) {
        takenNames += '"' + mod.name + '" ';
      }

      returnResult.message =
        'Das Modul kann nicht eingeplant werden, da du die für die Modulgruppe "' +
        mgName +
        '" vorgesehenen ECTS schon erreicht hast. Bitte prüfe, ob du die Module mit dem richtigen Status markiert hast. \n\nBestandene Module: ' +
        passedNames +
        ' \n\nBelegte Module: ' +
        takenNames;

      return returnResult;
    } else {
      returnResult.success = true;
      returnResult.message = '';
      return returnResult;
    }
  }

  // gets a module's latest status in the study path by acronym comparison
  getLatestStatusOfModuleByAcronym(moduleAcronym: string) {
    // reduce array so modules are direct items
    return (
      this.studyPath$
        .pipe(
          map((path) =>
            path.completedModules.reduce(
              (acc: any, val: any) => acc.concat(val),
              []
            )
          )
        )
        //  filter for modules where acronym matches
        .pipe(
          map((modules) =>
            modules.filter(
              (module: PathModule) => module.acronym === moduleAcronym
            )
          )
        )
        // select return status of first item in array
        .pipe(
          map((modules: PathModule[]) => {
            if (modules[0]) {
              return modules[0].status;
            } else {
              return undefined;
            }
          })
        )
    );
  }

  /** ---------------------------------------
   * Course checks
      ---------------------------------------*/
  /** Main function to check for planning hints
   * checks if planned modules are adressed in timetable and if the planned courses fully adressed the respective module
   * @param plannedCourses array of currently planned courses -> needed to 1) check which modules are (partly) adressed and 2) to identify if modules in study plan are not adressed
   * @param studyPlanModules array of module acronyms out of the study plan -> needed to check if all modules of study plan are adressed in current timetable
   */

  checkForPlanningHints(
    plannedCourses: PlanCourse[],
    studyPlanModules: string[],
    events: EventInput[],
    teachingPeriod: AcademicDate
  ) {

    let hints: PlanningHints[] = this.createOverlapsHints(
      events,
      teachingPeriod
    ); // set variable for storing hints

    // tracking overlap hints
    if (!this.hasTrackedCollisions) {
      this.hasTrackedCollisions = true;
      const collisions = this.detectEventOverlaps(events, teachingPeriod);
      const collisionCount = collisions.length;
      const collisionDetails = collisions.map((collision) => {
        const courseNames = collision.courses
          .map(course => course ? course.name : 'Unknown')
          .join(' & ');
        return courseNames;
      });

      // tracking (activate if necessary)

      // define byte limits
      // const MAX_PLAUSIBLE_BYTES = 500; // should be 2000, but let's try this

      // // truncate details
      // let truncatedPlausibleDetails = this.truncateToByteLimit(collisionDetails.join('; '), MAX_PLAUSIBLE_BYTES);

      // this.analytics.trackEvent('TimetableCollisions', {
      //   count: collisionCount,
      //   details: truncatedPlausibleDetails
      // });
    }

    this.store.dispatch(TimetableActions.updatePlanningHints({ hints }));

    const moduleContributions = plannedCourses.map((el) => el.contributeTo);
    // combine all module acronyms from study plan and from planned courses
    const modulesAsString = Array.from(
      new Set(moduleContributions.concat(studyPlanModules))
    );
    this.mod
      .getFullModulesByAcronyms(modulesAsString)
      .pipe(skipWhile((modules) => modules.length == 0))
      .subscribe((modules) => {
        const modulesForStudyPlanCheck = modules.filter((mod) =>
          studyPlanModules.includes(mod.acronym)
        );
        const modulesForContributedModuleCheck = modules.filter((mod) =>
          moduleContributions.includes(mod.acronym)
        );
        hints = hints.concat(
          this.checkForMissingCoursesOfStudyPlan(
            moduleContributions,
            modulesForStudyPlanCheck
          )
        );
        hints = hints.concat(
          this.checkForMissingCoursesOfPlannedModules(
            plannedCourses,
            modulesForContributedModuleCheck
          )
        );

        this.store.dispatch(TimetableActions.updatePlanningHints({ hints }));
      });
  }

  // helper function for truncation by byte (needed for collision tracking so payload does not exceed limits)
  private truncateToByteLimit(str: string, byteLimit: number): string {
    let encoder = new TextEncoder();
    let encoded = encoder.encode(str);
    if (encoded.length <= byteLimit) {
      return str;
    }
    let truncated = new TextDecoder().decode(encoded.slice(0, byteLimit - 10));
    return truncated + '...';
  }

  // identifies modules that are not adressed in current timetable -> gets only modules, that are in study plan
  private checkForMissingCoursesOfStudyPlan(
    moduleContributions: string[],
    modules: Module[]
  ): PlanningHints[] {
    if (modules.length !== 0) {
      const notAdressedModules = modules.filter(
        (mod) => !moduleContributions.includes(mod.acronym)
      );
      let hints: PlanningHints[] = [];
      // check for each module, if all needed courses are planned
      for (let module of notAdressedModules) {
        hints.push({
          type: 'warning',
          context: 'course-planning',
          begin: 'Zum Modul',
          end: 'wurden noch keine Lehrveranstaltungen eingeplant!',
          acronym: module.acronym,
        });
      }
      return hints;
    } else {
      return [];
    }
  }

  // checks if courses are missing to fully fulfill modulecourses -> gets modules that are contributet by the currently planned courses
  private checkForMissingCoursesOfPlannedModules(
    plannedCourses: PlanCourse[],
    modules: Module[]
  ): PlanningHints[] {
    const courseContributions = plannedCourses.map(
      (course) => course.contributeAs
    );
    let hints: PlanningHints[] = [];
    // check for each module, if all needed courses are planned
    for (let module of modules) {
      let fullyplanned = true;
      for (let moduleCourse of module.mCourses) {
        if (courseContributions.includes(moduleCourse.mcId)) {
          continue;
        } else {
          fullyplanned = false;
          hints.push({
            type: 'warning',
            context: 'course-planning',
            begin: 'Zum Modul',
            end: `fehlt noch folgende Lehrveranstaltung: ${moduleCourse.name} (${moduleCourse.type})`,
            acronym: module.acronym,
          });
        }
      }
    }
    return hints;
  }

  // checks if course is contributing to a module course that allready is adressed by another course
  isCoursePlannable(course: Course, plannedCourses: PlanCourse[]): boolean {
    const moduleCourseContributions = plannedCourses.map(
      (el) => el.contributeAs
    );
    if (course.mCourses) {
      for (let mCourse of course.mCourses) {
        if (moduleCourseContributions.includes(mCourse.modCourse.mcId)) {
          return false;
        }
      }
      return true;
    } else {
      return true;
    }
  }

  // functions for check of collisions
  // main function to detect overlapses
  private detectEventOverlaps(
    events: EventInput[],
    teachingPeriod: AcademicDate
  ): { pair: string; count: number; courses: (Course | undefined)[] }[] {
    // set range to lecture time
    const rangeStart = new Date(teachingPeriod.startdate);
    const rangeEnd = new Date(teachingPeriod.enddate);

    // select only course events and filter out all holidays
    const filteredEvents = events.filter((el) => el.extendedProps?.course);

    // get all occurences of events exluding holidays
    const expandedEvents = this.expandRecurringEvents(
      filteredEvents,
      rangeStart,
      rangeEnd
    );

    // check for collisions
    const collisions = this.findCollidingEvents(expandedEvents);
    return collisions;
  }

  private createOverlapsHints(
    events: EventInput[],
    teachingPeriod: AcademicDate
  ): PlanningHints[] {
    let collisions = this.detectEventOverlaps(events, teachingPeriod);
    let hints: PlanningHints[] = [];
    for (let collision of collisions) {
      if (collision.courses[0] && collision.courses[1]) {
        const course1 = collision.courses[0];
        const course2 = collision.courses[1];
        const courseString1 = `${course1.name} (${course1.type})`;
        const courseString2 = `${course2.name} (${course2.type})`;
        hints.push({
          type: 'collision',
          context: 'course-planning',
          begin: 'Die beiden Lehrveranstaltungen ',
          end:
            `"${courseString1}" & ${courseString2} überschneiden sich an ` +
            (collision.count == 1
              ? 'einem Termin!'
              : `${collision.count} Terminen!`),
          courses: [course1, course2]
        });
      }
    }
    return hints;
  }

  /* -------------------------------------------------
     --------------- Helper functions ----------------
     ------------------------------------------------- */
  private expandRecurringEvents(
    events: any[],
    rangeStart: Date,
    rangeEnd: Date
  ): CollidingEvent[] {
    const expandedEvents: CollidingEvent[] = [];
    events.forEach((event) => {
      // check if rrule is defined
      if (event.rrule) {
        let start = new Date(event.rrule.dtstart);
        let end = new Date(event.rrule.until);
        const ruleSet = new RRuleSet();

        // add main rule for recurrence
        // +1 -2 are needed to make sure correct time is set
        // TODO: check if other options might be better?

        ruleSet.rrule(
          new RRule({
            ...event.rrule,
            dtstart: datetime(
              start.getFullYear(),
              start.getMonth() + 1,
              start.getDate(),
              start.getHours() - 2,
              start.getMinutes()
            ),
            until: datetime(
              end.getFullYear(),
              end.getMonth() + 1,
              end.getDate(),
              end.getHours(),
              end.getMinutes()
            ),
          })
        );

        // define exclusion dates
        let exclusiondates: Date[] = [];
        if (event.exrule && Array.isArray(event.exrule)) {
          event.exrule.forEach((exrule: any) => {
            let rule = new RRule({
              ...exrule,
              dtstart: new Date(exrule.dtstart),
              until: new Date(exrule.until),
            });
            exclusiondates = exclusiondates.concat(rule.all());
          });
        }

        // generate all dates of a event
        let dates = ruleSet.between(rangeStart, rangeEnd);
        // transform is necessary to prevent switch due to summer and normal time
        // https://stackoverflow.com/questions/73409598/rrule-js-recurrence-series-changes-time-of-day-in-time-zone-after-daylight-sav
        dates = dates.map(
          (d) =>
            new Date( // See note 2
              d.getUTCFullYear(),
              d.getUTCMonth(),
              d.getUTCDate(),
              d.getUTCHours() + 2,
              d.getUTCMinutes()
            )
        );

        // check if dates occure while exlusion times
        const filteredDates = dates.filter(
          (date) =>
            !exclusiondates.some(
              (exDate) => exDate.getTime() === date.getTime()
            )
        );

        // convert each date into collision date
        filteredDates.forEach((date) => {
          expandedEvents.push({
            title: event.title,
            start: date,
            end: new Date(date.getTime() + this.parseDuration(event.duration)), // Dauer des Events
            course: event.extendedProps.course,
          });
        });
      } else {
        // all not reccuring events stay the same, just apply datetime to make comparison easier
        const start = new Date(event.start);
        const end = new Date(event.end);
        expandedEvents.push({
          title: event.title,
          start: datetime(
            start.getFullYear(),
            start.getMonth() + 1,
            start.getDate(),
            start.getHours() - 1,
            start.getMinutes()
          ),
          end: datetime(
            end.getFullYear(),
            end.getMonth() + 1,
            end.getDate(),
            end.getHours() - 1,
            end.getMinutes()
          ),
          course: event.extendedProps.course,
        });
      }
    });
    return expandedEvents;
  }

  // function to transform duration into milliseconds
  private parseDuration(duration: string): number {
    const [hours, minutes] = duration.split(':').map(Number);
    return (hours * 60 + minutes) * 60 * 1000; // Millisekunden
  }

  // collision detection -> inspired by ChatGPT
  private findCollidingEvents(
    events: CollidingEvent[]
  ): { pair: string; count: number; courses: (Course | undefined)[] }[] {
    const collisions: [CollidingEvent, CollidingEvent][] = [];

    // sort events by starting time
    const sortedEvents = events.sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    // compare each event with next event and check for collision
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];

      for (let j = i + 1; j < sortedEvents.length; j++) {
        const nextEvent = sortedEvents[j];
        // if next event is same as current event skip
        if (currentEvent.title === nextEvent.title) {
          continue;
        }

        // check for collision
        if (currentEvent.end > nextEvent.start) {
          collisions.push([currentEvent, nextEvent]);
        } else {
          // if no collision break, since array is sorted
          break;
        }
      }
    }

    const groupedCollisions: Record<string, number> = {};

    // Iteriere über die Kollisionen
    collisions.forEach(([event1, event2]) => {
      if (event1.course && event2.course) {
        // Sortiere die Titel alphabetisch, um gleiche Paare unabhängig von der Reihenfolge zu gruppieren
        const pairKey = [event1.course.id, event2.course.id].sort().join('&');

        // Inkrementiere den Zähler für dieses Paar
        if (!groupedCollisions[pairKey]) {
          groupedCollisions[pairKey] = 0;
        }
        groupedCollisions[pairKey]++;
      }
    });

    // Konvertiere das Ergebnis in ein Array
    return Object.entries(groupedCollisions).map(([pair, count]) => {
      let courseIds = pair.split('&');
      const course1 = events.find(
        (el) => el.course?.id === courseIds[0]
      )?.course;
      const course2 = events.find(
        (el) => el.course?.id === courseIds[1]
      )?.course;
      return {
        pair,
        count,
        courses: [course1, course2],
      };
    });
  }
}
