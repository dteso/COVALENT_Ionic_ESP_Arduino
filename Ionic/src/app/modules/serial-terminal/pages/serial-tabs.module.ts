import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTabsComponent } from './serial-tabs.component';
import { SerialTabsRoutingModule } from './serial-tabs-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [SerialTabsComponent],
  imports: [
    CommonModule,
    IonicModule,
    CommonModule,
    FormsModule,
    SerialTabsRoutingModule
  ],
  //exports: [SerialTabsComponent]
})
export class SerialTabsModule { }
