import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatCompetencePipe } from './pipes/format-competence.pipe';
import { MarkdownPipe } from './pipes/mark-down.pipe';
import { SemesterPipe } from './pipes/semester.pipe';
import { SemesterShortPipe } from './pipes/semester-short.pipe';


@NgModule({
  declarations: [
    FormatCompetencePipe,
    MarkdownPipe,
    SemesterPipe,
    SemesterShortPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormatCompetencePipe,
    MarkdownPipe,
    SemesterPipe,
    SemesterShortPipe
  ]
})
export class SharedModule { }
