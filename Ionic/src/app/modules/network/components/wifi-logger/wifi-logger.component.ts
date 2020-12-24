import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { BluetoothService, CustomSerialService, NetworkService, SerialData } from 'src/app/services/services';
import { StatusService } from '../../../../services/status.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-wifi-logger',
  templateUrl: './wifi-logger.component.html',
  styleUrls: ['./wifi-logger.component.scss'],
})
export class WifiLoggerComponent implements OnInit {

  connected = false;
  loading;
  errorCounter = 0;
  isLogging = false;
  mcuConnected = false;
  showConsole = true;
  localIp = '';

  private wifiForm: FormGroup;

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
    private formBuilder: FormBuilder,
    private networkService: NetworkService,
    private customSerialService: CustomSerialService,
    private bluetooth: BluetoothService,
    private statusService: StatusService,
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
      if (this.isLogging) {
        this.checkTimeout();
      } 
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        this.decodeSerialData();
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  checkTimeout() {
    if (this.errorCounter === 200) { // Controlando error en 20 segundos ( 200 ciclos de 100ms del interval)
      this.errorCounter = 0;
      this.isLogging = false;
      this.loaderService.hideLoading();
      this.presentToast("TIMEOUT ERROR. Check parameters and try again");
      this.mcuConnected = false;
      this.statusService.setLocalIp('');
      this.statusService.setSSID('');
      this.statusService.setWifiConnected(false);
    } else {
      this.errorCounter++;
    }
  }

  decodeSerialData() {
    if (this.serialData.fullStr.indexOf("[ESP-NET] - WIFI CONNECTION SUCCESS") > -1) {
      this.loaderService.hideLoading();
      this.mcuConnected = true;
      this.statusService.setWifiConnected(true);
      this.serialData.fullStr = "";
      this.isLogging = false;
      this.presentToast("Connected to " + this.wifiForm.controls.ssid.value + "!!!");
    } else if (this.serialData.fullStr.indexOf("[ESP-NET] - WIFI CONNECTION ERROR") > -1) {
      this.loaderService.hideLoading();
      this.mcuConnected = false;
      this.statusService.setWifiConnected(false);
      this.statusService.setLocalIp('');
      this.statusService.setSSID('');
      this.presentToast("CONNECTION ERROR. Check parameters and try again");
      this.serialData.fullStr = "";
      this.isLogging = false;
    } else if (this.serialData.lastStr.indexOf("[ESP-NET] - LOCAL IP:") > -1) {
      this.localIp = this.serialData.lastStr.substring(this.serialData.lastStr.indexOf("[ESP-NET] - LOCAL IP:")+21,this.serialData.lastStr.length);
      if(this.localIp!=''){
        this.mcuConnected=true;
        this.statusService.setWifiConnected(true);
        this.statusService.setLocalIp(this.localIp);
        this.statusService.setSSID(this.wifiForm.controls.ssid.value);
      }
      this.serialData.fullStr = "";
     }
  }

  sendSerialData() {
    this.isLogging = true;
    if (this.serialData.connected) {
      this.customSerialService.sendData(">>>WIFI_SSID: " + this.wifiForm.controls.ssid.value);
      this.customSerialService.sendData("\n" + ">>>WIFI_PASS: " + this.wifiForm.controls.password.value);
    } else {
      this.sendMessageByBluetooth(">>>WIFI_SSID: " + this.wifiForm.controls.ssid.value);
      this.sendMessageByBluetooth("\n" + ">>>WIFI_PASS: " + this.wifiForm.controls.password.value);
    }
    this.presentToast("Connecting to " + this.wifiForm.controls.ssid.value + "...");
    this.loaderService.presentLoading('(STA Mode) Conectando a red WiFi..');
  }

  sendMessageByBluetooth(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        this.serialData.fullStr += data;
        this.serialData.lastStr = data;
        this.decodeSerialData();
      } else {
        this.presentToast(data);
      }
    });
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
