import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompulsoryModuleComponent } from './compulsory-module/compulsory-module.component';

@NgModule({
  declarations: [
    CompulsoryModuleComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CompulsoryModuleComponent
  ]
})
export class CustomIconsModule { }
