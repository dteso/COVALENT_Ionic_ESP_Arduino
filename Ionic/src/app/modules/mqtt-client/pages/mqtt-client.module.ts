import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MqttClientRoutingModule } from './mqtt-client-routing.module';



@NgModule({
  declarations: [],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MqttClientRoutingModule
  ]
})
export class MqttClientModule { }
