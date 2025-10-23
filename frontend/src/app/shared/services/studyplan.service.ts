import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { getHintByKey, getUser } from 'src/app/selectors/user.selectors';
import { Semester } from '../../../../../interfaces/semester';
import { User } from '../../../../../interfaces/user';
import { Semesterplan, SemesterplanTemplate } from '../../../../../interfaces/semesterplan';
import { ModulePlanningActions, SemesterplanActions, StudyplanActions } from 'src/app/actions/study-planning.actions';
import { Studyplan, StudyplanTemplate } from '../../../../../interfaces/studyplan';
import { filter, from, Observable, take, tap } from 'rxjs';
import { Module } from '../../../../../interfaces/module';
import { PlanningValidationService } from './planning-validation.service';
import { SnackbarService } from './snackbar.service';
import { AlertType } from '../classes/alert';
import { TransformationService } from './transformation.service';
import { getActiveStudyplanId } from 'src/app/selectors/study-planning.selectors';

@Injectable({
  providedIn: 'root',
})
export class StudyplanService {
  user$: Observable<User>;
  user: User;

  constructor(private store: Store, private planningValidation: PlanningValidationService, private snackbar: SnackbarService, private transform: TransformationService) { }

  ngOnInit() { }

  /** contains functions that are needed in several components related to the studyplanning component **/
  createStudyplan(
    inputName: string,
    startSemester?: string,
    duration?: number,
    duplSemesterplans?: Semesterplan[],
    status?: boolean,
  ) {
    if (inputName && startSemester && duration) {
      const studyplan: StudyplanTemplate = {
        name: inputName,
        status: typeof status === 'boolean' ? status : false,
        semesterPlans: [],
      };

      // helper function generates semesterplan structure
      // if studyplan is duplicated, the semesterplans are copied
      let semesterPlans: SemesterplanTemplate[] = this.generateSemesterplans(
        startSemester,
        duration,
        duplSemesterplans,
      );

      // creates studyplan and initialises semesterplans
      this.store.dispatch(
        StudyplanActions.createStudyplan({
          studyplan: studyplan,
          semesterPlans: semesterPlans,
        })
      );
    }
  }

  // Helperfunction to generate semesterplans
  generateSemesterplans(
    start: string,
    duration: number,
    duplSemesterplans?: Semesterplan[],
  ): SemesterplanTemplate[] {
    const semester = new Semester(start);
    const semesterList = semester.getSemesterList(duration);
    let result: SemesterplanTemplate[] = [];

    this.store.select(getUser).subscribe((user) => (this.user = user));
    let maxEcts = this.user.maxEcts ? this.user.maxEcts : 0;
    let aimedEcts = this.user.fulltime ? 30 : 18;

    // find current semester to determine past/future semesters and set isPastSemester correctly
    const currentSemesterIndex = semesterList.findIndex((sem) =>
      sem.isCurrentSemester()
    );
    const startSemesterIndex = semesterList.findIndex((sem) => sem.name === start);

    for (let i = 0; i < semesterList.length; i++) {
      const sem = semesterList[i];

      let isPastSemester = false;
      // check if semester is a past semester
      if (currentSemesterIndex !== -1 && startSemesterIndex !== -1) {
        isPastSemester = i < currentSemesterIndex && i >= startSemesterIndex;
      }

      // ensure that the aimedECTS for each semester don't exceed maxEcts
      let currentAimedEcts = maxEcts > aimedEcts ? aimedEcts : maxEcts;
      // make sure that this cannot be negative by the subtraction at the end of the function for the case that users take more time than the default semesters
      currentAimedEcts = currentAimedEcts > 0 ? currentAimedEcts : 0;

      result.push({
        semester: sem.name,
        modules: [],
        userGeneratedModules: [],
        courses: [],
        aimedEcts: currentAimedEcts,
        summedEcts: 0,
        isPastSemester,
        userId: this.user._id,
        expanded: true,
      });
      // reduce maxEcts by aimedEcts simulation planned progress
      maxEcts -= currentAimedEcts;
    }

    // if there are leftover ECTS (student takes less semesters than we thought), add them to the first semester's aimedEcts
    if (maxEcts > 0 && result.length > 0) {
      result[0].aimedEcts += maxEcts;
    }

    // if studyplan is duplicated, fill initial structure
    if (duplSemesterplans) {
      if(duplSemesterplans.length === result.length) {
        // if semesterplans are equal, just copy them
        result = duplSemesterplans
      } else {
        let semesterPlans = []
        for(let semester of semesterList) {
          let importedSemester = duplSemesterplans.find(duplSemester => duplSemester.semester === semester.name)
          if(importedSemester) {
            semesterPlans.push(importedSemester)
          } else {
            semesterPlans.push({
              semester: semester.name,
              modules: [],
              userGeneratedModules: [],
              courses: [],
              aimedEcts: aimedEcts,
              summedEcts: 0,
              isPastSemester: false,
              userId: this.user._id,
              expanded: true
            })
          }
        }
        result = semesterPlans
      }
    }
    return result;
  }

  // simply update after rename/edit
  updateStudyplan(studyplanId: string, studyplan: StudyplanTemplate) {
    this.store.dispatch(
      StudyplanActions.updateStudyplan({
        studyplanId: studyplanId,
        studyplan: studyplan
      })
    );
  }

  // legacy update
  updateStudyplans(studyplans: Studyplan[]) {
    // change is used to identify, if studyplan needs to be updated
    let changed = false;
    studyplans.forEach(studyplan => {
      studyplan.semesterPlans.forEach(semesterPlan => {
        // check if modules array is legacy and update with acronym
        if (semesterPlan.modules && semesterPlan.modules.length !== 0) {
          // check if entry is number, then transform entry to acronym
          for (let index in semesterPlan.modules) {
            if (!Number.isNaN(Number(semesterPlan.modules[index]))) {
              semesterPlan.modules[index] = this.transform.transformModuleId(semesterPlan.modules[index])
              changed = true;
            }
          }
        }
        // append flexNowImported to legacy placeholders
        if (semesterPlan.userGeneratedModules && semesterPlan.userGeneratedModules.length !== 0) {
          semesterPlan.userGeneratedModules.forEach(module => {
            if (module.flexNowImported === undefined) {
              if (module.notes === 'Importiert aus meinem FlexNow-Auszug') {
                module.flexNowImported = true;
              } else {
                module.flexNowImported = false;
              }
              changed = true;
            }
          });
        }
      });
      if (changed) {
        this.store.dispatch(StudyplanActions.updateStudyplan({ studyplanId: studyplan._id, studyplan: studyplan }))
      }
      // reset changed for next loop iteration
      changed = false;
    });
  }

  checkIfSemesterIsFinished(studyplans: Studyplan[]) {
    // wait until active plan id is available
    this.store
      .select(getActiveStudyplanId)
      .pipe(
        filter((activeStudyplanId) => activeStudyplanId != null && activeStudyplanId !== ''),
        take(1)
      ).subscribe((activeStudyplanId) => {

        // update stuyplans after active id is available
        from(studyplans).pipe(
          tap((studyplan) => {

            if (studyplan._id === activeStudyplanId) {

              studyplan.semesterPlans.forEach(semesterPlan => {

                const semester = new Semester(semesterPlan.semester);
                const isPast = semester.isPastSemester();

                // check if isPastSemester has changed
                if (isPast !== semesterPlan.isPastSemester) {

                  this.store.select(getHintByKey('finishSemester-hint')).pipe(take(1)).subscribe(hint => {
                    if (hint && !hint.hasConfirmed) {
                      this.store.dispatch(SemesterplanActions.updateShowFinishSemesterHint({ showFinishSemesterHint: true }));
                    }
                  });
                }
              });
            }
          })
        ).subscribe();
      });
  }

  // Helperfunction to calculate default ECTS
  calculateAimedEcts(maxEcts: number, duration: number) {
    const aimedEcts = maxEcts / duration;
    return aimedEcts;
  }

  addModuleToPlan(selectedModule: Module, semesterplanId: string, studyplanId: string) {
    // check for duplicates within semesterplan
    this.planningValidation
      .isModuleInSemesterplan(selectedModule.acronym, semesterplanId, studyplanId)
      .subscribe((isModuleContainedResult) => {
        if (!isModuleContainedResult.alreadyContained) {
          if (semesterplanId && studyplanId) {
            this.store.dispatch(
              ModulePlanningActions.addModuleToSemester({
                studyplanId: studyplanId,
                semesterplanId: semesterplanId,
                acronym: selectedModule.acronym,
                ects: selectedModule.ects,
              })
            );
          } else {
            this.snackbar.openSnackBar({
              type: AlertType.DANGER,
              message: 'Bitte trage Studienplan und Semester ein',
            });
          }
        } else {
          this.snackbar.openSnackBar({
            type: AlertType.DANGER,
            message: isModuleContainedResult.message,
          });
        }
      });
  }

  // for studyplan import validation
  checkSemesterplansStructure(semesterPlan: any[]): boolean {
    let result = true;
    for (let plan of semesterPlan) {
      if (
        typeof plan.semester === 'string' &&
        typeof plan.isPastSemester === 'boolean' &&
        Array.isArray(plan.modules) &&
        Array.isArray(plan.userGeneratedModules) &&
        Array.isArray(plan.courses) &&
        typeof plan.aimedEcts === 'number' &&
        typeof plan.summedEcts === 'number'
      ) {
        continue;
      } else {
        result = false;
        break;
      }
    }
    return result;
  }
}
