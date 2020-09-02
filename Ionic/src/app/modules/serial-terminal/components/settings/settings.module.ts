import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: SettingsComponent }])
  ]
})
export class SettingsModule { }
