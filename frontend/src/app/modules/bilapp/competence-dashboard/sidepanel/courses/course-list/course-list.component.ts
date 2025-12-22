import { Component, Input, OnInit} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CourseList } from 'src/app/modules/bilapp/interfaces/course-list';
import { State } from 'src/app/reducers';
import { PlanCourse } from '../../../../../../../../../interfaces/semester-plan';
import { getPlanCourses } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-course-list',
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
    standalone: false
})
export class CourseListComponent implements OnInit{
  @Input() structure: CourseList[];
  selectedCourses$: Observable<PlanCourse[]>;

  constructor(private store: Store<State>) { }

  ngOnInit(): void {
    this.selectedCourses$ = this.store.pipe(select(getPlanCourses));
  }
}
