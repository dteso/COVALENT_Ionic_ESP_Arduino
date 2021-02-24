import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemRoutingModule } from './system-routing.module';
import { IonicModule } from '@ionic/angular';
import { SystemComponent } from './pages/system.component';
import { GaugeModule } from 'angular-gauge';



@NgModule({
  declarations: [SystemComponent],
  imports: [
    CommonModule,
    SystemRoutingModule,
    IonicModule,
    GaugeModule.forRoot()
  ]
})
export class SystemModule { }
