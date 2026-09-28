import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { Course } from '../../../../../../../../interfaces/course';
import { Standard } from '../../../interfaces/standard';
import { getCourses } from '../../../state/selectors/course.selectors';
import { getSelectedStandard } from '../../../state/selectors/standard.selectors';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CoursesComponent {
  private store = inject<Store<State>>(Store);

  selectedStandard$: Observable<Standard | undefined>;
  courses$: Observable<Course[]>;

  ngOnInit(): void {
    this.selectedStandard$ = this.store.pipe(select(getSelectedStandard));
    this.courses$ = this.store.pipe(select(getCourses));
  }
}
