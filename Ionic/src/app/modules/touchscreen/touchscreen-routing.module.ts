import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TouchscreenComponent } from './pages/touchscreen.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: TouchscreenComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TouchscreenRoutingModule { }
