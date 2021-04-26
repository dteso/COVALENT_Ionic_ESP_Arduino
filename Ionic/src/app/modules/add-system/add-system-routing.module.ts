import { NgModule } from '@angular/core';
import { AddSystemComponent } from './pages/add-system.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: AddSystemComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddSystemRoutingModule { }
