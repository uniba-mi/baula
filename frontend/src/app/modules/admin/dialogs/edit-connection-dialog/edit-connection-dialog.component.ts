import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModuleCourse } from '../../../../../../../interfaces/module-course';
import { Course } from '../../../../../../../interfaces/course';
import { FuseSearchService } from 'src/app/shared/services/fuse-search.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { ModuleCourse2CourseConnection } from '../../../../../../../interfaces/connection';
import { AdminRestService } from '../../admin-rest.service';
import { take } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'admin-edit-connection-dialog',
    templateUrl: './edit-connection-dialog.component.html',
    styleUrl: './edit-connection-dialog.component.scss',
    standalone: false
})
export class EditConnectionDialogComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator; // variable to change paginator if necessary
  @Input() mCourse: ModuleCourse;
  @Input() semester: string;
  @Input() chair: string;
  @Input() connection: ModuleCourse2CourseConnection[];
  @Input() courses: Course[];
  loading: boolean;
  filterByChair: boolean;
  courseResults: Course[]; // all found courses
  viewResult: Course[]; // found courses limited to the pageSize -> needed for pagination
  pageSize = 10;
  searchTerm: string;
  connectedCourses: Course[]; // contains all courses that are connected to the moduleCourse -> right side in ui

  constructor(
    private fuseSearch: FuseSearchService,
    private rest: AdminRestService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.updateConnectedCourses();
  }

  // function to set and update the array of connected courses
  updateConnectedCourses() {
    const connectedIds = this.connection
      .map((el) => el.cId);
    this.connectedCourses = this.courses.filter((el) =>
      connectedIds.includes(el.id)
    );
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.chair).then(() => {
      this.snackbar.openSnackBar({
        type: AlertType.SUCCESS,
        message: 'Lehrstuhl in die Zwischenablage kopiert!',
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
      ? this.fuseSearch.search(filteredCourses, this.searchTerm, [
          'name',
          'short',
          'desc',
          'chair',
          'keywords',
        ])
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
    this.viewResult = this.courseResults.slice(start, end)
  }

  clearInput() {
    this.searchTerm = '';
  }

  connectModule(course: Course) {
    this.rest
      .createConnectionCourse2Module(
        this.mCourse.mcId,
        course.id,
        course.semester
      )
      .pipe(take(1))
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

        // show success message
        this.snackbar.openSnackBar({
          type: AlertType.SUCCESS,
          message: mes,
        });
      });
  }

  disconnectModule(course: Course) {
    this.rest
      .deleteConnectionCourse2Module(
        this.mCourse.mcId,
        course.id,
        course.semester
      )
      .pipe(take(1))
      .subscribe((mes) => {
        // delete connection from course for status check
        const remainingModuleCourses = course.mCourses?.filter(
          (el) => el.modCourse.mcId !== this.mCourse.mcId
        );
        course.mCourses = remainingModuleCourses;
        // delete connection from connections to communicate change to card component
        const connection2deleteIndex = this.connection.findIndex(
          (el) =>
            el.cId == course.id &&
            el.semester == course.semester
        );
        // check if index was found
        if(connection2deleteIndex >= 0) {
          this.connection.splice(connection2deleteIndex, 1);
          this.updateConnectedCourses(); // manually trigger update of connected courses
        }

        // show success message
        this.snackbar.openSnackBar({
          type: AlertType.SUCCESS,
          message: mes,
        });
      });
  }
}
