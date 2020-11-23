export interface BluetoothId {
  name: string;
  id: string;
  address: string;
  uuid?: string;
  class: string;
  rssi: string;
}

export interface SerialData {
  data : string;
  connected : boolean;
  str:string;
  lastStr: string,
  fullStr : string;
  codeInput: string;
  message: string;
};

export interface State {
  wifiEnabled : boolean;
  wifiConnected: boolean;
  serialEnabled: boolean;
  serialConnected: boolean;
  bluetoothEnabled: boolean;
  bluetoothConnected: boolean;
};