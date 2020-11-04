import { NgModule } from '@angular/core';
import { EepromComponent } from './pages/eeprom.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: EepromComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EepromRoutingModule { }
