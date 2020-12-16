import { Injectable } from '@angular/core';
import { State } from './models';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  state:State = {
    wifiConnected: false,
    wifiEnabled: false,
    serialConnected: false,
    serialEnabled: false,
    bluetoothConnected: false,
    bluetoothEnabled: false,
    localIp: '',
    wifiSSID: '',
    mcu:'',
    webServerEnabled: false,
    ntpEnabled: false,
    ntpData: '',
    temperature: '',
    humidity: ''  
  };

  constructor() { }

  setBluetoothConnected(connected: boolean){
    this.state.bluetoothConnected = connected;
  }

  getBluetoothConnectionStatus(){
    return this.state.bluetoothConnected;
  }

  setLocalIp(ip: string){
    this.state.localIp = ip;
  }

  setSSID(ssid: string){
    this.state.wifiSSID = ssid;
  }

  setWifiConnected(connected: boolean){
    this.state.wifiConnected = connected;
  }

  getWifiConnectionStatus(){
    return this.state.wifiConnected;
  }

  setSerialConnected(connected: boolean){
    this.state.serialConnected=connected;
  }
}
