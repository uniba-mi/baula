import { Component, Input, OnChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SemesterStudyPath, StudyPath } from '@interfaces/study-path';
import { Semester } from '@interfaces/semester';
import { StudyPlan } from '@interfaces/study-plan';
import { BarChartCardData } from 'src/app/modules/reporting/reporting';

@Component({
    selector: 'app-total-ects-progress-chart',
    templateUrl: './total-ects-progress-chart.component.html',
    styleUrls: ['./total-ects-progress-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TotalEctsProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: SemesterStudyPath[];
  @Input() studyPlan: StudyPlan | undefined | null;
  @Input() semesters: Semester[];
  @Input() aimedEcts: number | undefined;

  public cardData: BarChartCardData;

  constructor() { }

  ngOnInit(): void {
    this.calculateDataForCharts()
  }

  ngOnChanges() {
    this.calculateDataForCharts()
  }

  private calculateDataForCharts() {
    const series: BarChartCardData['series'] = [];

    // add aimed and planned ects to dataset
    if(this.studyPlan) {
      // if study plan exists add aimed and summed ects as data for chart
      let aimedEctsOverSemesters = this.getSummedValues(this.studyPlan.semesterPlans.map(el => el.aimedEcts));
      let summedEcteOverSemesters = this.getSummedValues(this.studyPlan.semesterPlans.map(el => el.summedEcts));

      series.push(
        { name: $localize`Ziel ECTS`, type: 'line', data: aimedEctsOverSemesters, color: 'rgb(51, 106, 151)' },
        { name: $localize`Bisher eingeplante ECTS`, type: 'line', data: summedEcteOverSemesters, color: 'rgb(159, 159, 156)' },
      );
    } else {
      // case if no active study plan exists, approximate aimed ects, planned ects are ignored
      // push values for aimedEcts, if no study plan is active assume student want to achieve same ects in each semester to get final aimedEcts
      const step = (this.aimedEcts ? this.aimedEcts : 180) / this.semesters.length;
      // initialize empty array for aimed ects
      let aimedEctsOverSemesters: number[] = [];
      // take semesters as reference (same length), run through and push summed value to aimedEctsOverSemesters-Array
      for(const [index,value] of this.semesters.entries()) {
        aimedEctsOverSemesters.push(step + step * index);
      }
      series.push({ name: $localize`Ziel ECTS`, type: 'line', data: aimedEctsOverSemesters, color: 'rgb(51, 106, 151)' });
    }

    // TODO
    // add current passed ects to dataset
    const passedEctsOverSemester = this.getSummedValues(this.studyPath.map(el => {
      const passedModulesEcts = el.modules.filter(mod => mod.status == 'passed').map(module => module.ects).reduce(
        (accumulator, currentValue) => accumulator + currentValue, 0
      );
      return passedModulesEcts;
    }));
    series.push({ name: $localize`Bisher bestandene ECTS`, data: passedEctsOverSemester, color: '#97bf0d' });

    this.cardData = {
      title: $localize`ECTS Fortschritt (Gesamt)`,
      xLabels: this.semesters.map(semester => semester.shortName),
      series,
    } satisfies BarChartCardData;
  }

  /**---------------------------
   * Helper function to get summed values over an array
   * @param arr array of numbers, which values should summed over length
   * @returns the summed array (e.g. [1, 2, 3] -> [1, 3, 6])
   ------------------------------*/
  private getSummedValues(arr: number[]): number[] {
    let result: number[] = []
    for(const [index,value] of arr.entries()) {
      // get part of array 
      let part = arr.slice(0, index);
      let sum = part.reduce((pv, cv) => pv + cv, value);
      result.push(sum);
    }
    return result;
  }
}
