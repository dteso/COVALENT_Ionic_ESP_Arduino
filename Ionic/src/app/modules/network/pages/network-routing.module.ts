
import { NgModule } from '@angular/core';
import { NetworkComponent } from './network.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'network',
    component: NetworkComponent,
    children: [
      {
        path: 'wifi',
        children: [
          {
            path: '',
            loadChildren: '../components/wifi-logger/wifi-logger.module#WifiLoggerModule'
          }
        ]
      },
      {
        path: 'radio',
        children: [
          {
            path: '',
            loadChildren: '../components/access-point/access-point.module#AccessPointModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../components/network-settings/network-settings.module#NetworkSettingsModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/network/wifi',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/network/terminal-tabs/wifi',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetworkRoutingModule { } { }