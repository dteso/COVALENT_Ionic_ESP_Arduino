import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemDetailRoutingModule } from './system-detail-routing.module';
import { IonicModule } from '@ionic/angular';
import { SystemDetailComponent } from './pages/system-detail.component';
import { GaugeModule } from 'angular-gauge';


@NgModule({
  declarations: [SystemDetailComponent],
  imports: [
    CommonModule,
    SystemDetailRoutingModule,
    IonicModule,
    GaugeModule.forRoot()
  ]
})
export class SystemDetailModule { }
