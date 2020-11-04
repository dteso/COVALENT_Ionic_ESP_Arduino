import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CustomSerialService, SerialData } from 'src/app/services/services';

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
    fullStr: '',
    codeInput: '',
    message: '',
  };
  title;


  constructor(private customSerialService: CustomSerialService, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.title = "EEPROM";

    this.customSerialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        console.log('New serial Data OK!')
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  clearEeprom() {
    this.presentToast("Deleting EEPROM...");
    this.customSerialService.sendData("MEM_RST");
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        if(this.serialData.fullStr.indexOf("[ESP-EEPROM] - Memory formatted")>-1){
          this.presentToast("EEPROM Deleted");
          this.serialData.fullStr = "";
          return;
        }
      }).catch(() => { console.log("ERROR") })
    }, 100);
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
