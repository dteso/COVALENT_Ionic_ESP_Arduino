import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NetworkRoutingModule } from './network-routing.module';
import { NetworkComponent } from './network.component';



@NgModule({
  declarations: [NetworkComponent],
  imports: [
    CommonModule,
    IonicModule,
    CommonModule,
    FormsModule,
    NetworkRoutingModule
  ]
})
export class NetworkModule { }
