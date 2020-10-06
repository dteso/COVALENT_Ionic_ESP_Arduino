import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WifiLoggerComponent } from './wifi-logger.component';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [WifiLoggerComponent],
  imports: [
    CommonModule,
    IonicModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: WifiLoggerComponent}])
  ]
})
export class WifiLoggerModule { }
