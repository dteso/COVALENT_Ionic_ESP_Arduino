import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TouchscreenRoutingModule } from './touchscreen-routing.module';
import { TouchscreenComponent } from './pages/touchscreen.component';
import { CoreModule } from 'src/app/core/core.module';
import { Keyboard } from '@ionic-native/keyboard/ngx';



@NgModule({
  declarations: [TouchscreenComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    TouchscreenRoutingModule
  ],
  providers: [
    Keyboard
  ]
})
export class TouchscreenModule { }
