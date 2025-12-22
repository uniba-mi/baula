import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { Module } from '../../../../../../interfaces/module';
import { StudyPlan } from '../../../../../../interfaces/study-plan';
import { Observable } from 'rxjs';
import { getStudyPlans } from 'src/app/selectors/study-planning.selectors';
import { StudyPath } from '../../../../../../interfaces/study-path';
import { getUserStudyPath } from 'src/app/selectors/user.selectors';
import { Semester } from '../../../../../../interfaces/semester';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.component';
import { ModulePlanningActions } from 'src/app/actions/study-planning.actions';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-status',
  standalone: false,
  templateUrl: './manage-status.component.html',
  styleUrl: './manage-status.component.scss'
})
export class ManageStatusComponent {

  @Input() selectedModule: Module;
  @Input() openedWithSemesterSet: boolean = true;
  @Input() openedFromModuleOffer: boolean;
  @Input() modType: string = 'notPath';

  studyPlans$: Observable<StudyPlan[]>;
  studyPath$: Observable<StudyPath>;

  history = [ // mocking this for now
    { semester: 'SoSe 2025', attempt: 2, grade: '', note: 'Ausstehend' },
    { semester: 'WiSe 2024/25', attempt: 1, grade: '5,0', note: 'Anerkannt am XY' },
  ];

  constructor(
    private store: Store<State>,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.studyPlans$ = this.store.select(getStudyPlans);
    this.studyPath$ = this.store.select(getUserStudyPath);
  }

  hasModuleInPlan(studyPlan: StudyPlan): boolean {
    return studyPlan.semesterPlans?.some(sp =>
      sp.modules?.includes(this.selectedModule.acronym) &&
      !new Semester(sp.semester).isPastSemester()
    ) || false;
  }

  getModuleSemesterPlans(studyPlan: StudyPlan) {
    if (!studyPlan.semesterPlans) return [];

    return studyPlan.semesterPlans.filter(semesterPlan =>
      semesterPlan.modules?.includes(this.selectedModule.acronym) &&
      !new Semester(semesterPlan.semester).isPastSemester()
    );
  }

  openDeleteDialog(studyPlanId: string, studyPlanName: string, semesterPlanId: string, semester: string) {

    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: `Modul wirklich aus dem Studienplan "${studyPlanName}" löschen?`,
      actionType: 'delete',
      confirmationItem: this.selectedModule.name,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.store.dispatch(
          ModulePlanningActions.deleteModuleFromSemesterPlan({
            studyPlanId,
            semesterPlanId,
            semesterPlanSemester: semester,
            acronym: this.selectedModule.acronym,
            ects: this.selectedModule.ects,
          })
        );
        this.dialog.closeAll(); // TODO closes also module details!
      },
    };
    this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });
  }
}
