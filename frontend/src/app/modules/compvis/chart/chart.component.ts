import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { State } from 'src/app/reducers';
import { Competence } from '../../../../../../interfaces/competence';
import { ExpandedCourse } from '../../../../../../interfaces/course';
import { Bar } from '../interfaces/chart';
import { getBars, getSelectedBar } from '../state/chart.selectors';

@Component({
    selector: 'compvis-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    standalone: false
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() selectedCourses: ExpandedCourse[];
  @Input() competences: Competence[];
  upperCompetences: Competence[];
  lowerCompetences: Competence[];
  bars$: Observable<Bar[]> = this.store.pipe(select(getBars));
  selectedBar$: Observable<Bar | undefined> = this.store.pipe(select(getSelectedBar), delay(0));
  

  constructor(private store: Store<State>) {}

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.selectedCourses || changes.competences) {
      this.updateCompetences();
    }
  }

  updateCompetences() {
    if(this.competences) {
      this.upperCompetences = this.competences.filter(comp => !comp.parentId);
      this.lowerCompetences = this.competences.filter(comp => comp.parentId);
    }
  }
}

