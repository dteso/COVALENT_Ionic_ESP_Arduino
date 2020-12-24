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
import { Serial } from '@ionic-native/serial/ngx';
import { SerialTabsModule } from './modules/serial-terminal/pages/serial-tabs.module';
import { NetworkModule } from './modules/network/pages/network.module';
import { NetworkService } from './services/services';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import { IMqttServiceOptions } from 'ngx-mqtt/lib/mqtt.model';
import { MqttModule } from 'ngx-mqtt';


export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'test.mosquitto.org',
  port: 8080, //Es el puerto sin seguridad para conexión mediante shockets
  path: '/mqtt'
}


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    CoreModule,
    SerialTabsModule,
    NetworkModule,
    AppRoutingModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    StorageService,
    BluetoothService,
    NetworkService,
    WifiWizard2,
    Serial,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
