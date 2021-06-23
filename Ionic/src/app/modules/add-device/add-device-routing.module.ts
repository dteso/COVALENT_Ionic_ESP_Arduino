import { NgModule } from '@angular/core';
import { AddDeviceComponent } from './pages/add-device.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: AddDeviceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDeviceRoutingModule { }
