import { Injectable } from '@angular/core';
import {
  StudyPath,
  SemesterStudyPath,
} from '../../../../../interfaces/study-path';
import { Semester } from '../../../../../interfaces/semester';
import { MStudyProgramme } from '../../../../../interfaces/user';
import { UserGeneratedModule } from '../../../../../interfaces/user-generated-module';
import { Store } from '@ngrx/store';
import { getModuleById } from 'src/app/selectors/module-overview.selectors';
import { filter, map, take } from 'rxjs/operators';
import { RestService } from 'src/app/rest.service';
import { combineLatest, firstValueFrom, Observable, of } from 'rxjs';
import { StudyPlan } from '../../../../../interfaces/study-plan';
import { EventInput } from '@fullcalendar/core';
import { AcademicDate } from '../../../../../interfaces/academic-date';
import { Course, Term } from '../../../../../interfaces/course';
import { RRule, Weekday } from 'rrule';
import { getSemesterPlansOfActiveStudyPlan } from 'src/app/selectors/study-planning.selectors';

@Injectable({
  providedIn: 'root',
})
/*############################################################## 
  This Service is used for functions, that transform data for the 
  usage in components (ts-files). An example is the transformation
  of the study path, that needs to be transformed in some components
  from a complete list into a list by semester 
  ##############################################################*/
export class TransformationService {
  constructor(private store: Store, private rest: RestService) { }

  transformStudyPath(path: StudyPath, semesters: Semester[]): Observable<SemesterStudyPath[]> {

    // NOTE: we use the past semester information of the user (past semesters are set by user's active semester plan, not the objective date)
    return combineLatest([
      this.store.select(getSemesterPlansOfActiveStudyPlan).pipe(
        filter((semesterPlans) => !!semesterPlans), // wait until semester plans is defined
        //take(1)
      ),
      of(path),
      of(semesters)
    ]).pipe(
      map(([semesterPlans, path, semesters]) => {
        const result: SemesterStudyPath[] = [];

        for (let sem of semesters) {
          const matchingSemesterPlan = semesterPlans?.find(
            (semesterPlan) => semesterPlan.semester === sem.name
          );

          // default value if semesterList contains more semesters than the semesterPlans of the active plan
          const isPast = matchingSemesterPlan ? matchingSemesterPlan.isPastSemester : false;

          const modules = path.completedModules.filter((el) => el.semester === sem.name);
          const courses = path.completedCourses.filter((el) => el.semester === sem.name);
          // count only passed modules
          const ects = modules
            .filter(el => el.status === "passed")
            .map(el => el.ects)
            .reduce((pv, cv) => pv + cv, 0);

          result.push({
            semester: sem.name,
            isPastSemester: isPast,
            modules,
            courses,
            expanded: true,
            summedEcts: ects,
            aimedEcts: ects,
          });
        }

        return result;
      })
    );
  }

  // function to transform MongoDB Date into a readable string
  transformDate(date?: Date): string {
    if (date) {
      date = new Date(date);
      const day = `0${date.getDate()}`.slice(-2);
      const month = `0${date.getMonth() + 1}`.slice(-2);
      const hours = `0${date.getHours()}`.slice(-2);
      const minutes = `0${date.getMinutes()}`.slice(-2);
      const seconds = `0${date.getSeconds()}`.slice(-2);
      return `${day}.${month}.${date.getFullYear()} um ${hours}:${minutes}:${seconds}`;
    } else {
      return '-';
    }
  }

  // transforms a univis semester into  a regular semester string
  transformUnivIsSemester(value?: string): string {
    if (value) {
      let year = Number(value.slice(0, 4));
      let result = '';
      if (value.endsWith('w') && !Number.isNaN(year)) {
        result = `Wintersemester ${year}/${year + 1}`;
      } else if (value.endsWith('s') && !Number.isNaN(year)) {
        result = `Sommersemester ${year}`;
      }
      return result;
    } else {
      return '-';
    }
  }

  // Transfer flex now upload semester format to short format (example: WS21/22 to w2021)
  transformFlexNowFormat(semesterString: string): string {
    let seasonSuffix = semesterString.charAt(0).toLowerCase();
    let yearSuffix = semesterString.slice(2, 4); // extract first two numbers, here 21
    const fullYear = 2000 + parseInt(yearSuffix, 10); // create full year
    return `${fullYear}${seasonSuffix}`;
  }

  /* takes studyprogrammes as input and returns a string, 
  containing the name of the studyprogramme as well as the 
  desc which contains a desc of the poVersion */
  async transformStudyProgramme(sps?: MStudyProgramme[]): Promise<string> {
    return new Promise(async (resolve) => {
      if (sps) {
        let output: string[] = [];
        for (let sp of sps) {
          const name = sp.name;
          const poDesc = (
            await firstValueFrom(
              this.rest.getStudyprogrammeByIdAndVersion(sp.spId, sp.poVersion)
            )
          ).desc;
          output.push(`${name} - ${poDesc}`);
        }
        resolve(output.join('\n'));
      } else {
        resolve('-');
      }
    });
  }

  // transforms the status into a readable form
  transformStatus(status: string): string {
    switch (status) {
      case 'open':
        return 'Belegt';
      case 'passed':
        return 'Bestanden';
      case 'failed':
        return 'Nicht bestanden';
      default:
        return '-';
    }
  }

  /* transforms placheholders into a string containing name, desc and 
  ects of the module and separates the modules via a line break */
  transformUserGeneratedModulesToString(
    placholders: UserGeneratedModule[]
  ): string {
    if (placholders.length !== 0) {
      let output = '';
      for (const module of placholders) {
        output += `${module.name} - ${module.notes} - ${module.ects} ECTS \n\n`;
      }
      return output;
    } else {
      return '-';
    }
  }

  // gets moduleAcronyms as input and transform them to acronyms
  transformModuleIdsToAcronyms(modules: string[]): string {
    let output = [];
    for (let module of modules) {
      output.push(this.transformModuleId(module));
    }
    return output.join(', ');
  }

  // transform a single module id into an acronym -> helper-function for transformModuleIdsToAcronyms()
  transformModuleId(id: string): string {
    let acronym = id;
    this.store
      .select(getModuleById(id))
      .pipe(take(1))
      .subscribe((module) => {
        acronym = module ? module.acronym : id;
      });
    return acronym;
  }

  // gets details of a course and returns the name of the course as promise
  async transformUnivIsKeys(key: string, semester: string): Promise<string> {
    return firstValueFrom(
      this.rest.getCourseDetails(key, semester).pipe(map((el) => el.name))
    );
  }

  // gets two study plans and a semester and updates the plan of the given semester from the first to the second study plan and returns the target study plan with the updated plan
  transferPlanToAnotherStudyPlan(
    base: StudyPlan,
    target: StudyPlan,
    semester: string
  ): StudyPlan {
    const basePlan = base.semesterPlans.find(
      (plan) => plan.semester === semester
    );
    const targetPlanIndex = target.semesterPlans.findIndex(
      (plan) => plan.semester === semester
    );
    if (basePlan && targetPlanIndex !== -1) {
      target.semesterPlans[targetPlanIndex] = basePlan;
    }
    return target;
  }

  /** ----------------------------------------------
    Transformation of Courses to Events for Calendar
    !!! Private Functions are only helper functions !!!
      ----------------------------------------------*/
  transformCourses(
    courses: Course[],
    academicDates: AcademicDate[]
  ): EventInput[] {
    let result: EventInput[] =
      this.transformAcademicDatesToEvent(academicDates);
    let lectureTime = academicDates.find((el) =>
      el.dateType.name.includes('Vorlesungszeit')
    );
    let holidays = academicDates.filter((el) =>
      el.dateType.name.includes('Vorlesungsfrei')
    );
    for (let course of courses) {
      let courseEvents: EventInput[] = this.transformCourseToEvent(
        course,
        holidays,
        lectureTime
      );
      result = result.concat(courseEvents);
    }
    return result;
  }

  private transformAcademicDatesToEvent(academicDates: AcademicDate[]): EventInput[] {
    let dates: EventInput[] = [];
    for (let date of academicDates) {
      if (date.dateType.name === 'Vorlesungsfrei') {
        let endDate = new Date(date.enddate);
        endDate.setDate(endDate.getDate() + 1);
        dates.push({
          title: `${date.dateType.name} (${date.desc})`,
          start: date.startdate.slice(0, 10),
          end: endDate.toISOString().slice(0, 10),
        });
      }
    }
    return dates;
  }

  private transformCourseToEvent(
    course: Course,
    holidays: AcademicDate[],
    lectureTime?: AcademicDate
  ): EventInput[] {
    let events: EventInput[] = [];
    for (let term of course.terms) {
      let eventTemplate: EventInput = {
        title: `[${this.minifyCoursetype(course.type)}] ${course.name}`,

        color: this.extractBgColorOfCourseType(course.type),
        borderColor: this.extractBorderColorOfCourseType(course.type),
        textColor: '#000',
        extendedProps: {
          course,
        },
        classNames: ['text-wrap'],
        exrule: this.transformExclude(term, holidays),
      };
      if (term.repeat.trim() == 'Einzeltermin') {
        if (term.starttime && term.endtime) {
          events.push({
            ...eventTemplate,
            start: `${term.startdate}T${term.starttime ? term.starttime + ':00' : '00:00:00'}`,
            end: `${term.startdate}T${term.endtime ? term.endtime + ':00' : '24:00:00'}`,
          });
        } else {
          events.push({
            ...eventTemplate,
            date: term.startdate,
          });
        }
      } else if (term.repeat.startsWith('Blocktermin') && term.enddate) {
        let endDate = new Date(term.enddate);
        endDate.setDate(endDate.getDate() + 1);

        events.push({
          ...eventTemplate,
          duration: this.calculateDuration(term.starttime, term.endtime),
          rrule: {
            freq: RRule.DAILY,
            dtstart: `${term.startdate.slice(0, 10)}T${term.starttime ? term.starttime + ':00' : '00:00:00'}`,
            until: `${term.enddate.slice(0, 10)}T${term.endtime ? term.endtime + ':00' : '24:00:00'}`,
          },
          /* startRecur: term.startdate,
          endRecur: endDate.toISOString().slice(0, 10), */
        });
      } else if (
        term.repeat.startsWith('Wöchentlich') &&
        term.starttime &&
        term.endtime &&
        lectureTime
      ) {
        // default case if course is every week
        events.push({
          ...eventTemplate,
          duration: this.calculateDuration(term.starttime, term.endtime),
          rrule: {
            freq: RRule.WEEKLY,
            byweekday: this.checkAndReturnWeekdayForRRule(term.repeat),
            dtstart: `${lectureTime.startdate.slice(0, 10)}T${term.starttime
              }:00`,
            until: lectureTime.enddate.slice(0, 10),
          },
        });
      } else if (
        term.repeat.startsWith('Alle zwei Wochen') &&
        term.starttime &&
        term.endtime &&
        lectureTime
      ) {
        // case if course is every second week
        events.push({
          ...eventTemplate,
          duration: this.calculateDuration(term.starttime, term.endtime),
          rrule: {
            freq: RRule.WEEKLY,
            interval: 2,
            byweekday: this.checkAndReturnWeekdayForRRule(term.repeat),
            dtstart: `${lectureTime.startdate.slice(0, 10)}T${term.starttime
              }:00`,
            until: lectureTime.enddate,
          },
        });
      } else {
        // case if repeat is empty
        if (term.startdate && term.enddate) {
          if (term.starttime && term.endtime) {
            // case 1: everything else is known
            events.push({
              ...eventTemplate,
              start: `${term.startdate}T${term.starttime}`,
              end: `${term.enddate}T${term.endtime}`,
            });
          } else {
            // case 2: start- and endtime are unknown
            // Workaround to include enddate --> using only date string results in not including the enddate
            let endDate = new Date(term.enddate);
            endDate.setDate(endDate.getDate() + 1);
            events.push({
              ...eventTemplate,
              start: term.startdate,
              end: endDate.toISOString().slice(0, 10),
            });
          }
        }
      }
    }
    return events;
  }

  private minifyCoursetype(type: string): string {
    switch (type) {
      case 'Seminar':
        return 'S';
      case 'Vorlesung':
        return 'V';
      case 'Vorlesung und Übung':
        return 'V/Ü';
      case 'Seminaristischer Unterricht':
        return 'SU';
      case 'Proseminar':
        return 'PS';
      case 'Seminar/Hauptseminar':
        return 'S/HS';
      case 'Exkursion':
        return 'E';
      case 'Übung':
        return 'Ü';
      case 'Blockseminar':
        return 'BS';
      case 'Kolloquium':
        return 'K';
      case 'Tutorium':
        return 'Tut';
      case 'Vertiefungsseminar':
        return 'VS';
      default:
        return type;
    }
  }

  private checkAndReturnWeekdayForRRule(repeat: string): Weekday[] {
    let weekdays: Weekday[] = [];
    if (repeat.includes('Mo')) {
      weekdays.push(RRule.MO);
    }
    if (repeat.includes('Di')) {
      weekdays.push(RRule.TU);
    }
    if (repeat.includes('Mi')) {
      weekdays.push(RRule.WE);
    }
    if (repeat.includes('Do')) {
      weekdays.push(RRule.TH);
    }
    if (repeat.includes('Fr')) {
      weekdays.push(RRule.FR);
    }
    if (repeat.includes('Sa')) {
      weekdays.push(RRule.SA);
    }
    if (repeat.includes('So')) {
      weekdays.push(RRule.SU);
    }

    return weekdays;
  }

  private transformExclude(term: Term, holidays: AcademicDate[]): any[] {
    let excludedDates = [];
    if (term.exclude) {
      for (let date of term.exclude.split(',')) {
        if (date == 'vac' || date == 'no' || date == '') {
          break;
        }
        excludedDates.push({
          freq: RRule.DAILY,
          dtstart: `${date.slice(0, 10)}T${term.starttime ? term.starttime + ':00' : '00:00:00'}`,
          until: `${date.slice(0, 10)}T${term.endtime ? term.endtime + ':00' : '00:00:00'}`,
        });
      }
    }

    excludedDates = excludedDates.concat(
      holidays.map((el) => {
        return {
          freq: RRule.DAILY,
          interval: 1,
          dtstart: `${el.startdate.slice(0, 10)}T${term.starttime ? term.starttime + ':00' : '00:00:00'}`,
          until: `${el.enddate.slice(0, 10)}T${term.endtime ? term.endtime + ':00' : '00:00:00'}`,
        };
      })
    );

    return excludedDates;
  }

  private calculateDuration(startTime: string, endTime: string): string {
    // Parse time in HH:MM format to a Date object, assuming the same day
    const timeRegex: RegExp = /(\d{2}):(\d{2})/;
    const startDate: Date = new Date();
    const endDate: Date = new Date();

    const startTimeMatch: RegExpMatchArray | null = startTime.match(timeRegex);
    const endTimeMatch: RegExpMatchArray | null = endTime.match(timeRegex);

    if (startTimeMatch && endTimeMatch) {
      startDate.setHours(
        parseInt(startTimeMatch[1], 10),
        parseInt(startTimeMatch[2], 10),
        0,
        0
      );
      endDate.setHours(
        parseInt(endTimeMatch[1], 10),
        parseInt(endTimeMatch[2], 10),
        0,
        0
      );
    }

    // Calculate the difference in milliseconds
    let diff: number = endDate.getTime() - startDate.getTime();

    // In case of negative difference, adjust for crossing over midnight
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000; // add 24 hours
    }

    // Convert milliseconds to hours and minutes
    const hours: number = Math.floor(diff / (1000 * 60 * 60));
    const minutes: number = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Format hours and minutes in HH:MM format
    const formattedHours: string = String(hours).padStart(2, '0');
    const formattedMinutes: string = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  // TODO exchange hex values with the vars of secondary baula colours defined in _variables.scss
  private extractBgColorOfCourseType(type: string): string {
    if (type.includes('Vorlesung')) {
      return '#D9ECF8';
    } else if (type.includes('Übung')) {
      return '#E2E4F3';
    } else if (type.includes('Tutorium')) {
      return '#FFF5CC';
    } else if (type.includes('Seminar')) {
      return '#DFF7EE';
    } else {
      return '#F8EFE2';
    }
  }

  // borders as darker shades
  private extractBorderColorOfCourseType(type: string): string {
    if (type.includes('Vorlesung')) {
      return '#a1a1a0';
    } else if (type.includes('Übung') || type.includes('Tutorium')) {
      return '#a0a7d1';
    } else if (type.includes('Seminar')) {
      return '#a0d4cb';
    } else {
      return '#b7a89e';
    }
  }
}
