import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModulePlanningActions, UserGeneratedModuleActions } from 'src/app/actions/study-planning.actions';
import { PlanningValidationService } from 'src/app/shared/services/planning-validation.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { getModuleByAcronym } from 'src/app/selectors/module-overview.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StudyplanService } from './studyplan.service';
import { UserGeneratedModule } from '../../../../../interfaces/usergeneratedmodule';
import { Module } from '../../../../../interfaces/module';

@Injectable({
    providedIn: 'root'
})
export class DragDropService {
    private destroy$ = new Subject<void>();

    constructor(
        private store: Store,
        private planningValidation: PlanningValidationService,
        private snackbar: SnackbarService,
        private studyplanService: StudyplanService
    ) { }

    private isUserGeneratedModule(item: Module | UserGeneratedModule): item is UserGeneratedModule {
        return !('mCourses' in item);
    }

    private isModule(item: Module | UserGeneratedModule): item is Module {
        return 'mCourses' in item;
    }

    handleDrop(
        item: Module | UserGeneratedModule,
        sourceContainerId: string,
        sourceSemester: string,
        targetContainerId: string,
        targetSemester: string,
        studyplanId: string,
        isTargetPastSemester: boolean
    ) {

        // error if target is past semester
        if (isTargetPastSemester) {
            this.snackbar.openSnackBar({
                type: AlertType.DANGER,
                message: 'Module können nicht in vergangene Semester verschoben werden.'
            });
            return;
        }

        if (this.isUserGeneratedModule(item)) { // user generated module
            this.updateUserGeneratedModuleSemester(
                item,
                sourceContainerId,
                sourceSemester,
                targetContainerId,
                targetSemester,
                studyplanId
            );
        } else if (this.isModule(item)) { // normal module (can be from sidenav or semester)
            this.updateModuleSemester(
                item.acronym,
                sourceContainerId,
                sourceSemester,
                targetContainerId,
                targetSemester,
                studyplanId
            );
        }
    }

    updateModuleSemester(
        acronym: string,
        originalSemesterPlanId: string,
        originalSemesterPlanSemester: string,
        newSemesterPlanId: string,
        newSemesterPlanSemester: string,
        studyplanId: string
    ) {

        this.store
            .select(getModuleByAcronym(acronym))
            .pipe(takeUntil(this.destroy$))
            .subscribe((module) => {
                if (module) {
                    // check if module is already in the new semester
                    this.planningValidation
                        .isModuleInSemesterplan(
                            acronym,
                            newSemesterPlanId,
                            studyplanId
                        )
                        .pipe(takeUntil(this.destroy$))
                        .subscribe((isModuleContainedResult) => {
                            if (!isModuleContainedResult.alreadyContained) {
                                if (originalSemesterPlanId !== 'sidenav-drop-list') {
                                    // remove module from old semester
                                    this.store.dispatch(
                                        ModulePlanningActions.transferModule({
                                            studyplanId: studyplanId,
                                            oldSemesterplanId: originalSemesterPlanId,
                                            oldSemesterplanSemester: originalSemesterPlanSemester,
                                            newSemesterplanId: newSemesterPlanId,
                                            newSemesterplanSemester: newSemesterPlanSemester,
                                            acronym: module.acronym,
                                            ects: module.ects,
                                        })
                                    );
                                } else {
                                    // add module to new semester from sidenav
                                    this.studyplanService.addModuleToPlan(
                                        module,
                                        newSemesterPlanId,
                                        studyplanId
                                    );
                                }

                                // warning if module is not offered in target semester
                                const moduleOfferedResult = this.planningValidation.isModuleOffered(
                                    module,
                                    newSemesterPlanSemester
                                );
                                if (!moduleOfferedResult.success) {
                                    setTimeout(() => {
                                        this.snackbar.openSnackBar({
                                            type: AlertType.WARNING,
                                            message: moduleOfferedResult.message,
                                        });
                                    }, 1000); // show warning 1 second after success
                                    // TODO: in the future use a dialog to confirm these cases 
                                }
                            } else {
                                this.snackbar.openSnackBar({
                                    type: AlertType.DANGER,
                                    message: isModuleContainedResult.message,
                                });
                            }
                        });
                }
            });
    }

    updateUserGeneratedModuleSemester(
        module: UserGeneratedModule,
        originalSemesterPlanId: string,
        originalSemesterPlanSemester: string,
        newSemesterPlanId: string,
        newSemesterPlanSemester: string,
        studyplanId: string
    ) {
        this.store.dispatch(
            UserGeneratedModuleActions.transferUserGeneratedModule({
                studyplanId: studyplanId,
                oldSemesterplanId: originalSemesterPlanId,
                oldSemesterplanSemester: originalSemesterPlanSemester,
                newSemesterplanId: newSemesterPlanId,
                newSemesterplanSemester: newSemesterPlanSemester,
                module: module,
            })
        );
    }

    destroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}