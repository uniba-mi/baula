import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CourseList } from 'src/app/modules/bilapp/interfaces/course-list';
import { State } from 'src/app/reducers';
import { Course } from '../../../../../../../../../interfaces/course';

interface ShortModule {
  id: string,
  name: string,
}

@Component({
    selector: 'app-all-courses',
    templateUrl: './all-courses.component.html',
    styleUrls: ['./all-courses.component.scss'],
    standalone: false
})
export class AllCoursesComponent implements OnInit, OnChanges {
  @Input() courses: Course[] | null;

  // variables for statemanagement
  courses$: Observable<Course[]>;
  selectedSemester$: Observable<string>;

  selectedSemester: string;
  semester: Observable<string>;
  structure: CourseList[];

  //hard coded modules
  modules: ShortModule[] = [
    { 
      id: 'LAMOD-01-01',
      name: 'Allgemeine Pädagogik'
    },
    { 
      id: 'LAMOD-01-04',
      name: 'Psychologie'
    },
    { 
      id: 'LAMOD-01-07-008',
      name: 'Schulpädagogik'
    },
    { 
      id: 'LAMOD-01-10',
      name: 'Interdisziplinäre Erziehungswissenschaften'
    },
    {
      id: 'LAMOD-01-07-004a',
      name: 'Pädagogisch-didaktisches Schulpraktikum'
    }
  ]

  constructor(private store: Store<State>) { }

  ngOnInit() {
    // Load values from Store
    //this.selectedSemester$ = this.store.pipe(select(getSemester));

    // subscribe to current values
    /* this.selectedSemester$.subscribe(semester => {
      this.selectedSemester = semester;
      if (semester !== '') {
        this.store.dispatch(new LoadCourses({
          semester
        }));
      }
    }); */

    if(this.courses) this.buildStructure();

    //this.store.dispatch(new LoadSemesters());
  }

  ngOnChanges(): void {
    if(this.courses) this.buildStructure();
  }

  buildStructure() {
    this.structure= []
    if(this.courses){
      for(let module of this.modules) {
        let subModule = new CourseList(module.id, module.name);
  
        // find courses that can be assigned to this module
        let moduleCourses = this.courses.filter( course => course.mCourses && course.mCourses.length !== 0 && course.mCourses.find(mc => mc.modCourse.mcId.startsWith(module.id)) && course.competence && course.competence.length !== 0);
        subModule.courses = moduleCourses;
        this.structure.push(subModule)
      }
    }
  }

}
