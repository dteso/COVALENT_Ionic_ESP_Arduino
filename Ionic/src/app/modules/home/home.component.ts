import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SerialData, State } from 'src/app/services/models';
import { BluetoothService, CustomSerialService, NetworkService, StatusService } from 'src/app/services/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit{

  count = 0;

  message = '';
  messages = [];
  fullData='';

  readingData = false;

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
    private bluetooth : BluetoothService,
    private serialService: CustomSerialService,
    private toastCtrl: ToastController,
    private networkService: NetworkService,
    private statusService: StatusService,
    private customSerialService: CustomSerialService
  ) { }

  ngOnInit() {
    this.serialService.runSerialPort();
    setInterval(() => {
      // if (this.isLogging) {
      //   this.checkTimeout();
      // } 
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        console.log('New serial Data OK!');
        this.decodeData(this.serialData.lastStr);
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  ionViewDidEnter(){
    if(this.statusService.state.bluetoothConnected){
      this.readingData = true;
    }
    this.sendMessageByBluetooth(">>>READ_STATUS");
  }

      /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  sendMessageByBluetooth(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        this.serialData.fullStr += data;
        this.serialData.lastStr = data;
        this.decodeData(data);
      } else {
        this.statusService.state.bluetoothConnected = false;
        this.presentToast('NO DEVICES CONNECTED');
      }
    });
  }

  decodeData(msg: string){
    if(msg.indexOf('[ESP_NET] - STATUS_READ_START') > -1){
      this.readingData=true;
    }
    if(msg.indexOf('[ESP_NET] - STATUS_READ_END') > -1){
      this.readingData=false;
    }
    if(msg.indexOf('[ESP-NET] - STA_STATUS_OK') > -1){
      this.statusService.state.wifiConnected = true;
    }
    if(msg.indexOf('[ESP-NET] - BOARD: ') > -1){
      this.statusService.state.mcu = msg.substring(msg.indexOf("[ESP-NET] - BOARD: ")+19,msg.length);
    }
    if(msg.indexOf('[ESP-NET] - LOCAL IP: ') > -1){
      this.statusService.state.localIp = msg.substring(msg.indexOf("[ESP-NET] - LOCAL IP: ")+22,msg.length);
    }
    if(msg.indexOf('[ESP-NET] - STA: ') > -1){
      this.statusService.state.wifiSSID = msg.substring(msg.indexOf("[ESP-NET] - STA: ")+17,msg.length);
    }
    if(msg.indexOf('[ESP-NET] - WEB_SERVER_STATUS: ') > -1){
      let webServerStatus = 0;
      webServerStatus = parseInt(msg.substring(msg.indexOf("[ESP-NET] - WEB_SERVER_STATUS: ")+31,msg.length),10);
      webServerStatus === 1? this.statusService.state.webServerEnabled = true : this.statusService.state.webServerEnabled = false;
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
  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }


}
