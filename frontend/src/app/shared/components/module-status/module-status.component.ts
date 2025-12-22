import { Component, Input, OnInit } from '@angular/core';
import { Module } from '../../../../../../interfaces/module';
import { Store } from '@ngrx/store';
import { PathModule, StudyPath } from '../../../../../../interfaces/study-path';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { getCloseDialogMode } from 'src/app/selectors/dialog.selectors';
import { Status, User } from '../../../../../../interfaces/user';
import { Observable, Subject } from 'rxjs';
import { Semester } from '../../../../../../interfaces/semester';
import { getUser } from 'src/app/selectors/user.selectors';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { take, takeUntil } from 'rxjs/operators';
import { StudyPathActions } from 'src/app/actions/user.actions';
import { UserGeneratedModule } from '../../../../../../interfaces/user-generated-module';
import { ModService } from '../../services/module.service';

@Component({
    selector: 'app-module-status',
    templateUrl: './module-status.component.html',
    styleUrls: ['./module-status.component.scss'],
    standalone: false
})
export class ModuleStatusComponent implements OnInit {
  @Input() studyPath$: Observable<StudyPath>;
  @Input() modType: string;
  @Input() openedFromModuleOffer: boolean = false;
  @Input() module: Module;
  @Input() userGeneratedModule: UserGeneratedModule;
  @Input() pathModule: PathModule;
  @Input() statusSemester: string | undefined;
  @Input() openedWithSemesterSet: boolean; // true for opening from study plan
  status: string | undefined;
  grade: number | undefined;
  activePlan$: Observable<StudyPlan | undefined>;
  closeMode: string;
  user: User;
  mgId: string;
  displayStatusOnHover: string = '';
  private destroy$ = new Subject<void>();
  statusOptions: Status[] = [
    { status: 'passed', name: 'Bestanden', iconClass: 'bi bi-check-lg text-success' },
    { status: 'taken', name: 'Belegt', iconClass: 'bi bi-dash-lg' },
    { status: 'failed', name: 'Nicht bestanden', iconClass: 'bi bi-x-lg text-danger' },
    { status: 'open', name: 'Nicht belegt', iconClass: 'bi bi-question-lg' },
  ];

  constructor(private store: Store, private dialog: MatDialog, private modService: ModService) { }

  ngOnInit(): void {
    this.store.select(getUser).pipe(take(1)).subscribe((user) => this.user = user)

    this.studyPath$.pipe(takeUntil(this.destroy$)).subscribe((studyPath) => {
      this.updateModuleDataFromStudyPath(studyPath);
    });

    this.updateDisplayStatusOnHover();
  }

  private updateModuleDataFromStudyPath(studyPath: StudyPath): void {
    const moduleToCheck = this.pathModule || this.module || this.userGeneratedModule;
    if (moduleToCheck) {
      this.statusSemester = this.checkSemesterForModule(studyPath, moduleToCheck, this.statusSemester);
      this.status = this.checkStatusForModule(studyPath, moduleToCheck, this.statusSemester);
      this.grade = this.checkGradeForModule(studyPath, moduleToCheck, this.statusSemester);
      this.updateDisplayStatusOnHover();
    }
  }

  // get module's unique identifier (_id)
  getModuleId(module: PathModule | UserGeneratedModule | Module, spath: StudyPath, semester: string | undefined): string | undefined {
    // identify type between UserGeneratedModules | Module | PathModule
    const moduleType = module === this.userGeneratedModule
      ? 'UserGeneratedModule'
      : module === this.pathModule
        ? 'PathModule'
        : module === this.module
          ? 'Module'
          : 'Unknown Type';

    if (moduleType === 'UserGeneratedModule' || moduleType === 'PathModule') {
      return module._id!
    } else if (moduleType === 'Module') {
      const matchingModule = this.findCorrespondingModuleInStudyPath(spath, module.acronym, semester);

      return matchingModule ? matchingModule._id : undefined;
    }
    return undefined;
  }

  // get current values from store
  private checkStatusForModule(spath: StudyPath, module: Module | PathModule | UserGeneratedModule, semester: string | undefined): string | undefined {
    const moduleId = this.getModuleId(module, spath, semester);
    if (moduleId) {
      const matchingModule = semester
        ? spath.completedModules.find(mod => mod._id === moduleId && mod.semester === semester)
        : this.findCorrespondingModuleInStudyPath(spath, moduleId, semester);
      return matchingModule?.status || 'open';
    }
    return;
  }

  private checkSemesterForModule(spath: StudyPath, module: Module | PathModule | UserGeneratedModule, semester: string | undefined): string | undefined {
    const moduleId = this.getModuleId(module, spath, semester);
    if (semester) {
      return semester;
    } else {
      // Otherwise, find the corresponding module in the study path
      const matchingModule = semester
        ? spath.completedModules.find(mod => mod._id === moduleId && mod.semester === semester)
        : this.findCorrespondingModuleInStudyPath(spath, module.acronym, semester);
      return matchingModule?.semester || undefined;
    }
  }

  private checkGradeForModule(spath: StudyPath, module: PathModule, semester: string | undefined): number | undefined {
    const moduleId = this.getModuleId(module, spath, semester);
    const matchingModule = semester
      ? spath.completedModules.find(mod => mod._id === moduleId && mod.semester === semester)
      : this.findCorrespondingModuleInStudyPath(spath, module.acronym, semester);
    return matchingModule?.grade || undefined
  }

  private findCorrespondingModuleInStudyPath(
    spath: StudyPath,
    acronym: string,
    semester: string | undefined
  ): PathModule | undefined {

    // check for modules with the same acronym in the study path
    const filteredModules = spath.completedModules.filter(mod => mod.acronym === acronym);

    // if a semester is given (= study plan semester), check if one of the matching modules is in the same semester
    if (this.openedWithSemesterSet) {
      return filteredModules.find(mod => mod.semester === semester);
    }

    // else (= module catalog), use the most recent occurence of the acronym in the study path
    return filteredModules.sort((a, b) => b.semester.localeCompare(a.semester))[0];
  }

  // get full name for status display on hover
  getStatusName(status: string | undefined): string {
    const statusObj = this.statusOptions.find(option => option.status === status);
    return statusObj ? statusObj.name : 'Nicht belegt';
  }

  // update tooltip on hover
  updateDisplayStatusOnHover(): void {
    const statusName = this.getStatusName(this.status);
    const isOpen = this.status === undefined || this.status === 'open';
    let semesterShortName = '';

    if (!isOpen && this.statusSemester) {
      const semester = new Semester(this.statusSemester);
      semesterShortName = semester.shortName;
    }
    this.displayStatusOnHover = `${statusName}${!isOpen ? ` (${semesterShortName})` : ''}`;
  }

  openChangeStatusDialog(event: any, modType: string) {

    event.stopPropagation();

    // dialog cannot be opened from module catalog and rec sidenav
    if (this.openedFromModuleOffer) {
      return;
    }

    // set status to open if it is undefined
    if (!this.status) {
      this.status = 'open';
    }

    // filter status options based on modType, open not needed in spath semesters due to delete
    let dialogStatusOptions = this.statusOptions;
    if (modType === 'path') {
      dialogStatusOptions = this.statusOptions.filter(option =>
        option.status === 'passed' || option.status === 'failed' || option.status === 'taken');
    }

    // pass different data to dialog (module, pathmodule, userGeneratedModule)
    const moduleData = modType === 'path'
      ? this.pathModule
      : this.userGeneratedModule
        ? this.userGeneratedModule
        : this.module;


    this.studyPath$.pipe(take(1)).subscribe((studyPath) => {
      const moduleId = this.getModuleId(moduleData, studyPath, this.statusSemester);

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          dialogTitle: 'Modulstatus ändern',
          dialogContentId: 'change-status-dialog',
          statusOptions: dialogStatusOptions,
          status: this.status,
          statusSemester: this.statusSemester,
          grade: this.grade,
          moduleData
        },
      });

      dialogRef.afterClosed().subscribe((result) => {

        if (result) {
          this.store
            .select(getCloseDialogMode)
            .subscribe((mode) => (this.closeMode = mode));

          if (this.closeMode === 'data') {

            const { status, semester, grade } = result;

            // declare data
            let moduleVersion, moduleAcronym: string, moduleMgId, moduleName, moduleEcts: number, isUserGenerated, flexNowImported;

            if (modType === 'path') {
              moduleAcronym = this.pathModule.acronym;
              moduleName = this.pathModule.name;
              moduleEcts = this.pathModule.ects;
              moduleMgId = 'init'; // set mgId to init to prevent false value due to preselect of one mgId instead of selection out of all possible mgIds
              isUserGenerated = this.pathModule.isUserGenerated;
              flexNowImported = this.pathModule.flexNowImported;
            } else if (this.userGeneratedModule) {
              moduleAcronym = this.userGeneratedModule.acronym ? this.userGeneratedModule.acronym : this.userGeneratedModule.name;
              //moduleMgId = this.userGeneratedModule.mgId !== undefined ? this.userGeneratedModule.mgId : 'init';
              moduleMgId = 'init'; // set mgId to init to prevent false value due to preselect of one mgId instead of selection out of all possible mgIds
              moduleName =  this.userGeneratedModule.name || this.userGeneratedModule.notes || '-';
              moduleEcts = this.userGeneratedModule.ects;
              isUserGenerated = true;
              flexNowImported = this.userGeneratedModule.flexNowImported;
            } else { // non user generated module
              moduleVersion = this.module.version;
              moduleAcronym = this.module.acronym;
              moduleMgId = 'init'; // set mgId to undefined to prevent false value due to preselect of one mgId instead of selection out of all possible mgIds
              moduleName = this.module.name;
              moduleEcts = this.module.ects;
              isUserGenerated = false;
              flexNowImported = false;
            }

            // if dialog returns semester (= when opened in module overview), use it, else use this semester
            const semesterString: string = result.semester ? result.semester : this.statusSemester;

            // After the dialog, update module status and semester
            const updatedModule = {
              _id: moduleId,
              acronym: moduleAcronym,
              name: moduleName,
              ects: moduleEcts,
              status: status,
              semester: semester,
              grade: Number(grade),
              mgId: moduleMgId,
              // exams: [],
              isUserGenerated: isUserGenerated,
              flexNowImported: flexNowImported,
            };

            // if status is set to open, delete module from study path
            if (moduleId && semesterString && status === 'open') {
              this.store.dispatch(StudyPathActions.deleteModuleFromStudyPath({ id: moduleId, semester: semesterString }));
            } else {
              // we do not use updateModuleInStudyPath here because we do not only edit a specific module in the study path, but need a semester-dependent update
              const updatedCompletedModules = [updatedModule]
              // for other cases update module in study path

              this.store.dispatch(
                StudyPathActions.updateStudyPath({
                  completedModules: updatedCompletedModules
                })
              );
            }
          }
        } else {
          return;
        }
      });
    });
  }

  isCurrentSemester(semester: string): Boolean {
    const semesterInstance = new Semester(semester);
    return semesterInstance.isCurrentSemester();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
