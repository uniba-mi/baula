import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { getUserAims } from 'src/app/selectors/user.selectors';
import { loadCourses, loadSelectedCourses } from '../state/actions/course.actions';
import { loadStandard } from '../state/actions/standard.actions';
import { CompAim } from '../../../../../../interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { WelcomeDialogComponent } from '../dialogs/welcome-dialog/welcome-dialog.component';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-competence-dashboard',
    templateUrl: './competence-dashboard.component.html',
    styleUrls: ['./competence-dashboard.component.scss'],
    standalone: false
})
export class CompetenceDashboardComponent implements OnInit {
  aims$: Observable<CompAim[] | undefined>;

  constructor(private store: Store<State>, public dialog: MatDialog) { }

  ngOnInit(): void {
    // init load of standards
    this.store.dispatch(loadStandard());
    // Todo: Add here addional data loads that needs to be triggered at module load
    this.store.pipe(select(getActiveSemester)).subscribe(semester => {
      if(semester) {
        this.store.dispatch(loadCourses({ semester }));
      }
    })


    window.scroll({
      top: 0
    })

    // load savedCourses
    this.store.dispatch(loadSelectedCourses());

    // load aims, to see, if user needs to set aims first
    this.aims$ = this.store.select(getUserAims)
    this.aims$.subscribe(aims => {
      if(!aims) {
        // no aims exist -> open welcome form
        this.dialog.open(WelcomeDialogComponent);
      }
    })
    
  }
}
