import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import * as fromSemesterPlanning from '../../reducers/semester-planning.reducer';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AimModalModule } from '../aim-modal/aim-modal.module';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTreeModule} from '@angular/material/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SharedModule } from '../shared/shared.module';
import {MatRadioModule} from '@angular/material/radio';
import { RecsRoutingModule } from './recs-routing.module';
import { RecModuleCardComponent } from './rec-sidenav/rec-module-card/rec-module-card.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    RecModuleCardComponent,
  ],
  imports: [
    CommonModule,
    RecsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature(
      fromSemesterPlanning.semesterPlanningFeatureKey,
      fromSemesterPlanning.reducer
    ),
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    AimModalModule, 
    MatDialogModule, 
    MatTreeModule,
    MatCheckboxModule, 
    SharedModule,
    MatRadioModule
  ],
  exports: [
    RecModuleCardComponent
  ]
})
export class RecsModule { }
