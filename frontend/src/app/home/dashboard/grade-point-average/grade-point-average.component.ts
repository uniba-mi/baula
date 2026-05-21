import { Component, Input, OnInit } from '@angular/core';
import { PathModule, StudyPath } from '../../../../../../interfaces/study-path';
import { Semester } from '../../../../../../interfaces/semester';

@Component({
    selector: 'app-grade-point-average',
    templateUrl: './grade-point-average.component.html',
    styleUrl: './grade-point-average.component.scss',
    standalone: false
})
export class GradePointAverageComponent implements OnInit {
  @Input() studyPath: StudyPath;
  @Input() semesters: Semester[] | null;
  currentGrade: number;


  ngOnInit(): void {
    if(this.studyPath.completedModules.length !== 0) {
      this.currentGrade = this.calculateGrade(this.studyPath.completedModules);
    }
  }

  calculateGrade(modules: PathModule[]): number {
    // limit modules for calculation to modules of selected studyprogramme
    modules = modules.filter(mod => this.semesters?.map(el => el.name).includes(mod.semester))
    // variable for summed product between grade and ects
    let summedGradeProduct = 0;
    let summedECTS = 0;
    for(let module of modules) {
      if(module.grade < 5 && module.grade > 0) {
        summedGradeProduct += module.grade * module.ects;
        summedECTS += module.ects;
      }
    }
    return Math.round((summedGradeProduct / summedECTS) * 10)/10;
  }
}
