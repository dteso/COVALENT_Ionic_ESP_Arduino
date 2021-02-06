import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SerialData, State } from 'src/app/services/models';
import { BluetoothService, CustomSerialService, StorageService } from 'src/app/services/services';
import { StatusService } from '../../services/status.service';
import { MQTT_SERVICE_OPTIONS } from '../mqtt-client/components/mqtt-options';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit {

  count = 0;

  message = '';
  messages = [];
  fullData = '';

  readingData = false;
  showNameDeviceInput = false;
  deviceName = '';

  options = MQTT_SERVICE_OPTIONS;

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    lastStr: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };

  constructor(
    private bluetooth: BluetoothService,
    private serialService: CustomSerialService,
    private toastCtrl: ToastController,
    private storage: StorageService,
    private statusService: StatusService,
    private customSerialService: CustomSerialService
  ) { }

  ngOnInit() {
    this.serialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        if(this.serialData.lastStr){
          this.decodeData(this.serialData.lastStr);
        }
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  ionViewDidEnter() {
    if (this.statusService.state.bluetoothConnected) {
      this.readingData = true;
      setTimeout(()=>{
        if(this.readingData){
          // Mandamos caracter en blanco para continuar la comunicación si ha exisitido alguna ausencia de respuesta
          this.sendMessageByBluetooth(" ");
        }
      }, 10000);
    }
    this.sendMessageByBluetooth(">>>READ_STATUS");
    this.customSerialService.sendData(">>>READ_STATUS");
    this.deviceName = this.statusService.state.name;
  }

  /**
* Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
*/
  sendMessageByBluetooth(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        this.serialData.fullStr += data;
        this.serialData.lastStr = data;
        if(data){
          this.decodeData(data);
        }
      } else {
        this.statusService.state.bluetoothConnected = false;
        this.presentToast('NO DEVICES CONNECTED', "danger");
      }
    });
  }

  decodeData(msg: string) {
    if(msg!=='' && this.statusService.state.bluetoothConnected){
      //this.statusService.state.bluetoothConnected = true;
      this.storage.getBluetoothId().then( res => {
        this.statusService.state.bluetoothId = res;
      });
    }
    if (msg.indexOf('[ESP_NET] - STATUS_READ_START') > -1) {
      this.readingData = true;
    }
    if (msg.indexOf('[ESP_NET] - STATUS_READ_END') > -1) {
      this.readingData = false;
    }
    if (msg.indexOf('[ESP-NET] - STA_STATUS_OK') > -1) {
      this.statusService.state.wifiConnected = true;
    }
    if (msg.indexOf('[ESP-NET] - STA_STATUS_KO') > -1) {
      this.statusService.state.wifiConnected = false;
    }
    if (msg.indexOf('[ESP-NET] - BOARD: ') > -1) {
      this.statusService.state.mcu = msg.substring(msg.indexOf("[ESP-NET] - BOARD: ") + 19, msg.length);
    }
    if (msg.indexOf('[ESP-NET] - LOCAL IP: ') > -1) {
      this.statusService.state.localIp = msg.substring(msg.indexOf("[ESP-NET] - LOCAL IP: ") + 22, msg.length);
    }
    if (msg.indexOf('[ESP-NET] - STA: ') > -1) {
      this.statusService.state.wifiSSID = msg.substring(msg.indexOf("[ESP-NET] - STA: ") + 17, msg.length);
    }
    if (msg.indexOf('[ESP-NTP] - TIME: ') > -1) {
      this.statusService.state.ntpData = msg.substring(msg.indexOf("[ESP-NTP] - TIME: ") + 18, msg.length);
    }
    if (msg.indexOf('[ESP-DHT] - HUM: ') > -1) {
      this.statusService.state.humidity = msg.substring(msg.indexOf("[ESP-DHT] - HUM: ") + 17, msg.length);
    }
    if (msg.indexOf('[ESP-DHT] - TEMP: ') > -1) {
      this.statusService.state.temperature = msg.substring(msg.indexOf("[ESP-DHT] - TEMP: ") + 18, msg.length);
    }
    if (msg.indexOf('[ESP-NTP] - NTP ENABLED') > -1) {
      this.statusService.state.ntpEnabled = true;
    }
    if (msg.indexOf('[ESP-SYS] - DEVICE_MAC: ') > -1) {
      this.statusService.state.deviceMAC = msg.substring(msg.indexOf("[ESP-SYS] - DEVICE_MAC: ") + 24, msg.length);
    }
    if (msg.indexOf('[ESP-NET] - DEVICE_NAME: ') > -1) {
      this.statusService.state.name = msg.substring(msg.indexOf("[ESP-SYS] - DEVICE_NAME: ") + 25, msg.length);
    }
    if (msg.indexOf('[ESP-NET] - MQTT_SERVER: ') > -1) {
      this.statusService.state.mqttServer = msg.substring(msg.indexOf("[ESP-SYS] - MQTT_SERVER: ") + 25, msg.length);
      this.options.hostname = this.statusService.state.mqttServer;
    }
    if (msg.indexOf('[ESP-NET] - MQTT_PORT: ') > -1) {
      this.statusService.state.mqttPort = msg.substring(msg.indexOf("[ESP-SYS] - MQTT_PORT: ") + 23, msg.length);
      this.options.port = parseInt(this.statusService.state.mqttPort, 10);
    }
    if (msg.indexOf('[ESP-NET] - WEB_SERVER_STATUS: ') > -1) {
      let webServerStatus = 0;
      webServerStatus = parseInt(msg.substring(msg.indexOf("[ESP-NET] - WEB_SERVER_STATUS: ") + 31, msg.length), 10);
      webServerStatus === 1 ? this.statusService.state.webServerEnabled = true : this.statusService.state.webServerEnabled = false;
    }
  }

  /**
 * Recupera la información básica del servidor para las graficas de lineas.
 * @param message
 */
  addLine(message) {
    this.messages.push(message);
  }

  /**
 * Presenta un cuadro de mensaje.
 * @param {string} text Mensaje a mostrar.
 */
  async presentToast(text: string, color:string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: color
    });
    await toast.present();
  }

  async storeConfig() {
    this.statusService.state.name = this.deviceName;
    this.showNameDeviceInput = !this.showNameDeviceInput;
    this.statusService.state.name = this.deviceName;
    this.sendMessageByBluetooth(">>>DEVICE_NAME: "+ this.deviceName);
    this.customSerialService.sendData(">>>DEVICE_NAME: " + this.deviceName);
    await this.storage.setDevice(this.statusService.state).then(res => 
      {
        console.log(res);
        this.presentToast("NEW DEVICE ADDED !!!", "success");
      })
      .catch(err => console.log("ERROR: ", err));
  }


}
