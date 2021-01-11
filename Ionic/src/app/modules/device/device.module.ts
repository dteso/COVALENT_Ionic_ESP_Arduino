import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceComponent } from './device.component';
import { DeviceRoutingModule } from './device-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [DeviceComponent],
  imports: [
    CommonModule,
    FormsModule,
    DeviceRoutingModule,
    IonicModule
  ]
})
export class DeviceModule { }
