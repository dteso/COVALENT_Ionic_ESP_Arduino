import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EepromComponent } from './pages/eeprom.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from 'src/app/core/core.module';
import { EepromRoutingModule } from './eeprom-routing.module';



@NgModule({
  declarations: [EepromComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    EepromRoutingModule
  ],
  providers:[
    
  ],
  exports: [
    EepromComponent
  ],
  bootstrap: [EepromComponent]
})
export class EepromModule { }
