import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemRoutingModule } from './system-routing.module';
import { IonicModule } from '@ionic/angular';
import { SystemComponent } from './pages/system.component';



@NgModule({
  declarations: [SystemComponent],
  imports: [
    CommonModule,
    SystemRoutingModule,
    IonicModule
  ]
})
export class SystemModule { }
