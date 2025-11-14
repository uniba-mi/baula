import { APP_INITIALIZER, ErrorHandler, Inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { createErrorHandler, TraceService } from '@sentry/angular';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

/* Angular Material Modules */
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';

/* Imports for state management */
import { reducers } from './reducers';
import * as fromUser from './reducers/user.reducer';
import { UserEffects } from './effects/user.effects';
import * as fromModuleOverview from './reducers/module-overview.reducer';
import * as fromDialog from './reducers/dialog.reducer';
import * as fromSearchSettings from './reducers/search-settings.reducer';
import * as fromEvaluation from './reducers/evaluation.reducer'
import { ModuleOverviewEffects } from './effects/module-overview.effects';
import { environment } from '../environments/environment';
import * as fromStudyPlanning from './reducers/study-planning.reducers';
import { StudyPlanningEffects } from './effects/study-planning.effects';
import { ErrorEffects } from './effects/error.effects';

/* Components */
import { ModuleOverviewComponent } from './home/module-overview/module-overview.component';
import { HomeComponent } from './home/home.component';
import { NavComponent } from './nav/nav.component';
import { ModuleCardComponent } from './home/module-overview/module-card/module-card.component';
import { ModuleListComponent } from './home/module-overview/module-list/module-list.component';
import { SemesterPlanComponent } from './home/semester-plan/semester-plan.component';
import { StudyPlanComponent } from './home/study-plan/study-plan.component';
import { CourseListComponent } from './home/semester-plan/course-list/course-list.component';
import { CourseItemComponent } from './home/semester-plan/course-item/course-item.component';
import { ExpandCourseTypePipe } from './shared/pipes/expand-course-type.pipe';
import { ShowWeekdayPipe } from './shared/pipes/show-weekday.pipe';
import { StudyPlanDetailComponent } from './home/study-plan/study-plan-detail/study-plan-detail.component';
import { DialogComponent } from './dialog/dialog.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { StudyPlanDialogComponent } from './dialog/study-plan-dialog/study-plan-dialog.component';
import { UserGeneratedModuleDialogComponent } from './dialog/user-generated-module-dialog/user-generated-module-dialog.component';
import { UserDialogComponent } from './dialog/user-dialog/user-dialog.component';
import { ConfirmationDialogComponent } from './dialog/confirmation-dialog/confirmation-dialog.component';
import { AimedEctsDialogComponent } from './dialog/aimed-ects-dialog/aimed-ects-dialog.component';
import { ModuleStatusComponent } from './shared/components/module-status/module-status.component';
import { SearchPanelComponent } from './shared/components/search-panel/search-panel.component';
import { CourseOverviewComponent } from './home/semester-plan/course-overview/course-overview.component';
import { AddModuleDialogComponent } from './dialog/add-module-dialog/add-module-dialog.component';
import { TotalEctsProgressChartComponent } from './home/dashboard/user-charts/total-ects-progress-chart/total-ects-progress-chart.component';
import { TotalModuleProgressChartComponent } from './home/dashboard/user-charts/total-module-progress-chart/total-module-progress-chart.component';
import { SemesterEctsProgressChartComponent } from './home/dashboard/user-charts/semester-ects-progress-chart/semester-ects-progress-chart.component';
import { SemesterModuleProgressChartComponent } from './home/dashboard/user-charts/semester-module-progress-chart/semester-module-progress-chart.component';
import { DashboardCardHeaderComponent } from './home/dashboard/dashboard-card-header/dashboard-card-header.component';
import { ModuleGroupProgressChartComponent } from './home/dashboard/user-charts/module-group-progress-chart/module-group-progress-chart.component';
import { ChangeStatusDialogComponent } from './dialog/change-status-dialog/change-status-dialog.component';
import { WelcomeComponent } from './public/welcome/welcome.component';
import { NoDataComponent } from './shared/components/no-data/no-data.component';
import { StandardDialogComponent } from './dialog/standard-dialog/standard-dialog.component';
import { CourseSearchPanelComponent } from './home/semester-plan/course-search-panel/course-search-panel.component';
import { EditSemesterDialogComponent } from './dialog/edit-semester-dialog/edit-semester-dialog.component';
import { SharedModule } from './modules/shared/shared.module';
import { PublicationsComponent } from './public/publications/publications.component';
import { AboutComponent } from './public/about/about.component';
import { ModuleDetailsDialogComponent } from './dialog/module-details-dialog/module-details-dialog.component';
import { StudyPlanSemesterComponent } from './home/study-plan/study-plan-detail/study-plan-semester/study-plan-semester.component';
import { PrivacyComponent } from './public/privacy/privacy.component';
import { HintComponent } from './shared/components/hint/hint.component';
import { ImportDialogComponent } from './dialog/import-dialog/import-dialog.component';
import { ExportDialogComponent } from './dialog/export-dialog/export-dialog.component';
import { RecsSidenavComponent } from './modules/recommendations/recs-sidenav/recs-sidenav.component';
import { RecsModuleCardComponent } from './modules/recommendations/recs-sidenav/recs-module-card/recs-module-card.component';
import { StudentUploadComponent } from './modules/student-upload/student-upload/student-upload.component';
import { CustomIconsModule } from './modules/custom-icons/custom-icons.module';
import { ActivateStudyPlanDialogComponent } from './dialog/activate-study-plan-dialog/activate-study-plan-dialog.component';
import { LinkifyPipe } from './shared/pipes/linkify.pipe';
import { SelectSemesterDialogComponent } from './dialog/select-semester-dialog/select-semester-dialog.component';
import { UserProfileComponent } from './home/user-profile/user-profile.component';
import { UserFormComponent } from './home/user-profile/user-form/user-form.component';
import { ProgressBarComponent } from './home/study-plan/study-plan-detail/progress-bar/progress-bar.component';
import { SemesterDatesComponent } from './home/dashboard/semester-dates/semester-dates.component';
import { FullCalendarComponent } from './shared/components/full-calendar/full-calendar.component';
import { CourseDetailsDialogComponent } from './dialog/course-details-dialog/course-details-dialog.component';
import { QuickLinksComponent } from './home/dashboard/quick-links/quick-links.component';
import { UploadStudentDataDialogComponent } from './modules/student-upload/dialogs/upload-student-data-dialog/upload-student-data-dialog.component';
import { UploadDataPrivacyComponent } from './shared/components/upload-data-privacy/upload-data-privacy.component';
import { DecimalFormatPipe } from './shared/pipes/decimal-format-pipe';
import { DropZoneComponent } from './shared/components/drop-zone/drop-zone.component';
import { EditGradeDialogComponent } from './dialog/edit-grade-dialog/edit-grade-dialog.component';
import { SelectOptionDialog } from './dialog/select-option-dialog/select-option-dialog.component';
import { UploadStudentDataStepperComponent } from './modules/student-upload/dialogs/upload-student-data-stepper/upload-student-data-stepper.component';
import { ChangeModuleGroupDialogComponent } from './dialog/change-module-group-dialog/change-module-group-dialog.component';
import { ModuleGroupWizardComponent } from './shared/components/module-group-wizard/module-group-wizard.component';
import { HelpComponent } from './public/help/help.component';
import { GradePointAverageComponent } from './home/dashboard/grade-point-average/grade-point-average.component';
import { TooltipDirective } from './shared/directives/tooltip.directive';
import { CourseLangPipe } from './shared/pipes/course-lang.pipe';
import { CourseFormatPipe } from './shared/pipes/course-format.pipe';
import { LoginComponent } from './login/login.component';
import { AuthInterceptor } from './shared/auth/auth.interceptor';
import { MaintenanceMessageComponent } from './shared/components/maintenance-message/maintenance-message.component';
import { ProfileMenuComponent } from './nav/profile-menu/profile-menu.component';
import { GroupNavigationComponent } from './home/module-overview/group-navigation/group-navigation.component';
import { UserDataComponent } from './home/user-profile/user-data/user-data.component';
import { StudyPathUpdateComponent } from './home/user-profile/study-path-update/study-path-update.component';
import { ResolveCollisionDialogComponent } from './dialog/resolve-collision-dialog/resolve-collision-dialog.component';
import { CourseDetailsComponent } from './shared/components/course-details/course-details.component';
import { EditPathModuleDialogComponent } from './dialog/edit-path-module-dialog/edit-path-module-dialog.component';
import { FinishSemesterStepperComponent } from './dialog/finish-semester-stepper/finish-semester-stepper.component';
import { ModuleDataComponent } from './dialog/module-details-dialog/module-data/module-data.component';
import { ModuleFeedbackComponent } from './dialog/module-details-dialog/module-feedback/module-feedback.component';
import { MatTabsModule } from '@angular/material/tabs';
import { HoverTrackerDirective } from './shared/directives/hover-tracker.directive';
import { ReloadDialogComponent } from './dialog/reload-dialog/reload-dialog.component';
import { SemesterHeaderComponent } from './home/study-plan/study-plan-detail/study-plan-semester/semester-header/semester-header.component';
import { SemesterBodyComponent } from './home/study-plan/study-plan-detail/study-plan-semester/semester-body/semester-body.component';
import { SemesterCardComponent } from './home/study-plan/study-plan-detail/study-plan-semester/semester-body/semester-card/semester-card.component';
import { EditJobDialogComponent } from './dialog/edit-job-dialog/edit-job-dialog.component';
import { RecsModuleListComponent } from './modules/recommendations/recs-sidenav/recs-module-list/recs-module-list.component';
import { RecommendationComponent } from './home/recommendation/recommendation.component';
import { TopicSettingsComponent } from './home/recommendation/topic-settings/topic-settings.component';
import { TopicChipComponent } from './home/recommendation/topic-settings/topic-chip/topic-chip.component';
import { JobCardComponent } from './home/recommendation/job-settings/job-card/job-card.component';
import { JobSettingsComponent } from './home/recommendation/job-settings/job-settings.component';
import { NotificationDialogComponent } from './dialog/notification-dialog/notification-dialog.component';
import { DependencyGraphComponent } from './dialog/module-details-dialog/dependency-graph/dependency-graph.component';
import { DemoUserDialogComponent } from './dialog/demo-user-dialog/demo-user-dialog.component';
import { PrivacyChangeDialogComponent } from './dialog/privacy-change-dialog/privacy-change-dialog.component';
import { UserConsentsComponent } from './home/user-profile/user-consents/user-consents.component';
import { RecommendationsListComponent } from './home/recommendation/recommendations-list/recommendations-list.component';
import { PersonalisationStatusComponent } from './home/dashboard/personalisation-status/personalisation-status.component';
import { WordCloudComponent } from './shared/components/word-cloud/word-cloud.component';
import { DataPreviewComponent } from './home/recommendation/data-preview/data-preview.component';
import { SettingsListComponent } from './home/recommendation/settings-list/settings-list.component';
import { HintsSidenavComponent } from './shared/components/hints-sidenav/hints-sidenav.component';import { NotFoundComponent } from './public/not-found/not-found.component';
import { EvaluationDialogComponent } from './modules/evaluation/dialog/evaluation-dialog/evaluation-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    RecsSidenavComponent,
    RecsModuleCardComponent,
    ModuleOverviewComponent,
    HomeComponent,
    NavComponent,
    ModuleCardComponent,
    ModuleListComponent,
    SemesterPlanComponent,
    StudyPlanComponent,
    CourseListComponent,
    CourseItemComponent,
    StudentUploadComponent,
    ExpandCourseTypePipe,
    DecimalFormatPipe,
    ShowWeekdayPipe,
    StudyPlanDetailComponent,
    DialogComponent,
    DashboardComponent,
    StudyPlanDialogComponent,
    UserGeneratedModuleDialogComponent,
    UserDialogComponent,
    ConfirmationDialogComponent,
    AimedEctsDialogComponent,
    ModuleStatusComponent,
    EditJobDialogComponent,
    SearchPanelComponent,
    CourseOverviewComponent,
    AddModuleDialogComponent,
    TotalEctsProgressChartComponent,
    TotalModuleProgressChartComponent,
    SemesterEctsProgressChartComponent,
    SemesterModuleProgressChartComponent,
    DashboardCardHeaderComponent,
    ChangeStatusDialogComponent,
    PrivacyChangeDialogComponent,
    UserConsentsComponent,
    ModuleGroupProgressChartComponent,
    WelcomeComponent,
    NoDataComponent,
    StandardDialogComponent,
    CourseSearchPanelComponent,
    EditSemesterDialogComponent,
    EditPathModuleDialogComponent,
    PublicationsComponent,
    AboutComponent,
    ModuleDetailsDialogComponent,
    StudyPlanSemesterComponent,
    PrivacyComponent,
    HintComponent,
    ImportDialogComponent,
    ExportDialogComponent,
    ActivateStudyPlanDialogComponent,
    LinkifyPipe,
    SelectSemesterDialogComponent,
    UserProfileComponent,
    UserFormComponent,
    ProgressBarComponent,
    UploadStudentDataDialogComponent,
    UploadDataPrivacyComponent,
    DropZoneComponent,
    EditGradeDialogComponent,
    UploadStudentDataStepperComponent,
    ChangeModuleGroupDialogComponent,
    EvaluationDialogComponent,
    ModuleGroupWizardComponent,
    SemesterDatesComponent,
    FullCalendarComponent,
    CourseDetailsDialogComponent,
    SelectOptionDialog,
    QuickLinksComponent,
    HelpComponent,
    GradePointAverageComponent,
    TooltipDirective,
    HoverTrackerDirective,
    CourseLangPipe,
    CourseFormatPipe,
    LoginComponent,
    ProfileMenuComponent,
    MaintenanceMessageComponent,
    GroupNavigationComponent,
    UserDataComponent,
    StudyPathUpdateComponent,
    ResolveCollisionDialogComponent,
    CourseDetailsComponent,
    FinishSemesterStepperComponent,
    ModuleDataComponent,
    ModuleFeedbackComponent,
    ReloadDialogComponent,
    SemesterHeaderComponent,
    SemesterBodyComponent,
    SemesterCardComponent,
    RecsModuleListComponent,
    TopicChipComponent,
    RecommendationComponent,
    TopicSettingsComponent,
    JobCardComponent,
    JobSettingsComponent,
    NotificationDialogComponent,
    DependencyGraphComponent,
    DemoUserDialogComponent,
    HintsSidenavComponent,
    NotFoundComponent,
    RecommendationsListComponent,
    PersonalisationStatusComponent,
    WordCloudComponent,
    DataPreviewComponent,
    SettingsListComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDialogModule,
    MatTabsModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatCheckboxModule,
    DragDropModule,
    MatStepperModule,
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    EffectsModule.forRoot([]),
    StoreModule.forFeature(fromUser.userFeatureKey, fromUser.reducer),
    EffectsModule.forFeature([
      UserEffects,
      ModuleOverviewEffects,
      StudyPlanningEffects,
      ErrorEffects,
    ]),
    StoreModule.forFeature(
      fromModuleOverview.moduleOverviewFeatureKey,
      fromModuleOverview.reducer
    ),
    StoreModule.forFeature(fromDialog.dialogFeatureKey, fromDialog.reducer),
    StoreModule.forFeature(
      fromStudyPlanning.studyPlanningFeatureKey,
      fromStudyPlanning.reducer
    ),
    StoreModule.forFeature(
      fromSearchSettings.searchSettingsFeatureKey,
      fromSearchSettings.reducer
    ),
    StoreModule.forFeature(
      fromEvaluation.evaluationFeatureKey,
      fromEvaluation.reducer
    ),
    MatExpansionModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatCardModule,
    environment.imports,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatMenuModule,
    MatChipsModule,
    MatSidenavModule,
    MatInputModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    MatPaginatorModule,
    SharedModule,
    MatRadioModule,
    CustomIconsModule,
    MatTabsModule,
    FullCalendarModule,
    MatTreeModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
    {
      provide: ErrorHandler,
      useValue: createErrorHandler({
        showDialog: false, // true would show feedback dialog to
      }),
    },
    {
      provide: TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => { },
      deps: [TraceService],
      multi: true,
    },
  ],
})
export class AppModule {
  constructor(@Inject(LOCALE_ID) locale: string) {
    registerLocaleData(localeDe);
  }
}
