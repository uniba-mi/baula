import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartData, ChartConfiguration } from 'chart.js';
import { SemesterStudyPath, StudyPath } from '../../../../../../../interfaces/study-path';
import { Semester } from '../../../../../../../interfaces/semester';
import { StudyPlan } from '../../../../../../../interfaces/study-plan';

@Component({
    selector: 'app-total-ects-progress-chart',
    templateUrl: './total-ects-progress-chart.component.html',
    styleUrls: ['./total-ects-progress-chart.component.scss'],
    standalone: false
})
export class TotalEctsProgressChartComponent implements OnInit, OnChanges {
  @Input() studyPath: SemesterStudyPath[];
  @Input() studyPlan: StudyPlan | undefined | null;
  @Input() semesters: Semester[];
  @Input() aimedEcts: number | undefined;

  public studyProgressData: ChartData<'bar'|'line', number[]>;

  public studyProgressOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
      },
      y: {
        ticks: {
          stepSize: 30
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
    this.calculateDataForCharts()
  }

  ngOnChanges() {
    this.calculateDataForCharts()
  }

  private calculateDataForCharts() {
    this.studyProgressData = {
      labels: this.semesters.map(semester => semester.shortName),
      datasets: [],
    };

    // add aimed and planned ects to dataset
    if(this.studyPlan) {
      // if study plan exists add aimed and summed ects as data for chart
      let aimedEctsOverSemesters = this.getSummedValues(this.studyPlan.semesterPlans.map(el => el.aimedEcts));
      let summedEcteOverSemesters = this.getSummedValues(this.studyPlan.semesterPlans.map(el => el.summedEcts));
      
      this.studyProgressData.datasets = this.studyProgressData.datasets.concat([
        {
          data: aimedEctsOverSemesters,
          label: 'Ziel ECTS',
          backgroundColor: 'rgba(102, 144, 177, 0.2)',
          borderColor: 'rgb(51, 106, 151)',
          pointBackgroundColor: 'rgb(102, 144, 177)',
          pointBorderColor: '#00457d',
          pointHoverBackgroundColor: '#00457d',
          pointHoverBorderColor: 'rgb(51, 106, 151)',
          type: 'line'
        },
        {
          data: summedEcteOverSemesters,
          label: 'Bisher eingeplante ECTS',
          backgroundColor: 'rgb(159, 159, 156, 0.3)',
          borderColor: 'rgb(159, 159, 156)',
          pointBackgroundColor: 'rgb(207, 207, 206)',
          pointBorderColor: 'rgb(159, 159, 156)',
          pointHoverBackgroundColor: 'rgb(159, 159, 156)',
          pointHoverBorderColor: 'rgb(207, 207, 206)',
          type: 'line'
        }
      ]);
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
      this.studyProgressData.datasets.push(
        {
          data: aimedEctsOverSemesters,
          label: 'Ziel ECTS',
          backgroundColor: 'rgba(102, 144, 177, 0.2)',
          borderColor: 'rgb(51, 106, 151)',
          pointBackgroundColor: 'rgb(102, 144, 177)',
          pointBorderColor: '#00457d',
          pointHoverBackgroundColor: '#00457d',
          pointHoverBorderColor: 'rgb(51, 106, 151)',
          type: 'line'
        }
      )
    }

    // TODO
    // add current passed ects to dataset
    const passedEctsOverSemester = this.getSummedValues(this.studyPath.map(el => {
      const passedModulesEcts = el.modules.filter(mod => mod.status == 'passed').map(module => module.ects).reduce(
        (accumulator, currentValue) => accumulator + currentValue, 0
      );
      return passedModulesEcts;
    }));
    this.studyProgressData.datasets.push(
      {
        data: passedEctsOverSemester,
        label: 'Bisher bestandene ECTS',
        backgroundColor: 'rgba(172, 204, 61, 0.8)',
        borderColor: '#97bf0d',
        hoverBackgroundColor: '#97bf0d',
        hoverBorderColor: '#97bf0d',
      }
    );
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
