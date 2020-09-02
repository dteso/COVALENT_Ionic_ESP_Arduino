import { NgModule } from '@angular/core';
import { SerialTabsComponent } from './serial-tabs.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'terminal-tabs',
    component: SerialTabsComponent,
    children: [
      {
        path: 'serial',
        children: [
          {
            path: '',
            loadChildren: '../components/terminal/serial-terminal.module#SerialTerminalModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: '../components/settings/settings.module#SettingsModule'
          }
        ]
      },
      {
        path: 'palette',
        children: [
          {
            path: '',
            loadChildren: '../components/palette/palette.module#PaletteModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/terminal-tabs/serial',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/terminal-tabs/terminal-tabs/serial',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SerialTabsRoutingModule { }
