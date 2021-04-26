import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSystemComponent } from './pages/add-system.component';
import { AddSystemRoutingModule } from './add-system-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AddSystemComponent],
  imports: [
    CommonModule,
    AddSystemRoutingModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AddSystemModule { }
