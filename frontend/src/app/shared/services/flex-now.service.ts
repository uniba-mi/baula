import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  concatMap,
  filter,
  map,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';
import { Semester } from '../../../../../interfaces/semester';
import { Consent, User } from '../../../../../interfaces/user';
import {
  getLastConsentByType,
  getUser,
} from 'src/app/selectors/user.selectors';
import { RestService } from 'src/app/rest.service';
import {
  FnCompletedCourse,
  FnCompletedModule,
  FnStudyPath,
} from '../../../../../interfaces/fn-user';
import {
  PathCourse,
  PathModule,
  StudyPath,
} from '../../../../../interfaces/study-path';
import {
  ModulePlanningActions,
} from 'src/app/actions/study-planning.actions';
import {
  getActiveStudyPlanId,
  getSemesterPlan,
} from 'src/app/selectors/study-planning.selectors';
import { getModules } from 'src/app/selectors/module-overview.selectors';

@Injectable({
  providedIn: 'root',
})
export class FlexnowService {
  lastFlexnowApiConsent$: Observable<Consent | null>;
  lastFlexNowStudypathConsent$: Observable<Consent | null>;
  lastFlexNowGradeConsent$: Observable<Consent | null>;
  currentUser$: Observable<User>;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private rest: RestService,
  ) {
    this.lastFlexnowApiConsent$ = this.store.select(
      getLastConsentByType('flexnow-api')
    );
    this.lastFlexNowStudypathConsent$ = this.store.select(
      getLastConsentByType('upload-exam-data')
    );
    this.lastFlexNowGradeConsent$ = this.store.select(
      getLastConsentByType('include-grades')
    );
    this.currentUser$ = this.store.select(getUser);
  }

  triggerFlexNowDataLoading(semesters$: Observable<Semester[]>, mode: 'create-user' | 'update-studypath' | 'update-metadata') {
    this.lastFlexnowApiConsent$
      .pipe(
        take(1),
        concatMap((flexNowConsent) => {
          // if user has already consented, we can skip the consent step
          if (flexNowConsent?.hasConfirmed) {
            return of(true);
          } else {
            return this.openConsentDialog();
          }
        }),
        filter((consentResult) => consentResult === true),
        concatMap(() =>
          // open semester selection dialog anyway
          this.openSemesterSelectionDialog(semesters$)
        ),
        filter((selectedSemesters) => selectedSemesters !== null),
        withLatestFrom(
          this.lastFlexNowStudypathConsent$,
          this.lastFlexNowGradeConsent$
        ),
        concatMap(([selectedSemesters, studypathConsent, gradeConsent]) =>
          this.openOverwriteConfirmationDialog(
            mode,
            selectedSemesters,
            studypathConsent?.hasConfirmed ?? false,
            gradeConsent?.hasConfirmed ?? false
          )
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  openConsentDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
      },
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result.flexNowImportConfirmed) {
          console.log(result);
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'flexnow-api',
              hasConfirmed: true,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'upload-exam-data',
              hasConfirmed: result.studypathConfirmed ?? false,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
          this.store.dispatch(
            UserActions.addConsent({
              ctype: 'include-grades',
              hasConfirmed: result.gradesConfirmed ?? false,
              hasResponded: true,
              timestamp: new Date(),
            })
          );
        }
      }),
      map((result) => !!result) // boolean
    );
  }

  // only pass in the semesters we need
  openSemesterSelectionDialog(semesters$: Observable<Semester[]>) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Semester wählen',
        dialogContentId: 'select-semester-dialog',
        semesters$: semesters$,
        mode: 'multi',
      },
    });

    return dialogRef
      .afterClosed()
      .pipe(map((result) => (result && result.length > 0 ? result : null)));
  }

  openOverwriteConfirmationDialog(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    semesters: string[],
    studypathConsent: boolean,
    gradeConsent: boolean
  ): Observable<boolean> {
    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Ausgewählte Semester mit den FlexNow-Daten überschreiben?',
      actionType: 'overwrite',
      confirmationItem: 'deine ausgewählten Semester',
      confirmButtonLabel: 'Überschreiben',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.updateStudypathWithFlexNowData(
          mode,
          semesters,
          studypathConsent,
          gradeConsent
        );
        this.dialog.closeAll();
      },
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result) {
          this.updateStudypathWithFlexNowData(
            mode,
            semesters,
            studypathConsent,
            gradeConsent
          );
        }
      }),
      map((result) => !!result)
    );
  }

  updateStudypathWithFlexNowData(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    semesters: string[],
    studypathConsent: boolean,
    gradeConsent: boolean
  ) {
    this.getFlexNowData(mode, studypathConsent, gradeConsent, semesters)
      .pipe(take(1))
      .pipe(
        withLatestFrom(
          this.store.select(getSemesterPlan),
          this.store.select(getActiveStudyPlanId),
          this.store.select(getModules)
        )
      )
      .subscribe(([user, semesterPlan, studyPlanId, mhbModules]) => {
        if (user) {
          const modules = user.studyPath.completedModules;
          const currentSemester = new Semester().name;
          if (modules.length > 0 && semesterPlan) {
            const currentModules = modules.filter(
              (mod) => mod.semester === currentSemester
            );
            let userGeneratedModules = [];
            for (let currentModule of currentModules) {
              if (!semesterPlan.modules.includes(currentModule.acronym)) {
                const moduleExistInMhb = mhbModules.find(mod => mod.acronym == currentModule.acronym);
                if(moduleExistInMhb) {
                  this.store.dispatch(
                    ModulePlanningActions.addModuleToSemester({
                      studyPlanId,
                      semesterPlanId: semesterPlan._id,
                      acronym: currentModule.acronym,
                      ects: currentModule.ects,
                    })
                  );
                } else {
                  userGeneratedModules.push(currentModule)
                }
              }
            }
            if(userGeneratedModules.length > 0) {
              this.store.dispatch(
                ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlans({
                  modules: userGeneratedModules,
                  semesterName: new Semester().name
                })
              )
            }
          }
          this.store.dispatch(StudyPathActions.updateStudyPath({ completedModules: user.studyPath.completedModules }));
        }
      });
  }

  getFlexNowData(
    mode: 'create-user' | 'update-studypath' | 'update-metadata',
    studypathConsent: boolean,
    gradeConsent: boolean,
    semesters?: string[]
  ): Observable<User | undefined> {
    return this.rest
      .getStudentDataViaFlexNow(studypathConsent, gradeConsent)
      .pipe(
        withLatestFrom(this.currentUser$),
        map(([flexNowOutput, user]) => {
          if (flexNowOutput) {
            console.log(flexNowOutput)
            // BEGIN ONLY FOR DEV PURPOSE
            /* const sp = flexNowOutput.metadata.sps[0];
            let messages = [];
            messages.push(`Studiengang: ${sp.name}`);
            messages.push(
              sp.mhbId && sp.mhbVersion
                ? 'Modulhandbuch gefunden'
                : 'Kein Modulhandbuch gefunden'
            );
            messages.push(
              `Studiendauer: ${flexNowOutput.metadata.duration} Semester`
            );
            messages.push(`${flexNowOutput.metadata.maxEcts} ECTS`);
            messages.push(
              `Studienbeginn im ${
                new Semester(flexNowOutput.metadata.startSemester).fullName
              }`
            );
            console.log('Metainformationen (XML):');
            console.log(flexNowOutput.metadata);
            console.log('Studienverlauf:');
            console.log(flexNowOutput.studypath);
            if (flexNowOutput.studypath && studypathConsent) {
              messages.push('');
              messages.push('Folgende Module gefunden:');
              for (let module of flexNowOutput.studypath.completedModules) {
                messages.push(
                  `  - ${module.acronym} - ${
                    new Semester(module.semester).fullName
                  } - ${module.status} ${
                    gradeConsent && module.grade
                      ? '- Note: ' + module.grade
                      : ''
                  }`
                );
              }
              messages.push('');
              messages.push('Folgende Lehrveranstaltungen wurden gefunden:');
              for (let course of flexNowOutput.studypath.completedCourses) {
                messages.push(
                  `  - ${course.name} - ${
                    new Semester(course.semester).fullName
                  }`
                );
              }
            }
            window.alert(messages.join('\n')); */
            // END ONLY FOR DEV PURPOSE
            let updatedUser = {
              ...user,
            };

            if(flexNowOutput.studypath && (mode === 'create-user' || mode === 'update-studypath')) {
              updatedUser = {
                ...updatedUser,
                studyPath: this.extractStudypath(
                  flexNowOutput.studypath,
                  user.studyPath,
                  semesters
                )
              }
            }

            if(mode === 'create-user' || mode === 'update-metadata') {
              updatedUser = {
                ...updatedUser,
                ...flexNowOutput.metadata
              }
            }

            return updatedUser;
          } else {
            return undefined;
          }
        })
      );
  }

  private extractStudypath(
    fnStudypath: FnStudyPath,
    userStudypath: StudyPath,
    semesters?: string[]
  ): StudyPath {
    if (semesters && userStudypath) {
      // define starting variables
      let completedModules = userStudypath.completedModules;
      let completedCourses = userStudypath.completedCourses;

      // filter modules and courses, that are kept
      completedModules = completedModules.filter(
        (mod) => !semesters.includes(mod.semester)
      );
      completedCourses = completedCourses.filter(
        (course) => !semesters.includes(course.semester)
      );

      let filteredImportedModules = fnStudypath.completedModules.filter((mod) =>
        semesters.includes(new Semester(mod.semester).name)
      );
      let filteredImportedCourses = fnStudypath.completedCourses.filter(
        (course) => semesters.includes(course.semester)
      );

      let studypath = {
        completedModules: [
          ...completedModules,
          ...this.extractCompletedModules(filteredImportedModules),
        ],
        completedCourses: [
          ...completedCourses,
          ...this.extractCompletedCourses(filteredImportedCourses),
        ],
      };
      return studypath;
    } else {
      return {
        completedModules: this.extractCompletedModules(
          fnStudypath.completedModules
        ),
        completedCourses: this.extractCompletedCourses(
          fnStudypath.completedCourses
        ),
      };
    }
  }

  private extractCompletedModules(
    modules: FnCompletedModule[]
  ): PathModule[] {
    console.log(modules);
    return modules.map((fnModule) => {
      let mgId = undefined;
      console.log(`processing data for module ${fnModule.acronym}`);
      let moduleGroups = fnModule.moduleGroups;
      // TODO: if more than one Modulegroup set modulegroup to undefined, user need to set it
      console.log('Modulegroups');
      console.log(moduleGroups);
      if (moduleGroups && moduleGroups.length == 1) {
        mgId = moduleGroups[0].mgId;
      } else {
        console.log(
          moduleGroups.length > 1
            ? 'Too much module groups available'
            : 'No modulegroups available'
        );
      }

      return {
        acronym: fnModule.acronym,
        name: fnModule.name,
        ects: fnModule.ects,
        status: this.transformStatus(fnModule.status),
        mgId,
        semester: new Semester(fnModule.semester).name,
        isUserGenerated: false,
        flexNowImported: true,
        grade: fnModule.grade ?? 0,
      };
    });
  }

  private extractCompletedCourses(
    courses: FnCompletedCourse[]
  ): PathCourse[] {
    // TODO -> courses need to be searched with name
    return [];
  }

  private transformStatus(status: string): string {
    switch (status) {
      case 'bestanden':
        return 'passed';
      case 'zugelassen':
        return 'taken';
      case 'nicht bestanden':
        return 'failed';
      default:
        return 'open';
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
