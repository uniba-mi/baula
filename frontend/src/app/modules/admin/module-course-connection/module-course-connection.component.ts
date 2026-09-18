import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminRestService } from '../admin-rest.service';
import { AdminDialogComponent } from '../dialogs/admin-dialog.component';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Module } from '@interfaces/module';
import { ModuleCourse } from '@interfaces/module-course';
import { Semester } from '@interfaces/semester';
import { Store } from '@ngrx/store';
import { getModules } from 'src/app/selectors/module-overview.selectors';
import {
  ModuleCourse2CourseConnection,
  ModuleCourse2CourseLink,
} from '@interfaces/connection';
import { Course } from '@interfaces/course';
import { RestService } from 'src/app/rest.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';

// which modules are shown: only those of the loaded module handbook or all modules of all versions
export type ModuleScope = 'mhb' | 'all';
// filter on the offered term (Angebotssemester) of a module
export type OfferTermFilter = 'all' | 'w' | 's' | 'match';

export interface ModuleConnectionContainer {
  key: string; // stable identity, so a reload reuses the rendered cards
  module: Module;
  connection: ModuleCourse2CourseConnection[];
}

export interface ConnectionView {
  board: ConnectionBoard;
  courses: Course[]; // course pool of the selected semester, passed on to the dialogs
}

export interface ConnectionBoard {
  none: ModuleConnectionContainer[]; // modules without any connected course
  partial: ModuleConnectionContainer[]; // modules where some module courses are still unconnected
  full: ModuleConnectionContainer[]; // modules where every module course has a connected course
  moduleCount: number; // number of modules before the offer term filter was applied
}

@Component({
  selector: 'admin-module-course-connection',
  templateUrl: './module-course-connection.component.html',
  styleUrl: './module-course-connection.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ModuleCourseConnectionComponent implements OnInit {
  private rest = inject(AdminRestService);
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private appRest = inject(RestService);
  private snackbar = inject(SnackbarService);

  private semester$ = new BehaviorSubject<string>(new Semester().name);
  private scope$ = new BehaviorSubject<ModuleScope>('mhb');
  private offerTerm$ = new BehaviorSubject<OfferTermFilter>('all');
  private reload$ = new BehaviorSubject<void>(undefined);

  selectedSemester: string = new Semester().name;
  scope: ModuleScope = 'mhb';
  offerTerm: OfferTermFilter = 'all';

  view$: Observable<ConnectionView>;
  // blocks the board while data is on its way, so nothing is edited on a stale state
  loading = true;

  ngOnInit(): void {
    // all modules of all module handbook versions -> requested once and only if the scope needs it
    const allModules$ = this.appRest.getModules().pipe(
      map((modules) => this.collapseByAcronym(modules)),
      // a failed request must not kill the whole view for the rest of the session
      catchError(() => {
        this.showError('Die Module konnten nicht geladen werden.');
        return of([] as Module[]);
      }),
      shareReplay(1),
    );

    const modules$ = this.scope$.pipe(
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((scope) =>
        scope === 'all' ? allModules$ : this.store.select(getModules),
      ),
    );

    // the course pool only depends on the semester -> a reload after a dialog change does not
    // fetch it again, it is by far the heaviest request of the page
    const courses$ = this.semester$.pipe(
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((semester) =>
        this.appRest.getCoursesBySemester(semester).pipe(
          map((courses) => ({ semester, courses })),
          catchError(() => {
            this.showError(
              'Die Lehrveranstaltungen konnten nicht geladen werden.',
            );
            return of({ semester, courses: [] as Course[] });
          }),
        ),
      ),
      shareReplay(1),
    );

    const links$ = combineLatest([
      this.semester$.pipe(distinctUntilChanged()),
      this.reload$,
    ]).pipe(
      tap(() => (this.loading = true)),
      // switchMap cancels the pending request when the semester changes again
      switchMap(([semester]) =>
        this.rest.getAllConnectionsForSemester(semester).pipe(
          map((links) => ({ semester, links })),
          catchError(() => {
            this.showError('Die Verknüpfungen konnten nicht geladen werden.');
            return of({ semester, links: [] as ModuleCourse2CourseLink[] });
          }),
        ),
      ),
      shareReplay(1),
    );

    this.view$ = combineLatest([
      modules$,
      courses$,
      links$,
      this.offerTerm$.pipe(distinctUntilChanged()),
    ]).pipe(
      // both requests are restarted on a semester change but finish independently -> only render
      // once they describe the same semester, so board and course pool never mix semesters
      filter(([, courses, links]) => courses.semester === links.semester),
      map(([modules, courses, links, offerTerm]) => ({
        board: this.buildBoard(
          modules,
          links.links,
          courses.courses,
          offerTerm,
          links.semester,
        ),
        courses: courses.courses,
      })),
      // everything needed for a consistent board has arrived
      tap(() => (this.loading = false)),
    );
  }

  /**
   * Collapses all versions of a module into a single entry, identified by its acronym.
   * The newest version represents the module, the module courses of all versions are merged.
   * A connection is stored on the mcId only (Course2ModuleCourse) and several module versions
   * reference the same mcId (Mod2ModCourse) -> a change here applies to all versions at once.
   */
  private collapseByAcronym(modules: Module[]): Module[] {
    const grouped = new Map<string, Module[]>();
    for (const module of modules) {
      const versions = grouped.get(module.acronym);
      if (versions) {
        versions.push(module);
      } else {
        grouped.set(module.acronym, [module]);
      }
    }

    const collapsed: Module[] = [];
    for (const versions of grouped.values()) {
      const newest = versions.reduce((a, b) => (b.version > a.version ? b : a));
      const mCourses: ModuleCourse[] = [];
      const knownIds = new Set<string>();
      for (const version of versions) {
        for (const mCourse of version.mCourses ?? []) {
          if (!knownIds.has(mCourse.mcId)) {
            knownIds.add(mCourse.mcId);
            mCourses.push(mCourse);
          }
        }
      }
      // the response objects are plain json, so the merged module courses are set in place
      newest.mCourses = mCourses;
      collapsed.push(newest);
    }

    return collapsed.sort((a, b) => a.acronym.localeCompare(b.acronym));
  }

  // splits the modules into the three kanban groups based on the connections of the semester
  private buildBoard(
    modules: Module[],
    links: ModuleCourse2CourseLink[],
    courses: Course[],
    offerTerm: OfferTermFilter,
    semester: string,
  ): ConnectionBoard {
    const coursesById = new Map(courses.map((course) => [course.id, course]));
    // index the links of the semester once by mcId instead of requesting them per module.
    // The links only carry ids, the course itself comes from the pool that is loaded anyway.
    const coursesByModuleCourse = new Map<string, Course[]>();
    for (const link of links) {
      const course = coursesById.get(link.cId);
      if (!course) {
        continue;
      }
      const existing = coursesByModuleCourse.get(link.mcId);
      if (existing) {
        existing.push(course);
      } else {
        coursesByModuleCourse.set(link.mcId, [course]);
      }
    }

    const board: ConnectionBoard = {
      none: [],
      partial: [],
      full: [],
      moduleCount: modules.length,
    };
    const usedKeys = new Set<string>();

    for (const module of modules) {
      if (!this.matchesOfferTerm(module, offerTerm, semester)) {
        continue;
      }
      const mCourses = module.mCourses ?? [];
      const connection: ModuleCourse2CourseConnection[] = [];
      let connectedCount = 0;
      for (const mCourse of mCourses) {
        const connectedCourses = coursesByModuleCourse.get(mCourse.mcId) ?? [];
        if (connectedCourses.length !== 0) {
          connectedCount++;
        }
        for (const course of connectedCourses) {
          connection.push({
            mcId: mCourse.mcId,
            cId: course.id,
            semester: course.semester,
            course,
            modCourse: mCourse,
          });
        }
      }

      const container: ModuleConnectionContainer = {
        key: this.buildContainerKey(module, usedKeys),
        module,
        connection,
      };

      if (connectedCount === 0) {
        board.none.push(container);
      } else if (connectedCount === mCourses.length) {
        board.full.push(container);
      } else {
        board.partial.push(container);
      }
    }

    return board;
  }

  /**
   * Builds the key the template tracks a module card by. A module can sit in several module groups
   * of one handbook, so the module group is part of the key; the counter is a last resort that
   * keeps the keys unique even if the data ever repeats a module within one group.
   */
  private buildContainerKey(module: Module, usedKeys: Set<string>): string {
    const base = `${module.mId}|${module.version}|${module.mgId ?? ''}`;
    let key = base;
    let counter = 1;
    while (usedKeys.has(key)) {
      key = `${base}|${counter++}`;
    }
    usedKeys.add(key);
    return key;
  }
  /**
   * Checks the offered term (Angebotssemester) of a module against the selected filter.
   * 'match' keeps the previous behaviour of showing only the modules offered in the chosen semester.
   *
   * Now it is getting complicated :)
   *  1) Check if the wanted term is winter (w) or summer (s)
   *  2) Depending on this, we need to negative filter out all modules that are only offered in the
   *     other semester. Therefore we identify those modules, that include the negative semester but
   *     at the same time not include the wanted semester. Necessary because of 'WS, SS' which means
   *     both semester. Also we need negative filtering, since we also have some without semester
   *     like 'jährlich' or 'keine Angabe'.
   */
  private matchesOfferTerm(
    module: Module,
    filter: OfferTermFilter,
    semester: string,
  ): boolean {
    if (filter === 'all') {
      return true;
    }
    const term = module.term ?? '';
    const wantedTerm = filter === 'match' ? semester.slice(-1) : filter;
    if (wantedTerm === 'w') {
      return !(term.includes('SS') && !term.includes('WS'));
    }
    return !(term.includes('WS') && !term.includes('SS'));
  }

  // function for automatic mapping based on acronym matching
  connectCourses2Modulcourses() {
    const dialogRef = this.dialog.open(AdminDialogComponent, {
      data: {
        dialogTitle: $localize `Module und Lehrveranstaltungen werden verknüpft...`,
        dialogContentId: 'univis-crawl-dialog',
        univisCrawl$: this.rest.initConnectionCourses2Modules(),
      },
    });

    // the heuristic creates connections -> reload the board afterwards
    dialogRef.afterClosed().subscribe(() => this.reload());
  }

  // selection of semester to show the connections of the selected semester
  selectSemester(semester: string) {
    this.selectedSemester = semester;
    this.semester$.next(semester);
  }

  // switch between the modules of the loaded module handbook and all modules of all versions
  selectScope(scope: ModuleScope) {
    this.scope = scope;
    this.scope$.next(scope);
  }

  // filter the modules by their offered term
  selectOfferTerm(offerTerm: OfferTermFilter) {
    this.offerTerm = offerTerm;
    this.offerTerm$.next(offerTerm);
  }

  // reloads the connections of the currently selected semester
  reload() {
    this.reload$.next();
  }

  private showError(message: string) {
    this.snackbar.openSnackBar({ type: AlertType.DANGER, message });
  }
}
