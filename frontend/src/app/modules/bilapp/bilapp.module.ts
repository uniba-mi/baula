import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BilappRoutingModule } from './bilapp-routing.module';
import { CompetenceDashboardComponent } from './competence-dashboard/competence-dashboard.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromStandard from './state/reducer/standard.reducer';
import * as fromCourse from './state/reducer/course.reducers';
import { StandardEffects } from './state/effects/standard.effects';
import { SidepanelComponent } from './competence-dashboard/sidepanel/sidepanel.component';
import { CompetenceVisualizationComponent } from './competence-dashboard/competence-visualization/competence-visualization.component';
import { StandardComponent } from './competence-dashboard/competence-visualization/standard/standard.component';
import { SettingsComponent } from './competence-dashboard/sidepanel/settings/settings.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AllCoursesComponent } from './competence-dashboard/sidepanel/courses/all-courses/all-courses.component';
import { CourseListComponent } from './competence-dashboard/sidepanel/courses/course-list/course-list.component';
import { RecommendationsComponent } from './competence-dashboard/sidepanel/courses/recommendations/recommendations.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CoursesComponent } from './competence-dashboard/sidepanel/courses/courses.component';
import { SearchCoursesComponent } from './competence-dashboard/sidepanel/courses/search-courses/search-courses.component';
import { CourseItemComponent } from './competence-dashboard/sidepanel/courses/course-list/course-item/course-item.component';
import { ShortenCourseTypePipe } from './pipes/shorten-course-type.pipe';
import * as fromStudyPlanning from '../../reducers/study-planning.reducers';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompvisModule } from '../compvis/compvis.module';
import { CourseEffects } from './state/effects/course.effects';
import { AimModalModule } from '../aim-modal/aim-modal.module';
import { WelcomeDialogComponent } from './dialogs/welcome-dialog/welcome-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTreeModule} from '@angular/material/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SharedModule } from '../shared/shared.module';
import {MatRadioModule} from '@angular/material/radio';


@NgModule({
  declarations: [
    CompetenceDashboardComponent,
    SidepanelComponent,
    CompetenceVisualizationComponent,
    StandardComponent,
    CoursesComponent,
    SettingsComponent,
    AllCoursesComponent,
    CourseListComponent,
    RecommendationsComponent,
    SearchCoursesComponent,
    CourseItemComponent,
    ShortenCourseTypePipe,
    WelcomeDialogComponent,
  ],
  imports: [
    CommonModule,
    BilappRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature('standard', fromStandard.reducer),
    StoreModule.forFeature('course', fromCourse.reducer),
    StoreModule.forFeature(
      fromStudyPlanning.studyPlanningFeatureKey,
      fromStudyPlanning.reducer
    ),
    EffectsModule.forFeature([StandardEffects, CourseEffects]),
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    CompvisModule,
    AimModalModule, 
    MatDialogModule, 
    MatTreeModule,
    MatCheckboxModule, 
    SharedModule,
    MatRadioModule
  ],
  exports: [
    CompetenceDashboardComponent
  ]
})
export class BilappModule { }
