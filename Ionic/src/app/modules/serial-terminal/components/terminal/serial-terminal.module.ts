import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalComponent } from './serial-terminal.component';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [SerialTerminalComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: SerialTerminalComponent}])
  ]
})
export class SerialTerminalModule { }
