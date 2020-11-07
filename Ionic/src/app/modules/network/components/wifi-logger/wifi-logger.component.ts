import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { CustomSerialService, NetworkService, SerialData } from 'src/app/services/services';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-wifi-logger',
  templateUrl: './wifi-logger.component.html',
  styleUrls: ['./wifi-logger.component.scss'],
})
export class WifiLoggerComponent implements OnInit {

  connected = false;
  loading;
  errorCounter: number;
  isLogging = false;

  private wifiForm: FormGroup;

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private networkService: NetworkService,
    private customSerialService: CustomSerialService,
    private toastCtrl: ToastController,
    public loaderService: LoaderService
  ) {
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
      if(this.isLogging){
        this.checkTimeout();
      }
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        console.log('New serial Data OK!');
        this.decodeSerialData();
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  checkTimeout(){
    if (this.errorCounter === 100) { // Controlando error en 10 segundos ( 100 ciclos de 100ms del interval)
      this.errorCounter = 0;
      this.isLogging = false;
      this.loaderService.hideLoading();
      this.presentToast("Connection error. Check parameters and try again");
    } else {
      this.errorCounter++;
    }
  }

  decodeSerialData(){
    if(this.serialData.fullStr.indexOf("[ESP-NET] - WIFI CONNECTION SUCCESS") > -1) {
      this.loaderService.hideLoading();
      this.presentToast("Connected to " + this.wifiForm.controls.ssid.value + "!!!");
      this.serialData.fullStr = "";
      this.isLogging = false;
    }else if(this.serialData.fullStr.indexOf("[ESP-NET] - WIFI CONNECTION ERROR") > -1){
      this.loaderService.hideLoading();
      this.presentToast("Connection error. Check parameters and try again");
      this.serialData.fullStr = "";
      this.isLogging = false;
    }
  }

  sendSerialData() {
    this.customSerialService.sendData(">>>WIFI_SSID: " + this.wifiForm.controls.ssid.value);
    this.customSerialService.sendData("\n" + ">>>WIFI_PASS: " + this.wifiForm.controls.password.value);
    this.presentToast("Connecting to " + this.wifiForm.controls.ssid.value + "...");
    this.loaderService.presentLoading('(STA Mode) Conectando a red WiFi..');
    this.isLogging = true;
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
