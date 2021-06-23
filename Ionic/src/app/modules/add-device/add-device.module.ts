import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDeviceRoutingModule } from './add-device-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddDeviceComponent } from './pages/add-device.component';



@NgModule({
  declarations: [AddDeviceComponent],
  imports: [
    CommonModule,
    AddDeviceRoutingModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AddDeviceModule { }
