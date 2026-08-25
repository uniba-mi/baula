import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
      name: 'Studiengang',
    },
    {
      key: 'count',
      name: 'Häufigkeit',
    },
  ];

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
            title: 'Allgemeines',
            items: [
              {
                iconClass: 'bi-people-fill',
                name: 'User insgesamt:',
                data: report.allUsers,
              },
              {
                iconClass: 'bi-person-fill-check',
                name: 'User (aktiv):',
                data: report.activeUsers,
                tooltip: 'Anzahl der User, die im letzten Monat aktiv waren',
              },
              {
                iconClass: 'bi-journal-text',
                name: 'Studienpläne (aktiv):',
                data: report.frequencyStudyPlans,
                tooltip:
                  'Anzahl der Studienpläne, die im letzten Monat geändert wurden',
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
            title: 'Häufigkeit Modulstatus',
            xLabels: report.frequencyModuleStatus.map((item) =>
              item.name.toString(),
            ),
            series: [
              {
                data: report.frequencyModuleStatus.map((item) => ({
                  value: item.count,
                  color:
                    this.colorMapping[
                      item.name.toLowerCase() as keyof typeof this.colorMapping
                    ],
                })),
              },
            ],
          },
        });
        // add frequency of studyplans
        cards.push({
          id: 'frequencyStudyPlansClusteredChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: 'Häufigkeit Studienpläne (Cluster)',
            xLabels: report.frequencyStudyPlansClustered.map((item) =>
              item.name.toString(),
            ),
            series: [
              {
                color: 'rgba(102, 144, 177, 0.8)',
                data: report.frequencyStudyPlansClustered.map(
                  (item) => item.count,
                ),
              },
            ],
          },
        });
        // add last update user table
        cards.push({
          id: 'lastActiveUsersHistory',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 col-lg-4 my-2',
          cardData: {
            title: 'Aktualität User',
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
            title: 'Häufigkeit Startsemester',
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
            title: 'Häufigkeit Abgeschlossene Module',
            data: report.frequencyModulesAsCompleted,
            columnKeys: this.columnKeys,
            columns: this.columns,
          },
        });
        // add frequency of study duration
        const sortedDuration = report.frequencyDuration.sort((a, b) => Number(a.name) - Number(b.name))
        cards.push({
          id: 'frequencyDurationChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: 'Häufigkeit Studiendauer',
            xLabels: sortedDuration.map((item) =>
              item.name ? item.name.toString() : 'Null',
            ),
            series: [
              {
                color: 'rgba(102, 144, 177, 0.8)',
                data: sortedDuration.map((item) => item.count),
              },
            ],
          },
        });
        // add frequency of completed modules as cluster
        cards.push({
          id: 'frequencyCompletedModulesChart',
          type: 'bar',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: 'Häufigkeit Abgeschlossene Module (Cluster)',
            xLabels: report.frequencyCompletedModules.map((item) =>
              item.name.toString(),
            ),
            series: [
              {
                color: 'rgba(102, 144, 177, 0.8)',
                data: report.frequencyCompletedModules.map(
                  (item) => item.count,
                ),
              },
            ],
          },
        });
        // add frequency of start semester
        cards.push({
          id: 'frequencyStudyProgrammes',
          type: 'table',
          spacingClasses: 'col-12 col-md-6 my-2',
          cardData: {
            title: 'Häufigkeit Studiengang',
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
            title: 'Häufigkeit Lehrveranstaltungen',
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
      frequencyModuleStatus: report.frequencyModuleStatus.filter(el => el.name),
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
