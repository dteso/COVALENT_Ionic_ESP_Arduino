import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WifiLoggerComponent } from './wifi-logger.component';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [WifiLoggerComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: WifiLoggerComponent}])
  ]
})
export class WifiLoggerModule { }
