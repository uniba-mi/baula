import { Component, Input } from '@angular/core';
import { StudyplanTemplate } from '../../../../../interfaces/studyplan';
import { SemesterStudyPath } from '../../../../../interfaces/studypath';
import { SemesterplanTemplate } from '../../../../../interfaces/semesterplan';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
    standalone: false
})
export class ExportDialogComponent {
  @Input() studyplan: StudyplanTemplate;
  @Input() studypath: SemesterStudyPath[];
  exportFormat: string;

  transformStudyplan(): any {
    let exportPlan: SemesterplanTemplate[] = []
    // transform studypath modules and add paths to export array
    if(this.exportFormat === 'studypathWithFutureSemester') {
      let pathPlans: SemesterplanTemplate[] = []
      for(let path of this.studypath) {
        const modules = path.modules.map(el => el.acronym)
        pathPlans.push({
          ...path,
          modules,
          userGeneratedModules: [],
        });
      };
      exportPlan = pathPlans;
    }
    
    // select studyplans for export
    const semesterPlans = this.studyplan.semesterPlans.filter(plan => {
      return plan.isPastSemester ? undefined : plan;
    }).map((el) => {
      return {
        modules: el.modules,
        userGeneratedModules: el.userGeneratedModules,
        courses: el.courses,
        semester: el.semester,
        isPastSemester: false,
        aimedEcts: el.aimedEcts,
        summedEcts: el.summedEcts,
        expanded: el.expanded
      };
    });
    // remove db information and userId from studyplan
    return {
      ...this.studyplan,
      __v: undefined,
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      userId: undefined,
      semesterPlans: exportPlan.concat(semesterPlans),
    };
  }
}
