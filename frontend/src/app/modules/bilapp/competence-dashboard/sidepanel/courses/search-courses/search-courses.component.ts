import { Component, Input, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { PlanCourse } from '../../../../../../../../../interfaces/semester-plan';
import { Course } from '../../../../../../../../../interfaces/course';
import { getPlanCourses } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-search-courses',
    templateUrl: './search-courses.component.html',
    styleUrls: ['./search-courses.component.scss'],
    standalone: false
})
export class SearchCoursesComponent {
  @Input() courses: Course[] | null;
  searchResult: Course[];
  searchTerm: string = '';
  selectedCourses$: Observable<PlanCourse[]>;

  searchTermControl = new FormControl();
  filters = new FormControl();

  filterList: string[] = ['Titel', 'Beschreibung', 'Typ', 'Modulnummer'];
  constructor(private store: Store<State>) { }

  ngOnInit(): void {
    this.filters.setValue(['Titel'])
    this.selectedCourses$ = this.store.pipe(select(getPlanCourses));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.courses && this.searchTerm !== '') {
      this.searchCourses();
    }
  }

  searchCourses(event?: KeyboardEvent) {
    if((!event || event.key == 'Enter') && this.courses) {
      let newCourselist = this.courses.filter( (course) => {
        for(const filter of this.filters.value) {
          switch(filter) {
            case 'Titel': 
              if(course.name.includes(this.searchTerm)) {
                return true;
              }
              break;
            case 'Beschreibung':
              if(course.desc && course.desc.includes(this.searchTerm)) {
                return true;
              }
              break;
            case 'Typ':
              if(course.type.includes(this.searchTerm)) {
                return true;
              }
              break;
            case 'Modulnummer':
              if(course.organizational && course.organizational.includes(this.searchTerm)) {
                return true;
              }
              break;
            default: 
              return false;
          }
        }
        return false;
      })
      this.searchResult = newCourselist;
    }
  }
}
