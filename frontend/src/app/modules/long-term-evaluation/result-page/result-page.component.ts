import { Component, inject, OnInit } from '@angular/core';
import { LteRestService } from '../lte-rest.service';
import { take } from 'rxjs';
import { MetaCardData, Report, ReportCard } from '../../reporting/reporting';
import { ReportingBaseComponent } from '../../reporting/reporting-base.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Semester } from '../../../../../../interfaces/semester';
import { MatMenuModule } from '@angular/material/menu';
import { LongTermEvaluation } from '../../../../../../interfaces/long-term-evaluation';
import { SharedModule } from '../../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'lte-result-page',
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss',
  imports: [
    ReportingBaseComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    SharedModule,
    MatProgressSpinnerModule,
  ],
  providers: [LteRestService],
})
export class ResultPageComponent implements OnInit {
  surveyResults: LongTermEvaluation[];
  selectedSemester = new Semester().apNr;
  semesterList: string[];
  private api = inject(LteRestService);
  report: Report | undefined;
  barChartConfig = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  ngOnInit(): void {
    this.api
      .getResults()
      .pipe(take(1))
      .subscribe((results) => {
        this.semesterList = [
          ...new Set(
            results.map((el) =>
              this.getSemesterFromSurveyCode(el.evaluationCode)
            )
          )
        ];
        this.surveyResults = results;
        this.updateReport(this.selectedSemester);
      });
  }

  updateReport(semester: string) {
    // limit results to selectedSemester
    let filteredResults = this.surveyResults.filter(
      (el) => this.getSemesterFromSurveyCode(el.evaluationCode) === semester
    );
    let cards: ReportCard[] = [];
    if (filteredResults.length !== 0) {
      // generate Cards for survey analytics
      // meta informations
      cards.push({
        id: 'surveyMetaData',
        type: 'meta',
        spacingClasses: 'col-12 col-md-6 col-lg-4 mb-2',
        cardData: this.generateMetaCardData(filteredResults),
      });

      // bar chart for participation months
      const monthListing = this.countOccurences(
        filteredResults.map((el) => el.evaluationCode)
      );
      cards.push({
        id: 'participationMonthsChart',
        type: 'bar',
        spacingClasses: 'col-12 col-md-6 col-lg-4 mb-2',
        cardData: {
          title: 'Teilnehmer nach Monat',
          data: {
            labels: monthListing.map((el) => el.name),
            datasets: [
              {
                backgroundColor: 'rgba(102, 144, 177, 0.8)',
                data: monthListing.map((el) => el.count),
              },
            ],
          },
          config: this.barChartConfig,
        },
      });

      // table of studyprogrammes
      cards.push({
        id: 'studyprogrammes',
        type: 'table',
        spacingClasses: 'col-12 col-md-6 col-lg-4 mb-2',
        cardData: {
          title: 'Studiengänge der Teilnehmenden',
          data: this.countOccurences(filteredResults.map((el) => el.spName)),
          columnKeys: ['name', 'count'],
          columns: [
            { key: 'name', name: 'Studiengang' },
            { key: 'count', name: 'Häufigkeit' },
          ],
        },
      });

      // table of feedback
      cards.push({
        id: 'feedbacks',
        type: 'table',
        spacingClasses: 'col-12 mb-2',
        cardData: {
          title: 'Feedback der Teilnehmenden',
          data: filteredResults.map(({ spName, semester, feedback}) => ({ spName, semester, feedback})).filter(el => el.feedback !== ''),
          columnKeys: ['spName', 'semester', 'feedback'],
          columns: [
            { key: 'spName', name: 'Studiengang' },
            { key: 'semester', name: 'FS' },
            { key: 'feedback', name: 'Feedback'}
          ],
        },
      });
    }

    this.report = {
      cards: [...cards],
    };
  }

  resetConsentResponse() {
    this.api
      .resetConsentResponse()
      .pipe(take(1))
      .subscribe({
        next: (mes) => {
          console.log(mes);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  private getSemesterFromSurveyCode(surveyCode: string): string {
    const [month, year] = surveyCode.split('-').map(Number);

    if (month > 3 && month < 10) {
      return `${year}1`;
    } else if (month <= 3) {
      return `${year - 1}2`;
    } else if (month >= 10) {
      return `${year}2`;
    } else {
      return '';
    }
  }

  private generateMetaCardData(results: LongTermEvaluation[]): MetaCardData {
    const meanPu = Number(
      this.calculateMean(
        results.map((el) => this.calculateMean(el.pu))
      ).toFixed(2)
    );
    const meanPeou = Number(
      this.calculateMean(
        results.map((el) => this.calculateMean(el.peou))
      ).toFixed(2)
    );
    const meanBi = Number(
      this.calculateMean(results.map((el) => el.bi)).toFixed(2)
    );
    const meanNps = Number(
      this.calculateMean(results.map((el) => el.nps)).toFixed(2)
    );
    return {
      title: 'Überblicksinformationen',
      items: [
        {
          iconClass: 'bi-people',
          name: 'Anzahl Teilnehmer: ',
          data: results.length,
          tooltip: 'Anzahl der Teilnehmer für das ausgewählte Semester.',
        },
        {
          iconClass: 'bi-file-earmark-bar-graph',
          name: 'Perceived Usefulness: ',
          data: meanPu,
          tooltip: 'Durchschnittswert des PU Score.',
        },
        {
          iconClass: 'bi-file-earmark-bar-graph',
          name: 'Perceived Ease of Use: ',
          data: meanPeou,
          tooltip: 'Durchschnittswert des PEOU Score.',
        },
        {
          iconClass: 'bi-file-earmark-bar-graph',
          name: 'Behavioral Intention: ',
          data: meanBi,
          tooltip: 'Durchschnittswert des BI Score.',
        },
        {
          iconClass: 'bi-file-earmark-bar-graph',
          name: 'Net Promoter Score: ',
          data: meanNps,
          tooltip: 'Durchschnittswert des NPS.',
        },
      ],
      reportData: results,
    };
  }

  private countOccurences(array: string[]): { name: string; count: number }[] {
    // create frequency map
    const frequencyMap = array.reduce((acc, str) => {
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // resolve map
    const result = Object.entries(frequencyMap).map(([name, count]) => ({
      name,
      count,
    }));

    // sort in descending order
    return result.sort((a, b) => b.count - a.count);
  }

  private calculateMean(values: number[]): number {
    values = values.filter((el) => el !== 0); // filter out 0 values
    return values.reduce((pv, cv) => pv + cv) / values.length;
  }
}
