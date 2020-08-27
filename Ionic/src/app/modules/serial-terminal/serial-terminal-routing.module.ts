import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalComponent } from './pages/serial-terminal.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: SerialTerminalComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SerialTerminalRoutingModule { }
