import { NgModule } from '@angular/core';
import { MqttClientComponent } from './mqtt-client.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: MqttClientComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MqttClientRoutingModule { }
