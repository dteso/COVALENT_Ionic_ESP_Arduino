import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from 'src/app/core/core.module';
import { RouterModule } from '@angular/router';
import { AccessPointComponent } from './access-point.component';



@NgModule({
  declarations: [AccessPointComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: AccessPointComponent}])
  ]
})
export class AccessPointModule { }
