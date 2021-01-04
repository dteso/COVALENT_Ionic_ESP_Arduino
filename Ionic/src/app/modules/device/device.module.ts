import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceComponent } from './device.component';
import { DeviceRoutingModule } from './device-routing.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [DeviceComponent],
  imports: [
    CommonModule,
    DeviceRoutingModule,
    IonicModule
  ]
})
export class DeviceModule { }
