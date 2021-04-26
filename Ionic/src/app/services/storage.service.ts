import { Injectable } from '@angular/core';

//import { Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {

  BLUETOOTH_ID = 'bluetoothId';
  LANG = 'lang';
  DEVICES = 'devices';
  SYSTEMS = 'systems';
  devices = [];
  // Siempre debe haber un sistema por defecto
  systems = [
    {
      id: 0,
      name: 'General',
      ssid: 'Unknown',
      location: 'Not defined',
      description: 'DEFAULT SYSTEM'
    }
  ];

  constructor(
    //public events: Events,
    public storage: Storage
  ) {}
  /**
   * Devuelve el tipo de usuario.
   * @return {Promise<string | null>} bluetoothId.
   */
  async getBluetoothId(): Promise<string | null> {
    const bluetoothId = await this.storage.get(this.BLUETOOTH_ID);
    return (bluetoothId) ? bluetoothId : null;
  }
  /**
   * Almacena el tipo de usuario.
   * @param {string} bluetoothId
   */
  async setBluetoothId(bluetoothId: string): Promise<any> {
    return await this.storage.set(this.BLUETOOTH_ID, bluetoothId);
  }
  /**
   * Almacena el idioma selecionado por el usuario.
   * @param lang Nombre del usuario
   */
  async setLang(lang: string): Promise<any> {
    return await this.storage.set(this.LANG, lang);
  }
  /**
   * Devuelve el idioma selecionado por el usuario.
   * @return {Promise<string>} Nombre de usuario.
   */
  async getLang(): Promise<string> {
    return await this.storage.get(this.LANG);
  }

  async getDevices(): Promise<any>{
    return await this.storage.get(this.DEVICES);
  }

  async setDevice(device: any): Promise<any>{
    this.getBluetoothId().then(id => {
      device.bluetoothId = id;
    });
    this.getDevices().then(devs =>{
      if (devs){
        this.devices = devs;
      }
      this.devices.push(device);
      return this.storage.set(this.DEVICES, this.devices);
    });
  }

  async getSystems(): Promise<any>{
    return await this.storage.get(this.SYSTEMS);
  }

  async setSystem(system: any): Promise<any>{
    this.getSystems().then(systems =>{
      if (systems){
        this.systems = systems;
        system.id = systems.length;
      }else{
        system.id = 1;
      }
      this.systems.push(system);
      return this.storage.set(this.SYSTEMS, this.systems);
    });
  }
}
