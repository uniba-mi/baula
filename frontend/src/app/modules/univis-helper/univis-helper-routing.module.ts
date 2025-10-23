import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnivisHelperComponent } from './univis-helper.component';

const routes: Routes = [{ path: '', component: UnivisHelperComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnivisHelperRoutingModule { }
