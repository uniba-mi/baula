import { Component, OnInit, inject } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { AdminReport } from '../reporting';
import { map, Observable } from 'rxjs';
import { ReportCard } from '../../reporting/reporting';
import { Report } from '../../reporting/reporting';
import { Semester } from '../../../../../../interfaces/semester';

@Component({
  selector: 'admin-reporting',
  standalone: false,

  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss',
})
export class ReportingComponent implements OnInit {
  private adminRestService = inject(AdminRestService);

  reportNew$: Observable<Report>;
  colorMapping = {
    taken: 'rgba(102, 144, 177, 0.8)',
    passed: 'rgba(172, 204, 61, 0.8)',
    failed: 'rgba(235, 105, 114, 0.8)',
  };

  columnKeys = ['name', 'count'];
  columns = [
    {
      key: 'name',
      name: $localize`Studiengang`,
    },
    {
      key: 'count',
      name: $localize`Häufigkeit`,
    },
  ];
  barChartConfig = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  ngOnInit(): void {
    this.reportNew$ = this.adminRestService.getReport().pipe(
      map((report: AdminReport) => {
        report = this.cleanUpReport(report);

        let cards: ReportCard[] = [];
        // add meta card
        cards.push({
          id: 'userMetaData',
          type: 'meta',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Allgemeines`,
            items: [
              {
                iconClass: 'bi-people-fill',
                name: $localize`User insgesamt:`,
                data: report.allUsers,
              },
              {
                iconClass: 'bi-person-fill-check',
                name: $localize`User (aktiv):`,
                data: report.activeUsers,
                tooltip: $localize`Anzahl der User, die im letzten Monat aktiv waren`,
              },
              {
                iconClass: 'bi-journal-text',
                name: $localize`Studienpläne (aktiv):`,
                data: report.frequencyStudyPlans,
                tooltip:
                  $localize`Anzahl der Studienpläne, die im letzten Monat geändert wurden`,
              },
            ],
            reportData: report,
          },
        });
        // add module status
        cards.push({
          id: 'moduleStatusChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Häufigkeit Modulstatus`,
            data: {
              labels: report.frequencyModuleStatus.map((item) =>
                item.name.toString(),
              ),
              datasets: [
                {
                  backgroundColor: report.frequencyModuleStatus.map(
                    (item) =>
                      this.colorMapping[
                        item.name.toLowerCase() as keyof typeof this.colorMapping
                      ],
                  ),
                  data: report.frequencyModuleStatus.map((item) => item.count),
                },
              ],
            },
            config: this.barChartConfig,
          },
        });
        // add frequency of studyplans
        cards.push({
          id: 'frequencyStudyPlansClusteredChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Häufigkeit Studienpläne (Cluster)`,
            data: {
              labels: report.frequencyStudyPlansClustered.map((item) =>
                item.name.toString(),
              ),
              datasets: [
                {
                  backgroundColor: 'rgba(102, 144, 177, 0.8)',
                  data: report.frequencyStudyPlansClustered.map(
                    (item) => item.count,
                  ),
                },
              ],
            },
            config: this.barChartConfig,
          },
        });
        // add last update user table
        cards.push({
          id: 'lastActiveUsersHistory',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Aktualität User`,
            data: report.lastActiveUsersHistory,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });
        // add frequency of start semester
        cards.push({
          id: 'frequencyStartSemester',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Häufigkeit Startsemester`,
            data: report.frequencyStartSemester,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });
        // add frequency of completed Modules
        cards.push({
          id: 'frequencyModulesAsCompleted',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: $localize`Häufigkeit Abgeschlossene Module`,
            data: report.frequencyModulesAsCompleted,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });
        // add frequency of study duration
        cards.push({
          id: 'frequencyDurationChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: $localize`Häufigkeit Studienpläne (Cluster)`,
            data: {
              labels: report.frequencyDuration.map((item) =>
                item.name ? item.name.toString() : 'Null',
              ),
              datasets: [
                {
                  backgroundColor: 'rgba(102, 144, 177, 0.8)',
                  data: report.frequencyDuration.map((item) => item.count),
                },
              ],
            },
            config: this.barChartConfig,
          },
        });
        // add frequency of completed modules as cluster
        cards.push({
          id: 'frequencyCompletedModulesChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: $localize`Häufigkeit Abgeschlossene Module (Cluster)`,
            data: {
              labels: report.frequencyCompletedModules.map((item) =>
                item.name.toString(),
              ),
              datasets: [
                {
                  backgroundColor: 'rgba(102, 144, 177, 0.8)',
                  data: report.frequencyCompletedModules.map(
                    (item) => item.count,
                  ),
                },
              ],
            },
            config: this.barChartConfig,
          },
        });
        // add frequency of start semester
        cards.push({
          id: 'frequencyStudyProgrammes',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: $localize`Häufigkeit Studiengang`,
            data: report.frequencyStudyProgrammes,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });
        // add frequency of planned courses
        cards.push({
          id: 'frequencyPlannedCourses',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: $localize`Häufigkeit Lehrveranstaltungen`,
            data: report.frequencyPlannedCourses,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });

        return {
          cards,
        };
      }),
    );
  }

  private cleanUpReport(report: AdminReport): AdminReport {
    return {
      ...report,
      frequencyStartSemester: report.frequencyStartSemester.map((el) => {
        return {
          ...el,
          name: new Semester(el.name).shortName,
        };
      }),
      frequencyPlannedCourses: report.frequencyPlannedCourses.map((el) => {
        return {
          ...el,
          name: `${el.name ?? ''} (${new Semester(el.semester).shortName})`,
        };
      }),
    };
  }
}
