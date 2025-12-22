import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { RestService } from 'src/app/rest.service';
import { firstValueFrom } from 'rxjs';
import { Course } from '../../../../../interfaces/course';
import { SearchSettings } from '../../../../../interfaces/search';

interface IndexedDB {
  courses: Course[];
  metadata: {
    lastUpdated: Date;
    semester: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private maxCacheAge = 8 * 60 * 60 * 1000; // 8 hours maximum cache age
  private dbPromise: Promise<IDBPDatabase<IndexedDB>>;

  constructor(private rest: RestService) {
    this.dbPromise = openDB<IndexedDB>('CourseDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata'); // Store für lastUpdated
        }
      },
    });
  }

  private async getSemester(): Promise<string | null> {
    const db = await this.dbPromise;
    const semester = await db.get('metadata', 'semester');
    return semester
  }

  private async setSemester(semester: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('metadata',semester, 'semester');
  }

  private async getLastUpdated(): Promise<Date | null> {
    const db = await this.dbPromise;
    const lastUpdated = await db.get('metadata', 'lastUpdated');
    return lastUpdated ? new Date(lastUpdated) : null;
  }

  private async setLastUpdated(date: Date): Promise<void> {
    const db = await this.dbPromise;
    await db.put('metadata', date.toISOString(), 'lastUpdated');
  }

  private isExpired(lastUpdated: Date | null): boolean {
    if (!lastUpdated) return true;
    const now = Date.now();
    return now - lastUpdated.getTime() > this.maxCacheAge;
  }

  async getCourses(
    semester: string,
    reload?: boolean
  ): Promise<Course[]> { 
    const db = await this.dbPromise;
    const lastUpdated = await this.getLastUpdated();
    const dbSemester = await this.getSemester();
    if (this.isExpired(lastUpdated) || reload || dbSemester !== semester) {
      console.info('Daten werden neu geladen.');
      // Daten sind veraltet, lade sie neu
      const courses = await firstValueFrom(
        this.rest.getCoursesBySemester(semester)
      );

      // Aktualisiere IndexedDB
      const tx = db.transaction(['courses', 'metadata'], 'readwrite');
      const courseStore = tx.objectStore('courses');
      await courseStore.clear(); // Löscht alte Daten
      for (const course of courses) {
        await courseStore.put(course);
      }

      await this.setLastUpdated(new Date());
      await this.setSemester(semester);
      await tx.done;
      return courses;
    } else {
      console.info('Vorliegende Daten werden verwendet.');
      return await db.getAll('courses');
    }
  }

  async searchCourses(
    semester: string,
    searchSetting?: SearchSettings,
    reload?: boolean
  ): Promise<Course[]> {
    let courses: Course[] = await this.getCourses(semester, reload);

    // check for search options and apply all settings
    if (searchSetting && searchSetting.advancedSearch) {
      // apply filters
      if (searchSetting.advancedSearch.filter) {
        const filter = searchSetting.advancedSearch.filter;
        // filter for time options
        if (filter.time) {
          const day = filter.time.day;
          const startTime = filter.time.timeStart ? Date.parse(`01/01/2024 ${filter.time.timeStart}`) : undefined;
          const endTime = filter.time.timeEnd ? Date.parse(`01/01/2024 ${filter.time.timeEnd}`) : undefined;
          if (day) {
            courses = courses.filter((course) => {
              if (course.terms && course.terms.length !== 0) {
                let dayResult = course.terms.filter((term) =>
                  term.repeat.includes(day)
                );
                return dayResult.length !== 0 ? course : undefined;
              } else {
                return undefined;
              }
            });
          }
          if (startTime || endTime) {
            courses = courses.filter((course) => {
              if (course.terms && course.terms.length !== 0) {
                let result = course.terms.filter((term) => {
                  let afterStartTime = true;
                  let beforeEndTime = true;
                  if (startTime) {
                    afterStartTime =
                      Date.parse(`01/01/2024 ${term.starttime}`) >= startTime
                        ? true
                        : false;
                  }
                  if (endTime) {
                    beforeEndTime =
                      Date.parse(`01/01/2024 ${term.endtime}`) <= endTime
                        ? true
                        : false;
                  }
                  return afterStartTime && beforeEndTime ? term : undefined;
                });
                return result.length !== 0 ? course : undefined;
              } else {
                return undefined;
              }
            });
          }
        }

        // filter for types
        if (filter.types && Array.isArray(filter.types)) {
          const types = filter.types;
          courses = courses.filter((course) => types.includes(course.type));
        }

        // filter for departments
        if (filter.departments && Array.isArray(filter.departments)) {
          const departments = filter.departments;
          courses = courses.filter((course) =>
            departments.includes(course.orgname)
          );
        }
      }
      // apply detail search
      if (searchSetting.advancedSearch.detailSearch) {
        const detailSearchOptions = searchSetting.advancedSearch.detailSearch;
        for (let option of detailSearchOptions) {
          // check if option has non empty term and searchIn
          if (option.term && option.searchIn) {
            const searchTerm = option.term;
            // switch statement to check, which attribute is addressed
            switch (option.searchIn) {
              case 'name':
                courses = courses.filter((course) =>
                  course.name.includes(searchTerm)
                );
                break;
              case 'desc':
                courses = courses.filter((course) =>
                  course.desc?.includes(searchTerm)
                );
                break;
              case 'short':
                courses = courses.filter((course) =>
                  course.short?.includes(searchTerm)
                );
                break;
              case 'organizational':
                courses = courses.filter((course) =>
                  course.organizational?.includes(searchTerm)
                );
                break;
              case 'mId':
                courses = courses.filter((course) => {
                  if (course.mCourses) {
                    const modules = course.mCourses.filter((mCourse) => {
                      return mCourse.modCourse.identifier.acronym.includes(
                        searchTerm
                      )
                        ? mCourse
                        : undefined;
                    });
                    return modules.length !== 0 ? course : undefined;
                  } else {
                    return undefined;
                  }
                });
                break;
              default:
                break;
            }
          }
        }
      }
    }
    return courses;
  }
}
