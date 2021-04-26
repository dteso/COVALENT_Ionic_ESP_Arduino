import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then( m => m.HomeModule)
  },
  {
    path: 'device',
    loadChildren: () => import('./modules/device/device.module').then( m => m.DeviceModule)
  },
  {
    path: 'touchscreen',
    loadChildren: () => import('./modules/touchscreen/touchscreen.module').then( m => m.TouchscreenModule)
  },
  {
    path: 'setup',
    loadChildren: () => import('./modules/setup/setup.module').then( m => m.SetupModule)
  },
  {
    path: 'terminal-tabs',
    loadChildren: () => import('./modules/serial-terminal/pages/serial-tabs.module').then( m => m.SerialTabsModule)
  },
  {
    path: 'network',
    loadChildren: () => import('./modules/network/pages/network.module').then( m => m.NetworkModule)
  },
  {
    path: 'eeprom',
    loadChildren: () => import('./modules/eeprom/eeprom.module').then( m => m.EepromModule)
  },
  {
    path: 'web-server',
    loadChildren: () => import('./modules/web-server/web-server.module').then( m => m.WebServerModule)
  },
  {
    path: 'weather',
    loadChildren: () => import('./modules/weather/weather.module').then( m => m.WeatherModule)
  },
  {
    path: 'mqtt-client',
    loadChildren: () => import('./modules/mqtt-client/pages/mqtt-client.module').then( m => m.MqttClientModule)
  },
  {
    path: 'system',
    loadChildren: () => import('./modules/system/system.module').then( m => m.SystemModule)
  },
  {
    path: 'add-system',
    loadChildren: () => import('./modules/add-system/add-system.module').then( m => m.AddSystemModule)
  },
  {
    path: 'system-detail/:id',
    loadChildren: () => import('./modules/system-detail/system-detail.module').then( m => m.SystemDetailModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
