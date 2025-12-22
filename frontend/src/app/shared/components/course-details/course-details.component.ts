import { Component, Input, OnInit } from '@angular/core';
import { Course } from '../../../../../../interfaces/course';
import { ModuleCourse } from '../../../../../../interfaces/module-course';

@Component({
    selector: 'app-course-details',
    templateUrl: './course-details.component.html',
    styleUrl: './course-details.component.scss',
    standalone: false
})
export class CourseDetailsComponent implements OnInit {
  @Input() course: Course;
  @Input() context: string;
  expandedCourseDescription: boolean = false;
  expandedCourseOrganisation: boolean = false;
  modules: ModuleCourse[];

  ngOnInit(): void {
    if (this.course.mCourses) {
      this.modules = this.course.mCourses
        ? this.deleteDuplicatesFromModuleCourses(
            this.course.mCourses.map((el) => el.modCourse)
          )
        : [];
    }
  }

  /**---------------------------------------
   * Function to remove duplicate entries from array. Prevents multiple entries in course-dialog
   * @param mcs array of module courses (may contains duplicates)
   * @returns mcs array without duplicates (only if ects and module acronym are same)
    ----------------------------------------*/
  deleteDuplicatesFromModuleCourses(mcs: ModuleCourse[]): ModuleCourse[] {
    let result: ModuleCourse[] = [];
    // get unique module keys
    const moduleKeys = [...new Set(mcs.map((el) => el.identifier.acronym))];
    for (const key of moduleKeys) {
      // find duplicate
      const newEntry = mcs.find((el) => el.identifier.acronym == key);
      const existingEntry = result.find((el) => el?.identifier.acronym == key);
      // check if new and existing entry are the same (if entries have same ects means entry is a duplicate)
      if (
        newEntry &&
        (!existingEntry || existingEntry.ects !== newEntry.ects)
      ) {
        result.push(newEntry);
      }
    }
    return result;
  }

  toggleCourseOrganisation(course: Course, mode: string) {
    const element = document.getElementById(`${course.id}-organisation`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedCourseOrganisation = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedCourseOrganisation = false;
      }
    }
  }

  toggleCourseDescription(course: Course, mode: string) {
    const element = document.getElementById(`${course.id}-description`);
    if (element !== null) {
      if (mode === 'expand') {
        element.classList.remove('truncate-text');
        this.expandedCourseDescription = true;
      }
      if (mode === 'collapse') {
        element.classList.add('truncate-text');
        this.expandedCourseDescription = false;
      }
    }
  }

  writeEMail(email: string) {
    window.open('mailto:' + email, '_self');
  }
}
