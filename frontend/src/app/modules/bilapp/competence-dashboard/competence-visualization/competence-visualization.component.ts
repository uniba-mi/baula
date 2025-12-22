import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { getView } from 'src/app/modules/compvis/state/chart.selectors';
import { State } from 'src/app/reducers';
import { Competence } from '../../../../../../../interfaces/competence';
import { ExpandedCourse } from '../../../../../../../interfaces/course';
import { User } from '../../../../../../../interfaces/user';
import { BilappRestService } from '../../bilapp-rest.service';
import { Standard } from '../../interfaces/standard';
import { getAllSelectedCourses, getSelectedCourses } from '../../state/selectors/course.selectors';
import { getCompetences, getSelectedStandard } from '../../state/selectors/standard.selectors';
import { getPlanCourses } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-competence-visualization',
    templateUrl: './competence-visualization.component.html',
    styleUrls: ['./competence-visualization.component.scss'],
    standalone: false
})
export class CompetenceVisualizationComponent implements OnInit {
  // variables for statemanagement
  selectedStandard$: Observable<Standard | undefined>;
  competences$: Observable<Competence[]>;
  courses$: Observable<ExpandedCourse[]>;
  view$: Observable<string>;
  user$: Observable<User>;

  constructor(private store: Store<State>, private rest: BilappRestService) { }

  ngOnInit() {
    // load values from Store
    this.selectedStandard$ = this.store.pipe(select(getSelectedStandard));
    this.competences$ = this.store.pipe(select(getCompetences));
    this.view$ = this.store.pipe(select(getView));   

    this.view$.subscribe(view => {
      if(view == 'studium') {
        this.courses$ = this.store.pipe(select(getAllSelectedCourses));
      } else {
        this.courses$ = this.store.pipe(select(getPlanCourses)).pipe(
          mergeMap(courses => {
            return this.store.pipe(select(getSelectedCourses(courses)));
          })           
        )
      }
    })
  }
}
