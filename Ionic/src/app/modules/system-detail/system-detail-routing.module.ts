import { NgModule } from '@angular/core';
import { SystemDetailComponent } from './pages/system-detail.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SystemDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemDetailRoutingModule { }
