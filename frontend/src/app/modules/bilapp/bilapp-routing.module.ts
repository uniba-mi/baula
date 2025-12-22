import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompetenceDashboardComponent } from './competence-dashboard/competence-dashboard.component';
import { BilappGuard } from './guards/bilapp-guard';

const bilappRoutes: Routes = [
  { 
    path: '',
    canActivate: [BilappGuard],
    component: CompetenceDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(bilappRoutes)],
  exports: [RouterModule]
})

export class BilappRoutingModule { }
