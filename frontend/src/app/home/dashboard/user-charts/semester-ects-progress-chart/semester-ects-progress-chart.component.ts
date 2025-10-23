import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { SemesterStudyPath, Studypath } from '../../../../../../../interfaces/studypath';
import { Semester } from '../../../../../../../interfaces/semester';
import { Studyplan } from '../../../../../../../interfaces/studyplan';
import { TransformationService } from 'src/app/shared/services/transformation.service';

@Component({
    selector: 'app-semester-ects-progress-chart',
    templateUrl: './semester-ects-progress-chart.component.html',
    styleUrls: ['./semester-ects-progress-chart.component.scss'],
    standalone: false
})
export class SemesterEctsProgressChartComponent implements OnInit, OnChanges {
  @Input() studypath: Studypath;
  @Input() semesters: Semester[];
  @Input() studyplan: Studyplan | undefined | null;
  studypathInSemester: SemesterStudyPath[] = [];

  constructor(private transform: TransformationService) { }

  public lineChartData: ChartConfiguration['data'];

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      y:
        {
          position: 'left',
        }
    },

    plugins: {
      legend: { display: true }
    }
  };


  ngOnInit(): void {
    this.transform.transformStudypath(this.studypath, this.semesters)
      .subscribe((studypathInSemester) => {
        this.studypathInSemester = studypathInSemester;
      });
    this.calculateDataForLineChart();
  }

  ngOnChanges() {
    this.transform.transformStudypath(this.studypath, this.semesters)
      .subscribe((studypathInSemester) => {
        this.studypathInSemester = studypathInSemester;
      });
    this.calculateDataForLineChart();
  }
  

  calculateDataForLineChart() {
    this.lineChartData = {
      datasets: [
        {
          data: this.getEctsProgressFromStudypath(this.studypathInSemester, 'taken'),
          label: 'Belegte ECTS (Ist)',
          backgroundColor: 'rgba(102, 144, 177, 0.2)',
          borderColor: 'rgb(51, 106, 151)',
          pointBackgroundColor: 'rgb(102, 144, 177)',
          pointBorderColor: '#00457d',
          pointHoverBackgroundColor: '#00457d',
          pointHoverBorderColor: 'rgb(51, 106, 151)',
          fill: 'origin',
        },
        {
          data: this.getEctsProgressFromStudypath(this.studypathInSemester, 'passed'),
          label: 'Bestandene ECTS (Ist)',
          backgroundColor: 'rgba(172, 204, 61, 0.2)',
          borderColor: '#97bf0d',
          pointBackgroundColor: 'rgb(213, 229, 158)',
          pointBorderColor: '#97bf0d',
          pointHoverBackgroundColor: '#97bf0d',
          pointHoverBorderColor: '#97bf0d',
          fill: 'origin',
        },
        {
          data: this.getEctsProgressFromStudypath(this.studypathInSemester, 'failed'),
          label: 'Nicht bestandene ECTS (Ist)',
          backgroundColor: 'rgba(235, 105, 114, 0.2)',
          borderColor: '#e6444f',
          pointBackgroundColor: 'rgb(240, 143, 149)',
          pointBorderColor: '#e6444f',
          pointHoverBackgroundColor: 'rgb(235, 105, 114)',
          pointHoverBorderColor: '#e6444f',
          fill: 'origin',
        }
      ],
      labels: this.semesters.map(semester => semester.shortName)
    };
    if(this.studypathInSemester) {
      this.lineChartData.datasets = this.lineChartData.datasets.concat([
        {
          data: this.getEctsProgressFromStudyplan('aim'),
          label: 'Ziel ECTS (Plan)',
          backgroundColor: 'rgba(77,83,96,0.2)',
          borderColor: 'rgba(77,83,96,1)',
          pointBackgroundColor: 'rgba(77,83,96,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)',
          fill: 'origin',
        },
        {
          data: this.getEctsProgressFromStudyplan('planned'),
          label: 'Eingeplante ECTS (Plan)',
          backgroundColor: 'rgb(159, 159, 156, 0.3)',
          borderColor: 'rgb(159, 159, 156)',
          pointBackgroundColor: 'rgb(207, 207, 206)',
          pointBorderColor: 'rgb(159, 159, 156)',
          pointHoverBackgroundColor: 'rgb(159, 159, 156)',
          pointHoverBorderColor: 'rgb(207, 207, 206)',
          fill: 'origin',
        }
      ])
    }
  }

  /** ------------------------------
   *  Helper function to get ects values for each semester out of studyplan (soll-status)
   * @param status defines which data should be returned, can be 'aim' for aimedEcts for each Semester or 'planned' for ects that are planed with modules
   * @returns array with ects for each semester (length is same as semesters)
     ------------------------------- */
  private getEctsProgressFromStudyplan(status: string): number[] {
    if(this.studyplan) {
      // check if aimed or planned ects are requested
      if(status == 'aim') {
        return this.studyplan.semesterPlans.map(plan => plan.aimedEcts);;
      } else if(status == 'planned') {
        return this.studyplan.semesterPlans.map(plan => plan.summedEcts);
      } else {
        // invalid status, return empty array
        return [];
      }
    } else {
      return []
    }
    
  }

  /** ------------------------------
   *  Helper function to get ects values from studypath (ist-status)
   * @param status defines which data should be returned, stands for status of modules that should be combined (e.g. 'passed' for all modules that were passed in this semester)
   * @returns array with ects for each semester (length is same as semesters)
      ------------------------------ */
  private getEctsProgressFromStudypath(path: SemesterStudyPath[], status: string): number[] {
    return path.map(el => {
      const passedModulesEcts = el.modules.filter(mod => mod.status == status).map(module => module.ects).reduce(
        (accumulator, currentValue) => accumulator + currentValue, 0
      );
      return passedModulesEcts;
    });
  }

}
