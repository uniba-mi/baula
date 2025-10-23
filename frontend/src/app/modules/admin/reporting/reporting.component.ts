import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { Report } from '../reporting';
import { Observable } from 'rxjs';
import { ChartData, ChartConfiguration } from 'chart.js';
import { PageEvent } from '@angular/material/paginator';
import { BaseChartDirective } from 'ng2-charts';
import type { DownloadService } from 'src/app/shared/services/download.service';
import { LazyInjectService } from 'src/app/shared/services/lazy-inject.service';

@Component({
  selector: 'admin-reporting',
  standalone: false,

  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss',
})
export class ReportingComponent implements OnInit {
  report$: Observable<Report>;
  lastActiveUsersHistoryDatasets: ChartConfiguration<'line'>['data']['datasets'];
  lastActiveUsersHistoryLabels: string[];
  paginatedFrequencyModulesAsCompleted: any[] = []; // data for frequencyModulesAsCompleted
  paginatedFrequencyStudyProgrammes: any[] = []; // data for frequencyStudyProgrammes
  paginatedLastActiveUsersHistory: any[] = []; // data for lastActiveUsersHistory
  paginatedFrequencyStartSemester: any[] = []; // data for frequencyStartSemester
  paginatedFrequencyPlannedCourses: any[] = []; // data for frequencyPlannedCourses
  pageSize = 5; // Standard-Seitengröße
  currentPage = 0; // Aktuelle Seite
  @ViewChild('#moduleStatusChart') moduleStatusChart:
    | BaseChartDirective<'bar'>
    | undefined;
  @ViewChild('#frequencyDurationChart') frequencyDurationChart:
    | BaseChartDirective<'bar'>
    | undefined;
  @ViewChild('#frequencyCompletedModulesChart') frequencyCompletedModulesChart:
    | BaseChartDirective<'bar'>
    | undefined;
  @ViewChild('#frequencyStudyPlansClusteredChart')
  frequencyStudyPlansClusteredChart: BaseChartDirective<'bar'> | undefined;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  public moduleStatusChartData: ChartData<'bar'> | undefined;
  public frequencyDurationChartData: ChartData<'bar'> | undefined;
  public frequencyCompletedModulesChartData: ChartData<'bar'> | undefined;
  public frequencyStudyPlansClusteredChartData: ChartData<'bar'> | undefined;
  public barChartType = 'bar' as const;

  constructor(
    private adminRestService: AdminRestService,
    private lazyInject: LazyInjectService
  ) {}

  ngOnInit(): void {
    this.report$ = this.adminRestService.getReport();
    this.report$.subscribe((report) => {
      this.paginatedFrequencyModulesAsCompleted = this.updateTableData(
        report.frequencyModulesAsCompleted
      );
      this.paginatedFrequencyStudyProgrammes = this.updateTableData(
        report.frequencyStudyProgrammes
      );
      this.paginatedLastActiveUsersHistory = this.updateTableData(
        report.lastActiveUsersHistory
      );
      this.paginatedFrequencyStartSemester = this.updateTableData(
        report.frequencyStartSemester
      );
      this.paginatedFrequencyPlannedCourses = this.updateTableData(
        report.frequencyPlannedCourses
      );
      this.setChartData(report);
    });
  }

  // function to set module status chart data
  setChartData(report: Report): void {
    // generation of the chart data for the module status chart
    const colorMapping = {
      taken: 'rgba(102, 144, 177, 0.8)',
      passed: 'rgba(172, 204, 61, 0.8)',
      failed: 'rgba(235, 105, 114, 0.8)',
    };

    this.moduleStatusChartData = {
      labels: report.frequencyModuleStatus.map((item) => item.name.toString()),
      datasets: [
        {
          backgroundColor: report.frequencyModuleStatus.map(
            (item) =>
              colorMapping[item.name.toLowerCase() as keyof typeof colorMapping]
          ),
          data: report.frequencyModuleStatus.map((item) => item.count),
        },
      ],
    };

    this.frequencyDurationChartData = {
      labels: report.frequencyDuration.map((item) =>
        item.name ? item.name.toString() : 'Null'
      ),
      datasets: [
        {
          backgroundColor: 'rgba(102, 144, 177, 0.8)',
          data: report.frequencyDuration.map((item) => item.count),
        },
      ],
    };

    this.frequencyCompletedModulesChartData = {
      labels: report.frequencyCompletedModules.map((item) =>
        item.name.toString()
      ),
      datasets: [
        {
          backgroundColor: 'rgba(102, 144, 177, 0.8)',
          data: report.frequencyCompletedModules.map((item) => item.count),
        },
      ],
    };

    this.frequencyStudyPlansClusteredChartData = {
      labels: report.frequencyStudyPlansClustered.map((item) =>
        item.name.toString()
      ),
      datasets: [
        {
          backgroundColor: 'rgba(102, 144, 177, 0.8)',
          data: report.frequencyStudyPlansClustered.map((item) => item.count),
        },
      ],
    };
  }

  // Methode, um die paginierten Daten zu aktualisieren
  updateTableData(data: any[]): any[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  }

  // Event-Handler für die Paginator
  onPageChange(event: PageEvent, key: string, data: any[]): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    // Aktualisiere die paginierten Daten
    switch (key) {
      case 'frequencyModulesAsCompleted':
        this.paginatedFrequencyModulesAsCompleted = this.updateTableData(data);
        break;
      case 'frequencyStudyProgrammes':
        this.paginatedFrequencyStudyProgrammes = this.updateTableData(data);
        break;
      case 'lastActiveUsersHistory':
        this.paginatedLastActiveUsersHistory = this.updateTableData(data);
        break;
      case 'frequencyStartSemester':
        this.paginatedFrequencyStartSemester = this.updateTableData(data);
        break;
      case 'frequencyCompletedModules':
        this.paginatedFrequencyModulesAsCompleted = this.updateTableData(data);
        break;
      case 'frequencyPlannedCourses':
        this.paginatedFrequencyPlannedCourses = this.updateTableData(data);
        break;
      default:
        break;
    }
  }

  exportReport(report: Report): void {
    const date = new Date();
    const formattedDate = `${date.getDate()}_${
      date.getMonth() + 1
    }_${date.getFullYear()}`;
    this.lazyInject.get<DownloadService>(() => 
      import('../../../shared/services/download.service').then((m) => m.DownloadService)
    ).then(download => download.downloadJSONFile(report, `report_${formattedDate}.json`));
  }
}
