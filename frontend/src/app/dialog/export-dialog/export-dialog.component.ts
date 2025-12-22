import { Component, Input } from '@angular/core';
import { StudyPlanTemplate } from '../../../../../interfaces/study-plan';
import { SemesterStudyPath } from '../../../../../interfaces/study-path';
import { SemesterPlanTemplate } from '../../../../../interfaces/semester-plan';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
    standalone: false
})
export class ExportDialogComponent {
  @Input() studyPlan: StudyPlanTemplate;
  @Input() studyPath: SemesterStudyPath[];
  exportFormat: string;

  transformStudyPlan(): any {
    let exportPlan: SemesterPlanTemplate[] = []
    // transform study path modules and add paths to export array
    if(this.exportFormat === 'studyPathWithFutureSemester') {
      let pathPlans: SemesterPlanTemplate[] = []
      for(let path of this.studyPath) {
        const modules = path.modules.map(el => el.acronym)
        pathPlans.push({
          ...path,
          modules,
          userGeneratedModules: [],
        });
      };
      exportPlan = pathPlans;
    }
    
    // select study plans for export
    const semesterPlans = this.studyPlan.semesterPlans.filter(plan => {
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
    // remove db information and userId from study plan
    return {
      ...this.studyPlan,
      __v: undefined,
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      userId: undefined,
      semesterPlans: exportPlan.concat(semesterPlans),
    };
  }
}
