import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalComponent } from './pages/serial-terminal.component';
import { SerialTerminalRoutingModule } from './serial-terminal-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [SerialTerminalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    SerialTerminalRoutingModule
  ],
  providers:[
    //Serial
  ],
  exports: [
    SerialTerminalComponent
  ],
  bootstrap: [SerialTerminalComponent]
})
export class SerialTerminalModule { }
