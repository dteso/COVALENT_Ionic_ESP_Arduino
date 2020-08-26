import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'touchscreen',
    pathMatch: 'full'
  },
  {
    path: 'touchscreen',
    loadChildren: () => import('./modules/touchscreen/touchscreen.module').then( m => m.TouchscreenModule)
  },
  {
    path: 'setup',
    loadChildren: () => import('./modules/setup/setup.module').then( m => m.SetupModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
