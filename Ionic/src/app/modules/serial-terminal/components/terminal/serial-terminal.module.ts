import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalComponent } from './serial-terminal.component';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConsoleModule } from 'src/app/shared/components/console/console.module';

@NgModule({
  declarations: [SerialTerminalComponent],
  imports: [
    CommonModule,
    IonicModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: SerialTerminalComponent}]),
    ConsoleModule
  ]
})
export class SerialTerminalModule { }
