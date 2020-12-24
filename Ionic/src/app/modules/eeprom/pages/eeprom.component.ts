import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { LoaderService } from 'src/app/services/loader.service';
import { BluetoothService, CustomSerialService, SerialData } from 'src/app/services/services';
import { StatusService } from '../../../services/status.service';

@Component({
  selector: 'app-eeprom',
  templateUrl: './eeprom.component.html',
  styleUrls: ['./eeprom.component.scss'],
})
export class EepromComponent implements OnInit {

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    lastStr: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };
  title;
  percentageLoad: number;
  percentageIndex: number;
  showProgress: boolean;


  constructor(
    private customSerialService: CustomSerialService,
    private bluetooth: BluetoothService, 
    private toastCtrl: ToastController, 
    public loaderService: LoaderService) {}

  ngOnInit() {
    this.title = "EEPROM";
    this.customSerialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  clearEeprom() {
    this.presentToast("Deleting EEPROM...");
    this.showProgress=true;
    this.loaderService.presentLoading('Borrando EEPROM. Espere');
    this.customSerialService.sendData("MEM_RST");
    this.sendMessageByBluetooth("MEM_RST");
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        if(this.serialData.fullStr.indexOf("[ESP-EEPROM] - Memory formatted")>-1){
          this.presentToast("EEPROM Deleted");
          this.showProgress=false;
          this.loaderService.hideLoading();
          this.serialData.fullStr = "";
          return;
        }
      }).catch(() => { console.log("ERROR") })
    }, 100);
  }

  
  sendMessageByBluetooth(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        this.serialData.fullStr+= data;
        let percentagePos
        if(percentagePos = data.indexOf('%')>-1){
          this.serialData.lastStr = data;
          this.percentageLoad =  parseInt(data.substring(0,data.length-1),10);
          this.percentageIndex = this.percentageLoad / 100.00;
        }
      } else {
        this.presentToast(data);
        this.showProgress=false;
      }
    });
  }

  viewMap() {
    console.log("View memory map");
  }

  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }

}
