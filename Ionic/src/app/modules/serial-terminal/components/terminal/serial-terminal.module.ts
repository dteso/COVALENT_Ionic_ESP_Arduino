import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalComponent } from './serial-terminal.component';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [SerialTerminalComponent],
  imports: [
    CommonModule,
    IonicModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: SerialTerminalComponent}])
  ]
})
export class SerialTerminalModule { }
