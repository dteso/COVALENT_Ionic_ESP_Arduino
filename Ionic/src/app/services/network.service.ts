import { Injectable } from '@angular/core';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(private wifiWizard2: WifiWizard2) { }

  ssid;

  getSSID(){
    this.ssid = this.wifiWizard2.getConnectedSSID().then(res => this.ssid = res);
    return this.ssid;
  }
}
