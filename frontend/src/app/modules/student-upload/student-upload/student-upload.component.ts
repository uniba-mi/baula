import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { getModuleByAcronym, getModules, getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { Exam, ExamAttempt, PathModule } from '../../../../../../interfaces/study-path'
import { StudyPathActions, UserActions } from 'src/app/actions/user.actions';
import { TransformationService } from 'src/app/shared/services/transformation.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { AlertType } from 'src/app/shared/classes/alert';
import { Consent, User } from '../../../../../../interfaces/user';
import { Observable, Subject, firstValueFrom, map, take, takeUntil, tap } from 'rxjs';
import { getLastConsentByType, getSemesterList } from 'src/app/selectors/user.selectors';
import { ConfirmationDialogData, ConfirmationDialogComponent } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { Module } from '../../../../../../interfaces/module';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { UserGeneratedModuleTemplate } from '../../../../../../interfaces/user-generated-module';
import { Semester } from '../../../../../../interfaces/semester';
import { ModulePlanningActions, UserGeneratedModuleActions } from 'src/app/actions/study-planning.actions';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { getSemesterPlansOfActiveStudyPlan, getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { SemesterPlan } from '../../../../../../interfaces/semester-plan';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';

@Component({
    selector: 'app-student-upload',
    templateUrl: './student-upload.component.html',
    styleUrls: ['./student-upload.component.scss'],
    standalone: false
})
export class StudentUploadComponent {

    @Input() user: User;
    private unsubscribe$ = new Subject<void>();
    modules$: Observable<Module[]>;
    modules: Module[] = [];
    closeMode: string;
    flexnowApiConsent$: Observable<Consent | null>;
    structuredModuleGroups$: Observable<ExtendedModuleGroup[]>
    studyPlans$: Observable<StudyPlan[]>;
    semesters$: Observable<Semester[]>;
    availableSemesters$: Observable<Semester[]>;

    constructor(private store: Store, private transformationService: TransformationService, private dialog: MatDialog, private snackbar: SnackbarService, private flexnowService: FlexnowService) {
        this.flexnowApiConsent$ = this.store.select(getLastConsentByType('flexnow-api'));
        this.structuredModuleGroups$ = this.store.select(getStructuredModuleGroups);
    }

    ngOnInit(): void {
        this.modules$ = this.store.select(getModules);
        this.modules$.pipe(takeUntil(this.unsubscribe$)).subscribe((modules: Module[]) => (this.modules = modules));

        this.semesters$ = this.store.select(getSemesterList)
        this.availableSemesters$ = this.semesters$.pipe(
            map(semesters => semesters.filter(semester => !semester.isFutureSemester()))
        );
    }

    openDeleteStudyPathDialog() {
        const confirmationDialogInterface: ConfirmationDialogData = {
            dialogTitle: 'Gesamte Studienhistorie löschen?',
            actionType: 'delete',
            warningMessage:
                'Die Daten werden unwiederbringlich gelöscht, eine Wiederherstellung ist nicht möglich.',
            confirmationItem:
                'deinen gesamten Studienverlauf mit Belegungen und Noten',
            confirmButtonLabel: 'Löschen',
            cancelButtonLabel: 'Abbrechen',
            confirmButtonClass: 'btn btn-danger',
            callbackMethod: () => {
                this.deleteStudyPath();
            },
        };

        this.dialog.open(ConfirmationDialogComponent, {
            data: confirmationDialogInterface,
        });
    }

    importCompleteFlexNowData() {
        this.flexnowService.triggerFlexNowDataLoading(this.availableSemesters$);
    }

    // triggers dialog to open
    startHTMLUpload() {
        const dialogRef = this.dialog.open(DialogComponent, {
            data: <DialogData>{
                dialogContentId: 'upload-student-data-dialog',
            },
        });

        dialogRef.afterClosed().pipe(take(1)).subscribe(async result => {
            if (result?.file) {
                try {
                    const htmlContent = await this.readFileAsText(result.file);

                    // extract modules 
                    // TODO Empty list since old extraction logic is currently updated
                    let moduleList: any[] = [];

                    if (moduleList.length === 0) {
                        this.snackbar.openSnackBar({
                            type: AlertType.DANGER,
                            message: 'In deiner Datei wurden keine Module gefunden.',
                        });
                        return;
                    }

                    this.saveModulesToStudyPath(moduleList);

                    // update consent for uploading exam data
                    this.store.dispatch(UserActions.addConsent({ ctype: 'upload-exam-data', hasConfirmed: true, hasResponded: true, timestamp: new Date() }));

                } catch (error) {
                    console.error(error);
                    this.snackbar.openSnackBar({
                        type: AlertType.DANGER,
                        message: 'Ein Fehler ist beim Lesen der Datei aufgetreten.',
                    });
                }

            }

        });
    }

    async saveModulesToStudyPath(moduleList: any[]) {

        let validModules: PathModule[] = [];
        let missingModules: PathModule[] = [];
        let saveCurrentSemester: string | undefined;

        for (const item of moduleList) {
            const { acronym, ects, grade, name, mg } = item;
            const formattedEcts = Number(ects);
            const formattedGrade = parseFloat(grade) || 0;

            const { semester, status } = this.findMostRecentSemesterInfo(item.exams);
            const transformedSemester = this.transformationService.transformFlexNowFormat(semester);
            const transformedStatus = this.transformStatus(status);

            const mgId = mg;

            const newModule: PathModule = {
                acronym, name, ects: formattedEcts, grade: formattedGrade || 0,
                mgId: mgId, status: transformedStatus, semester: transformedSemester, // mgId holds name until it is assigned proper mgId
                isUserGenerated: true, flexNowImported: true,
            };

            // add default values for invalid modules
            if (!this.validateModule(newModule)) {
                this.fillDefaultModuleValues(newModule);
                missingModules.push(newModule);
            } else {
                // check if module is in current mhb
                const existingModule = await firstValueFrom(this.store.select(getModuleByAcronym(acronym)).pipe(take(1)));
                // TODO: extend search for existing modules with out of MHB modules, but version needs to be assumed and loader introduced...
                if (existingModule) {
                    newModule.mgId = existingModule.mgId || 'init';
                    validModules.push(newModule);
                } else { // if module is not in the module handbook, it is added to the missing modules to ensure students can fix the details
                    missingModules.push(newModule);
                }
            }
        }

        // additional saving for current modules to insert them into semester plan semester
        const { currentModules, updatedSaveCurrentSemester } = this.processValidModules(validModules);

        if (updatedSaveCurrentSemester) {
            saveCurrentSemester = updatedSaveCurrentSemester;
        }

        if (validModules.length > 0) {
            this.store.dispatch(StudyPathActions.updateStudyPath({ completedModules: validModules }));
        }

        if (currentModules.length > 0 && saveCurrentSemester) {
            // need to also save the current achievements where semester is current semester (Anerkennungen, belegt) into study plans
            this.store.dispatch(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlans({ modules: currentModules, semesterName: saveCurrentSemester }));
        }

        if (missingModules.length > 0) {
            this.openModuleStepperDialog(missingModules);
        }
    }

    fillDefaultModuleValues(module: PathModule) {
        if (!this.validateSemester(module.semester)) {
            module.semester = '';
        }
        if (isNaN(module.ects) || module.ects <= 0) {
            module.ects = 0;
        }
        if (isNaN(module.grade)) {
            module.grade = 0;
        }
    }

    processValidModules(validModules: PathModule[]): { currentModules: UserGeneratedModuleTemplate[], updatedSaveCurrentSemester?: string } {

        let currentModules: UserGeneratedModuleTemplate[] = [];
        let updatedSaveCurrentSemester: string | undefined;

        // for all modules that are valid and in the current semester, save them in currentModules to save them into the study plan
        for (const validModule of validModules) {

            // save current modules in currentModules to update study plans
            const modSemester = new Semester(validModule.semester)

            // cannot use isCurrentSemester because semester time is different than study plan time (user generated)
            if (!modSemester.isPastSemester()) {
                validModule.notes = 'Importiert aus meinem FlexNow-Auszug';
                validModule.flexNowImported = true;
                updatedSaveCurrentSemester = modSemester.name;
                currentModules.push(validModule)
            } else { // special case: TLDR; we need this so "current" modules can be added to the study plan semester in any case
                // LONG: semester is not a current semester according to isPastSemester(), but it is in the study plan because the semester
                // transition was not performed yet by the user (= we upload a flexnow study path with modules in a semester, for which 
                // the semester transition was not done)
                this.store.select(getSemesterPlansOfActiveStudyPlan).pipe(take(1)).subscribe(semesterPlans => {
                    const semesterPlan = semesterPlans!.find(sp => sp.semester === validModule.semester);
                    if (semesterPlan) {
                        if (this.checkForIsPastSemesterMismatches(semesterPlan)) {
                            validModule.notes = 'Importiert aus meinem FlexNow-Auszug';
                            validModule.flexNowImported = true;
                            updatedSaveCurrentSemester = modSemester.name;
                            currentModules.push(validModule);
                        }
                    }
                });
            }
        }
        return { currentModules, updatedSaveCurrentSemester };
    }

    // generates new semester from semesterPlan.semester property and compares with isPastSemester property of plan
    checkForIsPastSemesterMismatches(semesterPlan: SemesterPlan): boolean {
        const semester = new Semester(semesterPlan.semester);
        const isPast = semester.isPastSemester();
        return isPast !== semesterPlan.isPastSemester;
    }

    // validate module
    validateModule(module: PathModule): boolean {
        const { ects, grade, semester } = module;
        const semesterRegex = /^\d{4}(w|s)$/;
        const isValidSemester = !!semester && semesterRegex.test(semester);
        return !isNaN(ects) && ects > 0 && !isNaN(grade) && isValidSemester;
    }

    // validate semester
    validateSemester(semester: string): boolean {
        const semesterRegex = /^\d{4}(w|s)$/;
        return !!semester && semesterRegex.test(semester);
    }

    // if module is not found in current mhb with acronym, stepper with missing modules opens
    openModuleStepperDialog(missingModules: PathModule[]) {

        let saveCurrentSemester: string | undefined;

        const dialogRef = this.dialog.open(DialogComponent, {
            data: {
                dialogTitle: 'Nicht im Modulhandbuch gefundene Module anlegen',
                dialogContentId: 'upload-student-data-stepper',
                missingModules: missingModules,
            },
            disableClose: true,
            maxWidth: '50vw',
        });

        // update modules in study path after closing dialog
        dialogRef.afterClosed().pipe(take(1)).subscribe(updatedModule => {
            if (updatedModule) {
                const updatedModules = missingModules.map(originalModule => {
                    const modData = updatedModule[originalModule.acronym];
                    if (modData) {
                        return {
                            ...originalModule,
                            ...modData,
                            grade: Number(modData.grade),
                            ects: Number(modData.ects),
                            isUserGenerated: true,
                            flexNowImported: true,
                        };
                    }
                    return originalModule;
                }).filter(module => module.isUserGenerated);

                const { currentModules, updatedSaveCurrentSemester } = this.processValidModules(updatedModules);

                if (updatedSaveCurrentSemester) {
                    saveCurrentSemester = updatedSaveCurrentSemester;
                }

                if (updatedModules.length > 0) {
                    this.store.dispatch(StudyPathActions.updateStudyPath({ completedModules: updatedModules }));
                }

                if (currentModules.length > 0 && saveCurrentSemester) {
                    // need to also save the current achievements where semester is current semester (Anerkennungen, belegt) into study plans
                    this.store.dispatch(ModulePlanningActions.addModulesToCurrentSemesterOfAllStudyPlans({ modules: currentModules, semesterName: saveCurrentSemester }));
                }
            }
            this.dialog.closeAll();
        });
    }

    // transform status according to data scheme
    transformStatus(status: string): string {

        const lowercaseStatus = status.toLowerCase();

        // check for "nicht bestanden" before bestanden!
        if (lowercaseStatus.includes("nicht bestanden")) {
            return "failed";
        }
        if (lowercaseStatus.includes("bestanden")) {
            return "passed";
        }
        if (lowercaseStatus.includes("anerkannt")) {
            return "passed";
        }
        if (lowercaseStatus.includes("versäumnis")) {
            return "taken";
        }

        return status;
    }

    // find most recent semester and status from exam attempts
    findMostRecentSemesterInfo(exams: Exam[]): { semester: string, status: string } {
        let mostRecentSemesterInfo: { semester: string, status: string } = { semester: '', status: '' };
        let maxSemesterValue = -1;

        exams.forEach(exam => {
            exam.attempts.forEach(attempt => {
                const semesterValue = this.getSemesterValue(attempt.semester);
                if (semesterValue > maxSemesterValue) {
                    maxSemesterValue = semesterValue;
                    mostRecentSemesterInfo.semester = attempt.semester;
                    mostRecentSemesterInfo.status = attempt.status;
                }
            });
        });

        return mostRecentSemesterInfo;
    }

    // helper to convert semester string ("SS22", "WS22/23") into comparable numeric value
    getSemesterValue(semester: string): number {
        let year = parseInt(semester.slice(2), 10);
        if (semester.startsWith('SS')) {
            return year; // summer semester is year directly
        } else if (semester.startsWith('WS')) {
            return year + 0.5; // winter semester is year + 0.5
        }
        return -1;
    }

    // helper to read in uploaded html file
    async readFileAsText(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = (event: any) => {
                resolve(event.target.result);
            };

            fileReader.onerror = () => {
                reject(new Error('Fehler beim Lesen der Datei.'));
            };

            fileReader.readAsText(file);
        });
    }

    openConsentWithdrawalDialog() {
        const confirmationDialogInterface: ConfirmationDialogData = {
            dialogTitle: 'Einwilligung widerrufen?',
            actionType: 'delete',
            confirmationItem: 'deine Einwilligung',
            confirmButtonLabel: 'Bestätigen',
            cancelButtonLabel: 'Abbrechen',
            confirmButtonClass: 'btn btn-danger',
            callbackMethod: () => {
                this.deleteStudyPath();
            },
        };
        this.dialog.open(ConfirmationDialogComponent, {
            data: confirmationDialogInterface,
        });
    }

    deleteStudyPath() {
        this.store.dispatch(StudyPathActions.deleteStudyPath());

        // remove modules flagged with flexNowImported from all study plans
        this.store.select(getStudyPlans).pipe(
            take(1),
            tap(studyPlans => {
                studyPlans.forEach(studyPlan => {
                    studyPlan.semesterPlans.forEach(semesterPlan => {
                        const modulesToDelete = semesterPlan.userGeneratedModules
                            .filter(module => module.flexNowImported)
                            .map(module => module._id);

                        if (modulesToDelete.length > 0) {
                            this.store.dispatch(
                                UserGeneratedModuleActions.deleteUserGeneratedModules({
                                    studyPlanId: studyPlan._id,
                                    semesterPlanId: semesterPlan._id,
                                    moduleIds: modulesToDelete,
                                })
                            );
                        }
                    });
                });
            })
        ).subscribe();

        this.store.dispatch(UserActions.addConsent({ ctype: 'flexnow-api', hasConfirmed: false, hasResponded: true, timestamp: new Date() }))
        this.dialog.closeAll();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}