import { Component, inject, OnInit } from '@angular/core';
import { LteRestService } from '../lte-rest.service';
import { take } from 'rxjs';
import {
  BarChartCardData,
  BoxplotCardData,
  BoxplotStats,
  computeBoxplotStats,
  LineChartCardData,
  MetaCardData,
  QuoteCardData,
  Report,
  ReportCard,
} from '../../reporting/reporting';
import { ReportingBaseComponent } from '../../reporting/reporting-base.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { Semester } from '../../../../../../interfaces/semester';
import { MatMenuModule } from '@angular/material/menu';
import { LongTermEvaluation } from '../../../../../../interfaces/long-term-evaluation';
import { SharedModule } from '../../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SemesterPipe } from '../../shared/pipes/semester.pipe';

type ViewMode = 'semester' | 'drilldown';

const ALL_SEMESTERS = 'alle';

const BAR_COLORS = ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA'];

@Component({
  selector: 'lte-result-page',
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.scss',
  imports: [
    ReportingBaseComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatMenuModule,
    SharedModule,
    MatProgressSpinnerModule,
  ],
  providers: [LteRestService],
})
export class ResultPageComponent implements OnInit {
  readonly ALL_SEMESTERS = ALL_SEMESTERS;

  surveyResults: LongTermEvaluation[] = [];
  viewMode: ViewMode = 'semester';

  selectedSemester = new Semester().apNr;
  semesterList: string[] = [];

  personalCodeOptions: { code: string; label: string }[] = [];
  selectedPersonalCode: string | undefined;

  private api = inject(LteRestService);
  private semesterPipe = new SemesterPipe();
  private readonly barColor = 'rgba(102, 144, 177, 0.8)';

  report: Report | undefined;

  ngOnInit(): void {
    this.api
      .getResults()
      .pipe(take(1))
      .subscribe((results) => {
        this.surveyResults = results;
        this.semesterList = [
          ...new Set(
            results.map((el) => this.getSemesterFromSurveyCode(el.evaluationCode))
          ),
        ];
        this.personalCodeOptions = this.buildPersonalCodeOptions(results);
        this.updateReport();
      });
  }

  // reads the new value directly from the event instead of the two-way-bound property,
  // which at this point in the change-detection cycle has not been updated yet
  onViewModeChange(event: MatButtonToggleChange): void {
    this.viewMode = event.value;
    this.report = undefined;
    this.updateReport();
  }

  onSemesterChange(event: MatSelectChange): void {
    this.selectedSemester = event.value;
    this.updateSemesterReport(event.value);
  }

  onPersonalCodeChange(event: MatSelectChange): void {
    this.selectedPersonalCode = event.value;
    this.updateDrilldownReport(event.value);
  }

  updateReport(): void {
    if (this.viewMode === 'semester') {
      this.updateSemesterReport(this.selectedSemester);
    } else {
      this.updateDrilldownReport(this.selectedPersonalCode);
    }
  }

  private updateSemesterReport(semester: string): void {
    const isAggregate = semester === ALL_SEMESTERS;
    const filteredResults = isAggregate
      ? this.surveyResults
      : this.surveyResults.filter((el) => this.getSemesterFromSurveyCode(el.evaluationCode) === semester);

    const cards: ReportCard[] = [];
    if (filteredResults.length !== 0) {
      // meta informations
      cards.push({
        id: 'surveyMetaData',
        type: 'meta',
        spacingClasses: 'col-12 col-md-6 col-lg-4 mb-2',
        cardData: this.generateMetaCardData(
          filteredResults,
          isAggregate ? 'über alle Semester hinweg' : 'für das ausgewählte Semester'
        ),
      });

      // boxplots for the TAM constructs and NPS: one group per semester when comparing across
      // all semesters, otherwise a single unlabeled group for the selected semester
      const boxplotGroups = isAggregate
        ? this.chronologicalSemesters().map((s) => ({
            label: this.semesterPipe.transform(s),
            results: this.surveyResults.filter((el) => this.getSemesterFromSurveyCode(el.evaluationCode) === s),
          }))
        : [{ label: '', results: filteredResults }];
      const boxplotCard: ReportCard = {
        id: 'tamBoxplot',
        type: 'boxplot',
        spacingClasses: `col-12 ${!isAggregate ? 'col-md-6 col-lg-8' : ''} mb-2`,
        cardData: this.generateBoxplotCardData(boxplotGroups),
      };

      // bar chart for participation by month
      const monthChartCard: ReportCard = {
        id: 'monthChart',
        type: 'bar',
        spacingClasses: isAggregate ? 'col-12 col-md-6 col-lg-8 mb-2' : 'col-12 col-md-6 col-lg-4 mb-2',
        cardData: this.generateBarChartData(
          'Teilnehmer nach Monat',
          this.countOccurencesChronological(filteredResults.map((el) => el.evaluationCode))
        ),
      };

      // in the "Kein Semester" view the month chart moves ahead of the boxplot so the two
      // fill a row together (4+8); per-semester keeps the boxplot first as before
      if (isAggregate) {
        cards.push(monthChartCard, boxplotCard);
      } else {
        cards.push(boxplotCard, monthChartCard);
      }

      // bar chart for usage frequency
      const useOrder = ['täglich', 'mehrmals pro Woche', 'einmal pro Woche', 'seltener'];
      cards.push({
        id: 'useChart',
        type: 'bar',
        spacingClasses: `col-12 col-md-6 ${!isAggregate ? 'col-lg-4': ''} mb-2`,
        cardData: isAggregate
          ? this.generateGroupedBarChartData('Nutzungshäufigkeit', (el) => el.use, useOrder)
          : this.generateBarChartData(
              'Nutzungshäufigkeit',
              this.countOccurencesOrdered(filteredResults.map((el) => el.use), useOrder)
            ),
      });

      // bar chart for participants' Fachsemester
      cards.push({
        id: 'semesterChart',
        type: 'bar',
        spacingClasses: `col-12 col-md-6 ${!isAggregate ? 'col-lg-4': ''} mb-2`,
        cardData: isAggregate
          ? this.generateGroupedBarChartData('Fachsemester der Teilnehmenden', (el) => String(el.semester))
          : this.generateBarChartData(
              'Fachsemester der Teilnehmenden',
              this.countOccurencesNumeric(filteredResults.map((el) => el.semester))
            ),
      });

      // table of studyprogrammes (counts are summed across semesters when comparing all of them)
      cards.push({
        id: 'studyprogrammes',
        type: 'table',
        spacingClasses: `col-12 col-lg-4 mb-2`,
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

      // table of feedback, with the survey period attached to each row so it stays traceable
      // when feedback from several semesters is listed together
      cards.push({
        id: 'feedbacks',
        type: 'table',
        spacingClasses: `col-12 col-lg-8 mb-2`,
        cardData: {
          title: 'Feedback der Teilnehmenden',
          data: filteredResults
            .map(({ spName, semester, feedback, evaluationCode }) => ({
              spName,
              semester,
              zeitraum: this.semesterPipe.transform(this.getSemesterFromSurveyCode(evaluationCode)),
              feedback,
            }))
            .filter((el) => el.feedback !== ''),
          columnKeys: ['spName', 'semester', 'zeitraum', 'feedback'],
          columns: [
            { key: 'spName', name: 'Studiengang' },
            { key: 'semester', name: 'FS' },
            { key: 'zeitraum', name: 'Semester' },
            { key: 'feedback', name: 'Feedback' },
          ],
        },
      });
    }

    this.report = { cards };
  }

  private chronologicalSemesters(): string[] {
    return [...this.semesterList].sort((a, b) => Number(a) - Number(b));
  }

  private updateDrilldownReport(personalCode: string | undefined): void {
    const cards: ReportCard[] = [];

    if (personalCode) {
      const userResults = this.surveyResults
        .filter((el) => el.personalCode === personalCode)
        .sort((a, b) => this.evaluationCodeSortKey(a.evaluationCode) - this.evaluationCodeSortKey(b.evaluationCode));

      if (userResults.length !== 0) {
        const semesterLabels = userResults.map((el) => this.getSemesterFromSurveyCode(el.evaluationCode));
        const semesterDisplayLabels = semesterLabels.map((s) => this.semesterPipe.transform(s));
        const latest = userResults[userResults.length - 1];

        cards.push({
          id: 'drilldownMeta',
          type: 'meta',
          spacingClasses: 'col-12 col-md-6 col-lg-4 mb-2',
          cardData: {
            title: 'Metainformationen',
            items: [
              { iconClass: 'bi-mortarboard', name: 'Studiengang: ', data: latest.spName },
              { iconClass: 'bi-person-badge', name: 'Code: ', data: personalCode },
              {
                iconClass: 'bi-calendar-range',
                name: 'Verfügbare Semester: ',
                data: semesterDisplayLabels.join(', '),
              },
              {
                iconClass: 'bi-collection',
                name: 'Verfügbare Fachsemester: ',
                data: userResults.map((el) => el.semester).join(', '),
              },
            ],
            reportData: userResults,
          } satisfies MetaCardData,
        });

        cards.push({
          id: 'drilldownLineChart',
          type: 'line',
          spacingClasses: 'col-12 col-lg-8 mb-2',
          cardData: {
            title: 'Verlauf PU / PEOU / BI / NPS',
            xLabels: semesterDisplayLabels,
            series: [
              { name: 'PU', data: userResults.map((el) => this.calculateMean(el.pu)) },
              { name: 'PEOU', data: userResults.map((el) => this.calculateMean(el.peou)) },
              { name: 'BI', data: userResults.map((el) => el.bi) },
              { name: 'NPS', data: userResults.map((el) => el.nps) },
            ],
          } satisfies LineChartCardData,
        });

        cards.push({
          id: 'drilldownTable',
          type: 'table',
          spacingClasses: 'col-12 mb-2',
          cardData: {
            title: 'Rohdaten je Semester',
            data: userResults.map((el, i) => ({
              semester: semesterDisplayLabels[i],
              pu: Number(this.calculateMean(el.pu).toFixed(2)),
              peou: Number(this.calculateMean(el.peou).toFixed(2)),
              bi: el.bi,
              use: el.use,
              nps: el.nps,
            })),
            columnKeys: ['semester', 'pu', 'peou', 'bi', 'use', 'nps'],
            columns: [
              { key: 'semester', name: 'Semester' },
              { key: 'pu', name: 'PU' },
              { key: 'peou', name: 'PEOU' },
              { key: 'bi', name: 'BI' },
              { key: 'use', name: 'Nutzung' },
              { key: 'nps', name: 'NPS' },
            ],
          },
        });

        cards.push({
          id: 'drilldownFeedback',
          type: 'quote',
          spacingClasses: 'col-12 mb-2',
          cardData: {
            title: 'Feedback im Verlauf',
            quotes: userResults
              .map((el, i) => ({ text: el.feedback, meta: semesterDisplayLabels[i] }))
              .filter((quote) => quote.text !== ''),
          } satisfies QuoteCardData,
        });
      }
    }

    this.report = { cards };
  }

  private buildPersonalCodeOptions(results: LongTermEvaluation[]): { code: string; label: string }[] {
    const spNameByCode = new Map<string, string>();
    const countByCode = new Map<string, number>();
    results.forEach((el) => {
      spNameByCode.set(el.personalCode, el.spName);
      countByCode.set(el.personalCode, (countByCode.get(el.personalCode) ?? 0) + 1);
    });

    return [...spNameByCode.entries()]
      .map(([code, spName]) => {
        const count = countByCode.get(code) ?? 0;
        const recordLabel = count === 1 ? '1 Datensatz' : `${count} Datensätze`;
        return { code, label: `${code} (${spName}) · ${recordLabel}` };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
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

  private evaluationCodeSortKey(surveyCode: string): number {
    const [month, year] = surveyCode.split('-').map(Number);
    return year * 100 + month;
  }

  private generateMetaCardData(results: LongTermEvaluation[], scopeLabel: string): MetaCardData {
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
          tooltip: `Anzahl der Teilnehmer ${scopeLabel}.`,
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

  // computes one boxplot per construct (PU/PEOU/BI/NPS) for a single group of results;
  // null where a construct has no usable values (e.g. an empty group)
  private computeBoxplotConstructs(results: LongTermEvaluation[]): (BoxplotStats | null)[] {
    const meanOrNull = (values: number[]): number | null => {
      const filtered = values.filter((el) => el !== 0);
      return filtered.length ? filtered.reduce((pv, cv) => pv + cv) / filtered.length : null;
    };

    const puValues = results.map((el) => meanOrNull(el.pu)).filter((v): v is number => v !== null);
    const peouValues = results.map((el) => meanOrNull(el.peou)).filter((v): v is number => v !== null);
    const biValues = results.map((el) => el.bi).filter((v) => v !== 0);
    const npsValues = results.map((el) => el.nps).filter((v) => v !== 0);

    return [puValues, peouValues, biValues, npsValues].map((values) =>
      values.length ? computeBoxplotStats(values) : null
    );
  }

  private generateBoxplotCardData(groups: { label: string; results: LongTermEvaluation[] }[]): BoxplotCardData {
    const groupStats = groups.map((group) => this.computeBoxplotConstructs(group.results));

    return {
      title: 'Verteilung PU / PEOU / BI / NPS',
      categories: ['PU', 'PEOU', 'BI', 'NPS'],
      groups: groups.map((group) => group.label),
      data: groupStats.map((stats) => stats.map((s) => s?.stats ?? null)),
      outliers: groupStats.map((stats) => stats.map((s) => s?.outliers ?? [])),
    };
  }

  private generateBarChartData(title: string, counts: { name: string; count: number }[]): BarChartCardData {
    return {
      title,
      xLabels: counts.map((el) => el.name),
      series: [{ data: counts.map((el) => el.count), color: this.barColor }],
    };
  }

  // builds a grouped bar chart with one x-axis slot per semester and one series per category,
  // so categories can be compared side by side across the whole survey history
  private generateGroupedBarChartData(
    title: string,
    valueFn: (el: LongTermEvaluation) => string,
    orderedCategories?: string[]
  ): BarChartCardData {
    const semesters = this.chronologicalSemesters();
    const resultsBySemester = semesters.map((s) =>
      this.surveyResults.filter((el) => this.getSemesterFromSurveyCode(el.evaluationCode) === s)
    );
    const categories =
      orderedCategories ??
      [...new Set(this.surveyResults.map(valueFn))].sort((a, b) => Number(a) - Number(b));

    return {
      title,
      xLabels: semesters.map((s) => this.semesterPipe.transform(s)),
      series: categories.map((category, index) => ({
        name: category,
        data: resultsBySemester.map((results) => results.filter((el) => valueFn(el) === category).length),
        color: BAR_COLORS[index % BAR_COLORS.length],
      })),
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

  // like countOccurences, but keeps the given category order instead of sorting by count,
  // for categories that represent an inherent scale (e.g. usage frequency) rather than a ranking
  private countOccurencesOrdered(array: string[], order: string[]): { name: string; count: number }[] {
    const counts = this.countOccurences(array);
    return order
      .map((name) => counts.find((el) => el.name === name) ?? { name, count: 0 })
      .concat(counts.filter((el) => !order.includes(el.name)));
  }

  private countOccurencesNumeric(values: number[]): { name: string; count: number }[] {
    const frequencyMap = values.reduce((acc, v) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    return Object.entries(frequencyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => Number(a.name) - Number(b.name));
  }

  private countOccurencesChronological(codes: string[]): { name: string; count: number }[] {
    return this.countOccurences(codes).sort(
      (a, b) => this.evaluationCodeSortKey(a.name) - this.evaluationCodeSortKey(b.name)
    );
  }

  private calculateMean(values: number[]): number {
    const filtered = values.filter((el) => el !== 0); // filter out 0 values
    return filtered.length ? filtered.reduce((pv, cv) => pv + cv) / filtered.length : 0;
  }
}
