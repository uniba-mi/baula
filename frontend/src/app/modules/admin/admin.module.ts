import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { Fn2xmlDndComponent } from './fn2xml-dnd/fn2xml-dnd.component';
import { UnivisCrawlComponent } from './univis-crawl/univis-crawl.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs'; 
import { ManageAcademicDatesComponent } from './admin-panel/manage-academic-dates/manage-academic-dates.component';
import { ManageDateTypesComponent } from './admin-panel/manage-date-types/manage-date-types.component';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdminDialogComponent } from './dialogs/admin-dialog.component';
import { AcademicDatesDialogComponent } from './dialogs/academic-dates-dialog/academic-dates-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DateTypeDialogComponent } from './dialogs/date-type-dialog/date-type-dialog.component';
import { ModuleCourseConnectionComponent } from './module-course-connection/module-course-connection.component';
import { UnivisCrawlDialogComponent } from './dialogs/univis-crawl-dialog/univis-crawl-dialog.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AuthInterceptor } from 'src/app/shared/auth/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConnectionCardComponent } from './module-course-connection/connection-card/connection-card.component';
import { EditConnectionDialogComponent } from './dialogs/edit-connection-dialog/edit-connection-dialog.component';
import { CourseConnectionCardComponent } from './dialogs/edit-connection-dialog/course-connection-card/course-connection-card.component';
import { ErrorLogsComponent } from './error-logs/error-logs.component';
import { AdminRecsComponent } from './admin-recs/admin-recs.component';
import { ReportingComponent } from './reporting/reporting.component';
import { BaseChartDirective } from 'ng2-charts';
import { SharedModule } from '../shared/shared.module';
import { SemesterSelectionFormComponent } from './shared/semester-selection-form/semester-selection-form.component';
import { ResultPageComponent } from '../long-term-evaluation/result-page/result-page.component';
import { MetaDataCardComponent } from '../reporting/meta-data-card/meta-data-card.component';
import { BarChartCardComponent } from '../reporting/bar-chart-card/bar-chart-card.component';
import { TableCardComponent } from '../reporting/table-card/table-card.component';
import { ReportingBaseComponent } from '../reporting/reporting-base.component';
import { OtherActionsComponent } from './other-actions/other-actions.component';


@NgModule({
  declarations: [
    AdminComponent,
    AdminPanelComponent,
    ManageAcademicDatesComponent,
    ManageDateTypesComponent,
    Fn2xmlDndComponent,
    UnivisCrawlComponent,
    AdminDialogComponent,
    AcademicDatesDialogComponent,
    DeleteDialogComponent,
    DateTypeDialogComponent,
    ModuleCourseConnectionComponent,
    UnivisCrawlDialogComponent,
    ConnectionCardComponent,
    EditConnectionDialogComponent,
    CourseConnectionCardComponent,
    ErrorLogsComponent,
    AdminRecsComponent,
    ReportingComponent,
    SemesterSelectionFormComponent,
    OtherActionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    MatDialogModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule, 
    MatTableModule,
    MatPaginatorModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTooltipModule, 
    MatCardModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    BaseChartDirective,
    SharedModule, 
    ResultPageComponent,
    ReportingBaseComponent,
    BarChartCardComponent,
    TableCardComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
})
export class AdminModule { }
