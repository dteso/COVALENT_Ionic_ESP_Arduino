import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { BluetoothService } from "src/app/services/bluetooth.service";
import { CustomSerialService } from "src/app/services/custom-serial.service";
import { LoaderService } from "src/app/services/loader.service";
import { SerialData } from "src/app/services/models";
import { NetworkService } from "src/app/services/network.service";
import { StatusService } from "src/app/services/status.service";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-add-device",
  templateUrl: "./add-device.component.html",
  styleUrls: ["./add-device.component.scss"],
})
export class AddDeviceComponent implements OnInit {

  deviceTypes = [
    {
      id: 0,
      name: 'cog-outline',
      caption: 'Custom'
    },
    {
      id: 1,
      name: 'man-outline',
      caption: 'Movement'
    },
    {
      id: 2,
      name: 'bulb-outline',
      caption: 'Switch'
    },
    {
      id: 3,
      name: 'flower-outline',
      caption: 'Garden'
    },
    {
      id: 4,
      name: 'speedometer-outline',
      caption: 'Measure'
    },
    {
      id: 5,
      name: 'water-outline',
      caption: 'Water Pump'
    }
  ]

  systemDevices = [];
  bluetoothDevices = [];
  step: number;
  readingData = false;
  mcuConnected;
  isLogging;
  localIp;
  connected;
  deviceName;

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
    private bluetooth: BluetoothService,
    private statusService:StatusService,
    private customSerialService: CustomSerialService,
    private storage: StorageService,
    private toastCtrl: ToastController, 
    public loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private networkService:NetworkService,
    private router: Router
    ) {
      this.wifiForm = this.formBuilder.group({
        ssid: ['', Validators.required],
        password: ['', Validators.required]
      });
    }

  ngOnInit() {
    this.step = 1;
    this.mcuConnected = false;
    this.networkService.getSSID().then(res => {
      if (res) {
        this.connected = true;
        console.log('got SSID!');
      }
      this.wifiForm.controls.ssid.setValue(res);
    });
    this.bluetooth.checkConnection().then((res) => {
      console.log(res);
      if (res !== "BLUETOOTH.NOT_CONNECTED") this.bluetooth.disconnect();
    }).catch( err => console.log(err));
  }

  exploreBluetoothDevices() {
    this.step = 2;
    this.bluetooth.searchBluetooth().then(
      (successMessage: Array<Object>) => {
        this.bluetoothDevices = [];
        this.bluetoothDevices = successMessage;
        console.info("Bluetooth Devices", this.bluetoothDevices);
      },
      (fail) => {
        console.info("Error de conexión");
      }
    );
  }

  bluetoothConnection(btId: string) {
    this.bluetooth.disconnect();
    this.loaderService.presentLoading(`Connecting to BT id ${btId}`);
    this.bluetooth
      .deviceConnection(btId)
      .then((res) => {
        this.statusService.state.bluetoothConnected = true;
        this.loaderService.hideLoading();
        this.presentToast("Connected");
        this.sendMessageByBluetooth(">>>READ_STATUS");
        //this.customSerialService.sendData(">>>READ_STATUS");
        if (this.statusService.state.bluetoothConnected) {
          this.readingData = true;
          this.loaderService.presentLoading('Leyendo estado');
          setTimeout(()=>{
            if(this.readingData){
              // Mandamos caracter en blanco para continuar la comunicación si ha exisitido alguna ausencia de respuesta
              this.sendMessageByBluetooth(" ");
            }
          }, 10000);
        }else if(this.statusService.state.serialConnected){
          this.readingData = true;
        }
      })
      .catch((err) => {
        console.log(`E R R O R ----> ${err}`);
      });
  }

    /**
* Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
*/
sendMessageByBluetooth(message: string) {
  this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
    if (data !== 'BLUETOOTH.NOT_CONNECTED') {
      this.statusService.state.bluetoothConnected = true;
      this.serialData.fullStr += data;
      this.serialData.lastStr = data;
      if(data){
        this.decodeData(data);
      }
    } else {
      this.statusService.state.bluetoothConnected = false;
      //this.presentToast('NO DEVICES CONNECTED', "danger");
    }
  });
}

decodeData(msg: string) {
  console.log(msg);
  if(msg!=='' && (this.statusService.state.bluetoothConnected)){
    //this.statusService.state.bluetoothConnected = true;
    this.storage.getBluetoothId().then( res => {
      this.statusService.state.bluetoothId = res;
    });
  }
  if (msg.indexOf('[ESP_NET] - STATUS_READ_START') > -1) {
    this.readingData = true;
  }
  if (msg.indexOf('[ESP_NET] - STATUS_READ_END') > -1) {
    this.presentToast("Device data was read succesfully");
    this.loaderService.hideLoading();
    this.readingData = false;
    this.clearEeprom();
  }
  if (msg.indexOf('[ESP-SYS] - DEVICE_TYPE: ') > -1) {
    this.statusService.state.type = msg.substring(msg.indexOf("[ESP-SYS] - DEVICE_TYPE: ") + 25, msg.length);
  }
  if (msg.indexOf('[ESP-NET] - BOARD: ') > -1) {
    this.statusService.state.mcu = msg.substring(msg.indexOf("[ESP-NET] - BOARD: ") + 19, msg.length);
  }
  if (msg.indexOf('[ESP-SYS] - DEVICE_MAC: ') > -1) {
    this.statusService.state.deviceMAC = msg.substring(msg.indexOf("[ESP-SYS] - DEVICE_MAC: ") + 24, msg.length);
  }

  if (msg.indexOf("[ESP-NET] - WIFI CONNECTION SUCCESS") > -1) {
    this.loaderService.hideLoading();
    this.mcuConnected = true;
    this.statusService.setWifiConnected(true);
    this.serialData.fullStr = "";
    this.isLogging = false;
    this.presentToast("Connected to " + this.wifiForm.controls.ssid.value + "!!!");
    this.readingData = false;
    this.step = 4;
    this.sendMessageByBluetooth(" ");
  }  
  
  if (msg.indexOf("[ESP-NET] - WIFI CONNECTION ERROR") > -1) {
    this.loaderService.hideLoading();
    this.mcuConnected = false;
    this.statusService.setWifiConnected(false);
    this.statusService.setLocalIp('');
    this.statusService.setSSID('');
    this.presentToast("CONNECTION ERROR. Check parameters and try again");
    this.serialData.fullStr = "";
    this.isLogging = false;
  } 

  if(msg.indexOf("[ESP-EEPROM] - Memory formatted")>-1){
    this.presentToast("EEPROM Deleted");
    this.loaderService.hideLoading();
    this.serialData.fullStr = "";
  }
  
  // if (msg.indexOf("[ESP-NET] - LOCAL IP:") > -1) {
  //   this.localIp = msg.substring(msg.indexOf("[ESP-NET] - LOCAL IP:")+21,msg.length);
  //   if(this.localIp!=''){
  //     this.step = 4;
  //     this.mcuConnected=true;
  //     this.statusService.setWifiConnected(true);
  //     this.statusService.setLocalIp(this.localIp);
  //     this.statusService.setSSID(this.wifiForm.controls.ssid.value);
  //   }
  //   this.serialData.fullStr = "";
  //  }
}

clearEeprom() {
  this.step = 3;
  this.presentToast("Deleting EEPROM...");
  this.loaderService.presentLoading('Borrando EEPROM. Espere');
  this.customSerialService.sendData("MEM_RST");
  this.sendMessageByBluetooth("MEM_RST");
    // this.customSerialService.getSerialData().then(res => {
    //   this.serialData = res;
    //   if(this.serialData.fullStr.indexOf("[ESP-EEPROM] - Memory formatted")>-1){
    //     this.presentToast("EEPROM Deleted");
    //     this.loaderService.hideLoading();
    //     this.serialData.fullStr = "";
    //     return;
    //   }
    // }).catch(() => { console.log("ERROR") })
}

async presentToast(text: string) {
  const toast = await this.toastCtrl.create({
    message: text,
    duration: 3000
  });
  await toast.present();
}

logForm() {
  console.log(this.wifiForm.value);
  this.sendSerialData();
}

sendSerialData() {
  //this.isLogging = true;
  this.readingData = true;
  setTimeout(()=>{
    if(this.readingData){
      // Mandamos caracter en blanco para continuar la comunicación si ha exisitido alguna ausencia de respuesta
      this.sendMessageByBluetooth(" ");
    }
  }, 12000);
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

sendDeviceType(type:string){
  this.sendMessageByBluetooth(">>>DEVICE_TYPE: " + type);
  this.step = 5;
}

async storeConfig() {
  this.statusService.state.name = this.deviceName.trimLeft();
  this.sendMessageByBluetooth(">>>DEVICE_NAME: "+ this.deviceName);
  this.customSerialService.sendData(">>>DEVICE_NAME: " + this.deviceName);

  this.sendMessageByBluetooth(">>>TOKENIZED_TOPIC: "+ this.statusService.tokenizedTopic);
  this.customSerialService.sendData(">>>TOKENIZED_TOPIC: " + this.statusService.tokenizedTopic);
  //TODO. Debe asignarse el sistema que se elija desde el dispositivo
  delete this.statusService.state.system;
  await this.storage.setDevice(this.statusService.state).then(res => 
    {
      console.log(res);
      this.presentToast("NEW DEVICE ADDED !!!");
      this.router.navigate(['/device']);
    })
    .catch(err => console.log("ERROR: ", err));
}


}
