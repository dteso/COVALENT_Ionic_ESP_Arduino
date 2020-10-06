import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { NetworkSettingsComponent } from './network-settings.component';



@NgModule({
  declarations: [NetworkSettingsComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: NetworkSettingsComponent}])
  ]
})
export class NetworkSettingsModule { }
