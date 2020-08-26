import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupComponent } from './pages/setup.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SetupRoutingModule } from './setup-routing.module';
import { CoreModule } from 'src/app/core/core.module';


@NgModule({
  declarations: [SetupComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    SetupRoutingModule
  ],
  providers:[
    
  ],
  exports: [
    SetupComponent
  ],
  bootstrap: [SetupComponent]
})
export class SetupModule { }
