import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { Module } from '../../../../../../interfaces/module';
import { Studyplan } from '../../../../../../interfaces/studyplan';
import { Observable } from 'rxjs';
import { getStudyplans } from 'src/app/selectors/study-planning.selectors';
import { Studypath } from '../../../../../../interfaces/studypath';
import { getUserStudypath } from 'src/app/selectors/user.selectors';
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
  @Input() openedFromModuleCatalog: boolean;
  @Input() modType: string = 'notPath';

  studyplans$: Observable<Studyplan[]>;
  studypath$: Observable<Studypath>;

  history = [ // mocking this for now
    { semester: 'SoSe 2025', attempt: 2, grade: '', note: 'Ausstehend' },
    { semester: 'WiSe 2024/25', attempt: 1, grade: '5,0', note: 'Anerkannt am XY' },
  ];

  constructor(
    private store: Store<State>,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.studyplans$ = this.store.select(getStudyplans);
    this.studypath$ = this.store.select(getUserStudypath);
  }

  hasModuleInPlan(studyplan: Studyplan): boolean {
    return studyplan.semesterPlans?.some(sp =>
      sp.modules?.includes(this.selectedModule.acronym) &&
      !new Semester(sp.semester).isPastSemester()
    ) || false;
  }

  getModuleSemesterPlans(studyplan: Studyplan) {
    if (!studyplan.semesterPlans) return [];

    return studyplan.semesterPlans.filter(semesterPlan =>
      semesterPlan.modules?.includes(this.selectedModule.acronym) &&
      !new Semester(semesterPlan.semester).isPastSemester()
    );
  }

  openDeleteDialog(studyplanId: string, studyplanName: string, semesterplanId: string, semester: string) {


    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: `Modul wirklich aus dem Studienplan "${studyplanName}" löschen?`,
      actionType: 'delete',
      confirmationItem: this.selectedModule.name,
      confirmButtonLabel: 'Löschen',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.store.dispatch(
          ModulePlanningActions.deleteModuleFromSemesterplan({
            studyplanId,
            semesterplanId,
            semesterplanSemester: semester,
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
