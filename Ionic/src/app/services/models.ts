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
  fullStr : string;
  codeInput: string;
  message: string;
};