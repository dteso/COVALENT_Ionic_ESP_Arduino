import { NgModule } from '@angular/core';
import { WebServerComponent } from './pages/web-server.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: WebServerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebServerRoutingModule { }
