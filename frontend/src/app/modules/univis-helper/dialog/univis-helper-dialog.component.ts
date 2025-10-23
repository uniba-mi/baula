import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BilAppCourseShort } from '../interfaces/bilapp';
import { PublicRestService } from '../public-rest.service';

@Component({
    selector: 'app-dialog',
    templateUrl: './univis-helper-dialog.component.html',
    styleUrls: ['./univis-helper-dialog.component.scss'],
    standalone: false
})
export class UnivISHelperDialogComponent implements OnInit {
  selectedSemester: string;
  selectedCourse = new FormControl('');
  courses$: Observable<BilAppCourseShort[]>;
  filteredCourseNames$: Observable<string[]>;
  courses: BilAppCourseShort[] = [];
  courseNames: string[] = [];
  semesters = [
    { key: 'WS_2019_20', value: 'WS 2019/20' },
    { key: 'SoSe_2020', value: 'SoSe 2020' },
    { key: 'WS_2020_21', value: 'WS 2020/21' },
    { key: 'SoSe_2021', value: 'SoSe 2021' },
    { key: 'WS_2021_22', value: 'WS 2021/22' },
    { key: 'SoSe_2022', value: 'SoSe 2022' },
    { key: 'WS_2022_23', value: 'WS 2022/23' }
  ];

  constructor(private rest: PublicRestService) {}

  ngOnInit(): void { }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.courseNames.filter((name) =>
      name.toLowerCase().includes(filterValue)
    );
  }

  getCourses() {
    if(this.selectedSemester) {
      this.courses$ = this.rest.getBilAppCourses(this.selectedSemester)

      this.courses$.subscribe(courses => {
        this.courseNames = courses.map(el => el.name)
        this.courses = courses;
      })
  
      this.filteredCourseNames$ = this.selectedCourse.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      )
    }
  }

  getCourseId(): string | undefined {
    let course = this.courses.find(el => el.name == this.selectedCourse.value)
    if(course) {
      return course.id
    }
    return;
  } 
}
