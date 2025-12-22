import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminRestService } from '../admin-rest.service';
import { AdminDialogComponent } from '../dialogs/admin-dialog.component';
import { forkJoin, map, Observable, switchMap, shareReplay } from 'rxjs';
import { Module } from '../../../../../../interfaces/module';
import { Semester } from '../../../../../../interfaces/semester';
import { Store } from '@ngrx/store';
import { getModules } from 'src/app/selectors/module-overview.selectors';
import { ModuleCourse2CourseConnection } from '../../../../../../interfaces/connection';
import { Course } from '../../../../../../interfaces/course';
import { RestService } from 'src/app/rest.service';

@Component({
    selector: 'admin-module-course-connection',
    templateUrl: './module-course-connection.component.html',
    styleUrl: './module-course-connection.component.scss',
    standalone: false
})
export class ModuleCourseConnectionComponent implements OnInit {
  semesterList: Semester[] = new Semester('2022s').getSemesterList(10);
  selectedSemester: string = new Semester().name;
  noConnectedCourses$: Observable<{ module: Module, connection: ModuleCourse2CourseConnection[] }[]>; // contains all modules that have no connected courses
  partiallyConnectedCourses$: Observable<{ module: Module, connection: ModuleCourse2CourseConnection[] }[]>; // contains all modules that have connected courses but some connections missing
  fullyConnectedCourses$: Observable<{ module: Module, connection: ModuleCourse2CourseConnection[] }[]>; // contains all modules where all module courses have at least one connected course
  courses$: Observable<Course[]>;

  constructor(
    private rest: AdminRestService,
    private dialog: MatDialog,
    private store: Store,
    private appRest: RestService
  ) {}

  ngOnInit(): void {  
    // set initial module connections
    this.initModuleConnections();
    // preload courses for connection dialogs
    this.courses$ = this.appRest.getCoursesBySemester(this.selectedSemester)
  }


  // initialize the module connection groups for separation in kanban board
  initModuleConnections() {
    const moduleConnections$ = this.store.select(getModules).pipe(
      switchMap(modules => {
        const filteredModules = modules.filter(module => {
          /** Now it is getting complicated :)
           *  1) Check if semester is winter (w) or summer (s) term
           *  2) Depending on this, we need to negative filter out all modules that only offered in the other semester.
           *     Therefore we identify those modules, that include the negative semester but at the same time not 
           *     include the wanted semester. Necessary because of 'WS, SS' which means both semester. Also we need 
           *     negative filtering, since we also have some without semester like 'jährlich' or 'keine Angabe'.
           */
          if(this.selectedSemester.endsWith('w')) {
            if(module.term.includes('SS') && !module.term.includes('WS')) {
              return false;
            } else {
              return true;
            }
          } else {
            if(module.term.includes('WS') && !module.term.includes('SS')) {
              return false;
            } else {
              return true;
            }
          }
        })
        const requests = filteredModules.map(module =>
          this.rest.getConnectedCoursesForModule(module.mId, module.version, this.selectedSemester).pipe(
            map(connection => ({
              module,
              connection // Modul kombiniert mit dem Connection-Objekt
            }))
          )
        );
        return forkJoin(requests);
      }),
      shareReplay(1) // Teilt die Ergebnisse für mehrere Abonnenten, um die Requests nicht erneut auszuführen
    );
    
    // Gruppe 1: Module mit leerem Kurs-Array
    this.noConnectedCourses$ = moduleConnections$.pipe(
      map(modulesWithConnections => 
        modulesWithConnections.filter(container => container.connection.length === 0)
      )
    );
    
    // Gruppe 2: Module bei denen teilweise Verknüpfungen vorliegen
    this.partiallyConnectedCourses$ = moduleConnections$.pipe(
      map(modulesWithConnections => 
        modulesWithConnections.filter(container => {
          // check essential condition
          if(container.connection.length > 0) {
            // check if for each modulecourse a suitable connection exists
            const mCourses = container.module.mCourses.map(el => el.mcId);
            let result = false;
            for(let id of mCourses) {
              if(container.connection.find(el => el.mcId == id)) {
                continue;
              } else {
                result = true;
                break;
              }
            } 
            return result
          } else {
            return false;
          }
        })
      )
    );

    // Gruppe 3: Module bei denen alle Verknüpfungen vorliegen
    this.fullyConnectedCourses$ = moduleConnections$.pipe(
      map(modulesWithConnections => 
        modulesWithConnections.filter(container => {
          // check essential condition
          if(container.connection.length > 0) {
            // check if for each modulecourse a suitable connection exists
            const mCourses = container.module.mCourses.map(el => el.mcId);
            let result = true;
            for(let id of mCourses) {
              if(container.connection.find(el => el.mcId == id)) {
                continue;
              } else {
                result = false;
                break;
              }
            } 
            return result
          } else {
            return false;
          }
        })
      )
    );
  }

  // function for automatic mapping based on acronym matching
  connectCourses2Modulcourses() {
    this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: 'Module und Lehrveranstaltungen werden verknüpft...',
        dialogContentId: 'univis-crawl-dialog',
        univisCrawl$: this.rest.initConnectionCourses2Modules(),
      }
    });
  }

  // selection of semester to show only the modules offered in the selected semester
  selectSemester(semester: string) {
    this.initModuleConnections();
    this.courses$ = this.appRest.getCoursesBySemester(semester)
  }
}
