import { IfStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { CustomSerialService, NetworkService, SerialData } from 'src/app/services/services';

@Component({
  selector: 'app-wifi-logger',
  templateUrl: './wifi-logger.component.html',
  styleUrls: ['./wifi-logger.component.scss'],
})
export class WifiLoggerComponent implements OnInit {

  connected = false;

  private wifiForm: FormGroup;

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };

  constructor(private formBuilder: FormBuilder, private networkService: NetworkService, private customSerialService: CustomSerialService,  private toastCtrl: ToastController) {
    this.wifiForm = this.formBuilder.group({
      ssid: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.networkService.getSSID().then(res => {
      if (res) {
        this.connected = true;
        console.log('got SSID!');
      }
      this.wifiForm.controls.ssid.setValue(res);
    });


    this.customSerialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        console.log('New serial Data OK!');
        if(this.serialData.fullStr.indexOf("[ESP-NET] - WIFI CONNECTION SUCCESS")>-1){
          this.presentToast("Connected to "+this.wifiForm.controls.ssid.value);
          this.serialData.fullStr = "";
          return;
        }
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  sendSerialData() {
    this.customSerialService.sendData(">>>WIFI_SSID: " + this.wifiForm.controls.ssid.value);
    this.customSerialService.sendData("\n" + ">>>WIFI_PASS: " + this.wifiForm.controls.password.value);
  }

  logForm() {
    console.log(this.wifiForm.value);
    this.sendSerialData();
  }

  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }

}
