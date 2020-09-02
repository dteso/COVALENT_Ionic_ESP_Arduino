import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteComponent } from './palette.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [PaletteComponent],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([{ path: '', component: PaletteComponent }])
  ]
})
export class PaletteModule { }
