import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastController } from '@ionic/angular';
import { LoaderService } from 'src/app/services/loader.service';
import { CustomSerialService, BluetoothService, SerialData } from 'src/app/services/services';
import { StatusService } from '../../../services/status.service';

@Component({
  selector: 'app-web-server',
  templateUrl: './web-server.component.html',
  styleUrls: ['./web-server.component.scss'],
})
export class WebServerComponent implements OnInit {

  cleanSupportURL: SafeResourceUrl;

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

  constructor(    
    private customSerialService: CustomSerialService,
    private bluetooth: BluetoothService, 
    private toastCtrl: ToastController, 
    public loaderService: LoaderService,
    private statusService: StatusService,
    public sanitizer: DomSanitizer
  ) {
    this.cleanSupportURL = this.sanitizer.bypassSecurityTrustResourceUrl(`http://${this.statusService.state.localIp}`);
   }

  ngOnInit() {
    this.title = "WEB SERVER";
    this.customSerialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
      }).catch(() => { console.log('ERROR getting SerialData') });
    }, 100);
  }

  enableWebServer(){
    this.presentToast("Creating Web Server");
    this.loaderService.presentLoading('Creating Web Server...');
    this.customSerialService.sendData("CREATE_WEB_SERVER");
    this.sendMessageByBluetooth("CREATE_WEB_SERVER");
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        if(this.serialData.fullStr.indexOf("[ESP_NET] - WEB SERVER ENABLED")>-1){
          this.presentToast("WEB SERVER CREATED");
          this.statusService.state.webServerEnabled = true;
          this.loaderService.hideLoading();
          this.serialData.fullStr = "";
          return;
        }
      }).catch(() => { console.log("ERROR") })
    }, 100);
  }

  disableWebServer(){
    this.presentToast("Closing Web Server");
    this.loaderService.presentLoading('Closing Web Server...');
    this.customSerialService.sendData("CLOSE_WEB_SERVER");
    this.sendMessageByBluetooth("CLOSE_WEB_SERVER");
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
        if(this.serialData.fullStr.indexOf("[ESP_NET] - WEB SERVER CLOSED")>-1){
          this.presentToast("WEB SERVER CLOSED");
          this.statusService.state.webServerEnabled = false;
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
        this.serialData.lastStr = data;
      } else {
        this.presentToast(data);
      }
    });
  }

  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }

  navigateWebServer(){
    //return this.sanitizer.bypassSecurityTrustResourceUrl("//192.168.1.17");
  }

}
