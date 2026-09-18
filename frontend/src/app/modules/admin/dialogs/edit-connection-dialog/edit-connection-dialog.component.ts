import { Component, Input, OnInit, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { ModuleCourse } from '@interfaces/module-course';
import { Course } from '@interfaces/course';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { ModuleCourse2CourseConnection } from '@interfaces/connection';
import { AdminRestService } from '../../admin-rest.service';
import { finalize, take } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminDialogData } from '../admin-dialog.component';

@Component({
  selector: 'admin-edit-connection-dialog',
  templateUrl: './edit-connection-dialog.component.html',
  styleUrl: './edit-connection-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EditConnectionDialogComponent implements OnInit {
  private fuseSearch = inject(FuseSearchService);
  private rest = inject(AdminRestService);
  private snackbar = inject(SnackbarService);
  private dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef);
  private data = inject<AdminDialogData>(MAT_DIALOG_DATA);

  @ViewChild('paginator') paginator: MatPaginator; // variable to change paginator if necessary
  @Input() mCourse: ModuleCourse;
  @Input() semester: string;
  @Input() chair: string;
  @Input() moduleName: string;
  @Input() moduleAcronym: string;
  @Input() connection: ModuleCourse2CourseConnection[];
  @Input() courses: Course[];
  loading: boolean;
  filterByChair: boolean;
  courseResults: Course[]; // all found courses
  viewResult: Course[]; // found courses limited to the pageSize -> needed for pagination
  pageSize = 10;
  searchTerm: string;
  connectedCourses: Course[];
  connectedIds = new Set<string>(); // ids of the connected courses -> decides the button of a card
  // a write is on its way -> block the buttons so the same connection is not sent twice
  saving = false;

  // fields of a course the fuzzy search runs on
  private readonly searchKeys = ['name', 'short', 'desc', 'chair', 'keywords'];

  ngOnInit(): void {
    this.updateConnectedCourses();
    this.autoSearch();
  }

  // function to set and update the array of connected courses
  updateConnectedCourses() {
    // the connections carry their course, so the list does not depend on the loaded course pool
    this.connectedCourses = this.connection.map((el) => el.course);
    this.connectedIds = new Set(this.connection.map((el) => el.cId));
  }

  /**
   * Searches automatically when the dialog is opened, so the fitting courses are offered right away.
   * Searched are the title of the module course and the infos of the module it belongs to.
   * The title of the module course is the most specific term, therefore its hits are listed first.
   */
  private autoSearch() {
    const terms = [this.mCourse.name, this.moduleName, this.moduleAcronym].filter(
      (term) => !!term && term.trim().length !== 0,
    );
    if (terms.length === 0) {
      return;
    }
    // prefill the search field so the term can be adjusted by hand
    this.searchTerm = terms[0];

    const foundCourses: Course[] = [];
    const knownIds = new Set<string>();
    for (const term of terms) {
      // fuse search returns undefined for an empty term
      const results: Course[] =
        this.fuseSearch.search(this.courses, term, this.searchKeys) ?? [];
      for (const course of results) {
        if (!knownIds.has(course.id)) {
          knownIds.add(course.id);
          foundCourses.push(course);
        }
      }
    }
    this.courseResults = foundCourses;
    this.viewResult = foundCourses.slice(0, this.pageSize);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.chair).then(() => {
      this.snackbar.openSnackBar({
        type: AlertType.SUCCESS,
        message: $localize `Lehrstuhl in die Zwischenablage kopiert!`,
      });
    });
  }

  emitSearch() {
    this.loading = true;
    let filteredCourses = this.courses;
    if (this.filterByChair) {
      filteredCourses = this.courses.filter((el) => el.chair === this.chair);
    }
    this.courseResults = this.searchTerm
      ? this.fuseSearch.search(filteredCourses, this.searchTerm, this.searchKeys)
      : filteredCourses;
    this.viewResult = this.courseResults.slice(0, this.pageSize);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loading = false;
  }

  // triggers page change in the paginator
  handlePageEvent(event: PageEvent) {
    const start = event.pageIndex * event.pageSize;
    const end = start + event.pageSize;
    this.viewResult = this.courseResults.slice(start, end);
  }

  clearInput() {
    this.searchTerm = '';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Marks that a connection was written, so the component that opened the dialog reloads its board.
   * The dialog data is the same object instance on both sides, so the flag is also seen when the
   * dialog is closed via escape or backdrop click, where no dialog result is passed on.
   */
  private markChanged() {
    this.data.hasChanges = true;
  }

  connectModule(course: Course) {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.rest
      .createConnectionCourse2Module(
        this.mCourse.mcId,
        course.id,
        course.semester,
      )
      .pipe(
        take(1),
        finalize(() => (this.saving = false)),
      )
      .subscribe((mes) => {
        // add connection to course for status check
        course.mCourses?.push({
          modCourse: this.mCourse,
        });

        // add connection to connections to communicate change to card component
        this.connection.push({
          mcId: this.mCourse.mcId,
          cId: course.id,
          semester: course.semester,
          course: course,
          modCourse: this.mCourse,
        });
        this.updateConnectedCourses(); // manually trigger update of connected courses
        this.markChanged();

        // show success message
        this.snackbar.openSnackBar({
          type: AlertType.SUCCESS,
          message: mes,
        });
      });
  }

  disconnectModule(course: Course) {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.rest
      .deleteConnectionCourse2Module(
        this.mCourse.mcId,
        course.id,
        course.semester,
      )
      .pipe(
        take(1),
        finalize(() => (this.saving = false)),
      )
      .subscribe((mes) => {
        // delete connection from course for status check
        const remainingModuleCourses = course.mCourses?.filter(
          (el) => el.modCourse.mcId !== this.mCourse.mcId,
        );
        course.mCourses = remainingModuleCourses;
        // delete connection from connections to communicate change to card component
        const connection2deleteIndex = this.connection.findIndex(
          (el) => el.cId == course.id && el.semester == course.semester,
        );
        // check if index was found
        if (connection2deleteIndex >= 0) {
          this.connection.splice(connection2deleteIndex, 1);
          this.updateConnectedCourses(); // manually trigger update of connected courses
          this.markChanged();
        }

        // show success message
        this.snackbar.openSnackBar({
          type: AlertType.SUCCESS,
          message: mes,
        });
      });
  }
}
