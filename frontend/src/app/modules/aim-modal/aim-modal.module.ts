import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AimModalComponent } from './aim-modal/aim-modal.component';
import {MatTabsModule} from '@angular/material/tabs';
import { CompetenceTabComponent } from './competence-tab/competence-tab.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import { SharedModule } from '../shared/shared.module';
import {MatSliderModule} from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { CompetenceGroupPanelComponent } from './competence-group-panel/competence-group-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AimModalComponent,
    CompetenceTabComponent,
    CompetenceGroupPanelComponent,
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatDialogModule,
    MatExpansionModule,
    MatSliderModule,
    SharedModule,
    ReactiveFormsModule,
    MatTooltipModule
  ]
})
export class AimModalModule { }
