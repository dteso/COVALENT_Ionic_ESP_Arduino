import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupComponent } from './pages/setup.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SetupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetupRoutingModule { }
