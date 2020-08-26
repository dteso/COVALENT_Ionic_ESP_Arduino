import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';

import { IonicStorageModule } from '@ionic/storage';
import { StorageService } from './services/storage.service';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BluetoothService } from './services/bluetooth.service';




@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    CoreModule,
    AppRoutingModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    StorageService,
    BluetoothService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
