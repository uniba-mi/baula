import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnivisHelperRoutingModule } from './univis-helper-routing.module';
import { UnivisHelperComponent } from './univis-helper.component';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TextFieldModule} from '@angular/cdk/text-field';
import { CompetenceFormComponent } from './competence-form/competence-form.component';
import { ModuleFormComponent } from './module-form/module-form.component';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { UnivISHelperDialogComponent } from './dialog/univis-helper-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    UnivisHelperComponent,
    CompetenceFormComponent,
    ModuleFormComponent,
    UnivISHelperDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UnivisHelperRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    TextFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatTabsModule,
    MatDialogModule, 
    MatAutocompleteModule,
    MatSnackBarModule,
    SharedModule
  ]
})
export class UnivisHelperModule { }
