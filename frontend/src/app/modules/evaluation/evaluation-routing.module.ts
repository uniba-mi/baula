import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EvaluationComponent } from './evaluation.component';

const routes: Routes = [
  { path: '', component: EvaluationComponent },
  { path: 'init', component: EvaluationComponent } // delete when candidates have been initialized once
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EvaluationRoutingModule { }
