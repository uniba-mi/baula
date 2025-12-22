import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { getHintByKey, getUser } from 'src/app/selectors/user.selectors';
import { Semester } from '../../../../../interfaces/semester';
import { User } from '../../../../../interfaces/user';
import { SemesterPlan, SemesterPlanTemplate } from '../../../../../interfaces/semester-plan';
import { ModulePlanningActions, SemesterPlanActions, StudyPlanActions } from 'src/app/actions/study-planning.actions';
import { StudyPlan, StudyPlanTemplate } from '../../../../../interfaces/study-plan';
import { filter, from, Observable, take, tap } from 'rxjs';
import { Module } from '../../../../../interfaces/module';
import { PlanningValidationService } from './planning-validation.service';
import { SnackbarService } from './snackbar.service';
import { AlertType } from '../classes/alert';
import { TransformationService } from './transformation.service';
import { getActiveStudyPlanId } from 'src/app/selectors/study-planning.selectors';

@Injectable({
  providedIn: 'root',
})
export class StudyPlanService {
  user$: Observable<User>;
  user: User;

  constructor(private store: Store, private planningValidation: PlanningValidationService, private snackbar: SnackbarService, private transform: TransformationService) { }

  ngOnInit() { }

  /** contains functions that are needed in several components related to the study planning component **/
  createStudyPlan(
    inputName: string,
    startSemester?: string,
    duration?: number,
    duplSemesterPlans?: SemesterPlan[],
    status?: boolean,
  ) {
    if (inputName && startSemester && duration) {
      const studyPlan: StudyPlanTemplate = {
        name: inputName,
        status: typeof status === 'boolean' ? status : false,
        semesterPlans: [],
      };

      // helper function generates semester plan structure
      // if study plan is duplicated, the semester plans are copied
      let semesterPlans: SemesterPlanTemplate[] = this.generateSemesterPlans(
        startSemester,
        duration,
        duplSemesterPlans,
      );

      // creates study plan and initialises semester plans
      this.store.dispatch(
        StudyPlanActions.createStudyPlan({
          studyPlan: studyPlan,
          semesterPlans: semesterPlans,
        })
      );
    }
  }

  // Helperfunction to generate semester plans
  generateSemesterPlans(
    start: string,
    duration: number,
    duplSemesterPlans?: SemesterPlan[],
  ): SemesterPlanTemplate[] {
    const semester = new Semester(start);
    const semesterList = semester.getSemesterList(duration);
    let result: SemesterPlanTemplate[] = [];

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

      // ensure that the aimedEcts for each semester don't exceed maxEcts
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

    // if study plan is duplicated, fill initial structure
    if (duplSemesterPlans) {
      if(duplSemesterPlans.length === result.length) {
        // if semester plans are equal, just copy them
        result = duplSemesterPlans
      } else {
        let semesterPlans = []
        for(let semester of semesterList) {
          let importedSemester = duplSemesterPlans.find(duplSemester => duplSemester.semester === semester.name)
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
  updateStudyPlan(studyPlanId: string, studyPlan: StudyPlanTemplate) {
    this.store.dispatch(
      StudyPlanActions.updateStudyPlan({
        studyPlanId: studyPlanId,
        studyPlan: studyPlan
      })
    );
  }

  // legacy update
  updateStudyPlans(studyPlans: StudyPlan[]) {
    // change is used to identify, if study plan needs to be updated
    let changed = false;
    studyPlans.forEach(studyPlan => {
      studyPlan.semesterPlans.forEach(semesterPlan => {
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
        this.store.dispatch(StudyPlanActions.updateStudyPlan({ studyPlanId: studyPlan._id, studyPlan: studyPlan }))
      }
      // reset changed for next loop iteration
      changed = false;
    });
  }

  checkIfSemesterIsFinished(studyPlans: StudyPlan[]) {
    // wait until active plan id is available
    this.store
      .select(getActiveStudyPlanId)
      .pipe(
        filter((activeStudyPlanId) => activeStudyPlanId != null && activeStudyPlanId !== ''),
        take(1)
      ).subscribe((activeStudyPlanId) => {

        // update stuyplans after active id is available
        from(studyPlans).pipe(
          tap((studyPlan) => {

            if (studyPlan._id === activeStudyPlanId) {

              studyPlan.semesterPlans.forEach(semesterPlan => {

                const semester = new Semester(semesterPlan.semester);
                const isPast = semester.isPastSemester();

                // check if isPastSemester has changed
                if (isPast !== semesterPlan.isPastSemester) {

                  this.store.select(getHintByKey('finishSemester-hint')).pipe(take(1)).subscribe(hint => {
                    if (hint && !hint.hasConfirmed) {
                      this.store.dispatch(SemesterPlanActions.updateShowFinishSemesterHint({ showFinishSemesterHint: true }));
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

  addModuleToPlan(selectedModule: Module, semesterPlanId: string, studyPlanId: string) {
    // check for duplicates within semester plan
    this.planningValidation
      .isModuleInSemesterPlan(selectedModule.acronym, semesterPlanId, studyPlanId)
      .subscribe((isModuleContainedResult) => {
        if (!isModuleContainedResult.alreadyContained) {
          if (semesterPlanId && studyPlanId) {
            this.store.dispatch(
              ModulePlanningActions.addModuleToSemester({
                studyPlanId: studyPlanId,
                semesterPlanId: semesterPlanId,
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

  // for study plan import validation
  checkSemesterPlansStructure(semesterPlan: any[]): boolean {
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
