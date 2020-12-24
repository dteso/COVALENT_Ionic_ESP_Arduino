import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MqttClientRoutingModule } from './mqtt-client-routing.module';
import { MqttClientComponent } from './mqtt-client.component';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [MqttClientComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    MqttClientRoutingModule
  ],
  exports: [MqttClientComponent]
})
export class MqttClientModule { }
