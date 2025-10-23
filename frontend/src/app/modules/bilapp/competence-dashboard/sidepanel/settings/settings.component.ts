import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { getSemesterList } from 'src/app/selectors/user.selectors';
import { Semester } from '../../../../../../../../interfaces/semester';
import { changeUnit, changeView } from '../../../../compvis/state/chart.actions';
import { getUnit, getView } from '../../../../compvis/state/chart.selectors';
import { MatDialog } from '@angular/material/dialog';
import { AimModalComponent } from 'src/app/modules/aim-modal/aim-modal/aim-modal.component';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';
import { TimetableActions } from 'src/app/actions/study-planning.actions';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent {
  unit$: Observable<string>;
  selectedSemester$: Observable<string>;
  selectedView$: Observable<string>;
  semesters$: Observable<Semester[]>;
  semesterSelection: FormControl;

  selectedSemester: string;

  constructor(private store: Store<State>,
              public dialog: MatDialog
              //private _snackBar: MatSnackBar
            ) { }

  ngOnInit(): void {
    this.selectedView$ = this.store.pipe(select(getView));
    this.semesters$ = this.store.pipe(select(getSemesterList));
    this.selectedSemester$ = this.store.pipe(select(getActiveSemester));
    this.unit$ = this.store.pipe(select(getUnit));
    this.semesterSelection = new FormControl();
    
    this.selectedSemester$.subscribe( semester => {
      this.selectedSemester = semester;
      this.semesterSelection.patchValue(semester)
    });  
  }

  updateUnit(unit: string) {
    this.store.dispatch(changeUnit( { unit } ))
  }

  changeView(view: string) {
    this.store.dispatch(changeView({ view }));
    //this.store.dispatch(new DeselectBar());
  }

  selectSemester() {
    //if (this.selectedSemester !== semester) {
      this.store.dispatch(TimetableActions.updateActiveSemester({ semester: this.selectedSemester }));
      //this.store.dispatch(new DeselectBar());
      /* this._snackBar.open('Neues Semester ausgewählt!', undefined, {
        panelClass: ['alert', 'alert-success']
      }) */
    //}
  }

  openAimDialog() {
    this.dialog.open(AimModalComponent);
  }  
}
