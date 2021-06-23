import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertController, LoadingController } from "@ionic/angular";
import { MqttService, IMqttMessage } from "ngx-mqtt";
import { Subscription } from "rxjs";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { StorageService, BluetoothService } from "src/app/services/services";
import { StatusService } from "src/app/services/status.service";
import { MQTT_SERVICE_OPTIONS } from "../../mqtt-client/components/mqtt-options";
import { MQTT_SERVERS } from "../../mqtt-client/components/mqtt-servers";

@Component({
  selector: "app-system-detail",
  templateUrl: "./system-detail.component.html",
  styleUrls: ["./system-detail.component.scss"],
})
export class SystemDetailComponent implements OnInit {
  storedDevices = [];
  systemDevices = [];
  storedSystems = [];
  connectedDevices = [];
  bluetoothDevices = [];
  mcuOutputStatus = false;
  activeBluetooth;
  systemId;
  searching = true;

  private subscription: Subscription;
  options = MQTT_SERVICE_OPTIONS;
  mqttServers = MQTT_SERVERS;
  title = "MQTT Client";
  // TODO: Seleccionado mosquitto por defecto
  serverSelected = 1;
  device;
  alert;

  constructor(
    private readonly storage: StorageService,
    private readonly _mqttService: MqttService,
    private readonly bluetooth: BluetoothService,
    private readonly statusService: StatusService,
    private readonly route: ActivatedRoute,
    private router: Router,
    public alertController: AlertController
  ) {
    this.route.params.subscribe((data) => {
      this.systemId = data.id;
    });
    this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
    this._mqttService.connect(this.options);
    console.log('connecting...');   
    this.subscribeTo(`/medusa/devices/outputs`);
  }

  async ngOnInit() {
    await this.storage
      .getSystems()
      .then((sys) => {
        this.storedSystems = sys;
        console.log(this.storedSystems);
      })
      .catch((err) => console.log("error ", err));
    await this.storage
      .getDevices()
      .then((devs) => {
        devs.map((dev) =>{
          dev.system = !dev.system ? 0 : dev.system;  
          dev.collapsed = true;
        });
        this.storedDevices = devs;
        this.systemDevices = this.storedDevices.filter(
          (stored) => stored.system === parseInt(this.systemId, 10)
        );
        this.systemDevices.map((dev) => {
          dev.online = false;
        });
        console.log("System Devices: ", this.systemDevices);
      })
      .catch((err) => console.log("error ", err));
    await this.storage.getBluetoothId().then((res) => {
      this.activeBluetooth = res;
    });
    this.exploreBluetoothDevices();
    this.sendmsg(`/medusa/devices/outputs`, "SUPERV");
    await this.bluetooth
      .getCurrentDevice()
      .then((res) => console.log("RES:" + JSON.stringify(res)));
  }

  ionViewWillEnter() {
    this.sendmsg(`/medusa/devices/outputs`, "SUPERV");
    this.bluetoothDevices = [];
    this.exploreBluetoothDevices();
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  exploreBluetoothDevices() {
    this.systemDevices.map((dev) => {
      dev.searchingBluetooth = true;
    });
    this.bluetooth.searchBluetooth().then(
      (successMessage: Array<Object>) => {
        this.bluetoothDevices = successMessage;
        console.info("Bluetooth Devices", this.bluetoothDevices);
        this.systemDevices.map((dev) => {
          dev.searchingBluetooth = false;
        });
      },
      (fail) => {
        console.info("Error de conexión");
      }
    );
  }

  onAction1(i, device) {
    let deviceMAC = device.deviceMAC.substring(0, device.deviceMAC.length - 2);
    if(device.d6_status === "1"){
      this.sendmsg(`/medusa/set/${deviceMAC}`, "TOGGLE_SWITCH_OFF");
    }else{
      this.sendmsg(`/medusa/set/${deviceMAC}`, "TOGGLE_SWITCH_ON");
    }      
  }

  onChangeDeviceView(index){
    this.systemDevices[index].collapsed = this.systemDevices[index].collapsed ? false : true;
  }

  async deleteDevice(index) {
    this.systemDevices.splice(index, 1);
    await this.storage.setDevices(this.systemDevices);
  }

  sendmsg(topic: string, msg: string): void {
    this._mqttService.unsafePublish(`${this.statusService.tokenizedTopic}${topic}`, msg, { qos: 1, retain: true });
  }

  subscribeTo(topic) {
    this.connectedDevices = [];
    let finalTopic = `${this.statusService.tokenizedTopic}${topic}`;
    console.log('Subscribing to ' + finalTopic);
    this.subscription = this._mqttService
      .observe(finalTopic)
      .subscribe((message: IMqttMessage) => {
        console.log('Final topic', finalTopic);
        console.log("MQTT message", message.payload.toString());
        if (message.payload.toString() !== "SUPERV") {
          this.device = message.payload.toString();
          this.device.replaceAll("\r","");
          this.device.replaceAll("\n","");
          const data = JSON.parse(this.device);
          console.log("Device: ", data);
          if (this.systemDevices) {
            let index = this.systemDevices.findIndex(
              (dev) => (dev.deviceMAC).substring(0, dev.deviceMAC.length - 2) === data.mac
            );
            if(this.systemDevices[index]){
              this.searching = false;
              this.systemDevices[index].online = true;
              this.systemDevices[index].temperature = data.temp;
              this.systemDevices[index].humidity = data.hum;
              this.systemDevices[index].type = data.type.trimLeft();
              this.systemDevices[index].d6_status = data.d6;
              this.systemDevices[index].alarm_status = data.alrm_stat;
              this.systemDevices[index].alarm_triggered = data.alrm_trig;
              this.systemDevices[index].signal_strength = data.rssi;

              if (!data.system) {
                this.systemDevices[index].system = 0;
              }
            }
            this.connectedDevices.push(data);
          }
        }
      });
  }

  getBluetoothAvailable(btId: string): boolean {
    return this.bluetoothDevices.find((bt) => bt.address === btId);
  }

  getActiveBluetooth(btId: string): boolean {
    return btId === this.activeBluetooth;
  }

  bluetoothConnection(btId: string) {
    this.bluetooth.disconnect();
    let currentDevice = this.systemDevices.filter(
      (dev) => dev.bluetoothId === btId
    )[0];
    currentDevice.connectingByBluetooth = true;
    currentDevice.connectionError = false;
    this.bluetooth
      .deviceConnection(btId)
      .then((res) => {
        this.activeBluetooth = btId;
        currentDevice.connectingByBluetooth = false;
        currentDevice.connectionError = false;
        this.router.navigate(["/device"]);
        this.statusService.state.bluetoothConnected = true;
      })
      .catch((err) => {
        currentDevice.connectingByBluetooth = false;
        currentDevice.connectionError = true;
        this.storage.setBluetoothId("");
        console.log(`E R R O R ----> ${err}`);
      });
  }


  manageAlarmStatus(id){
    let devicesToActivate = [];
    let index = this.storedSystems.findIndex( stsys => stsys.id === parseInt(id,10));
    if(this.storedSystems[index].fullAlarmStatus !== undefined && this.storedSystems[index].fullAlarmStatus === true){
      this.storedSystems[index].fullAlarmStatus = false;
      this.storedSystems[index].armedTimestamp = "";
      // TODO: Filtrar por sistema cuando los dispositivos tengan Status.system
      devicesToActivate = this.storedDevices;
      devicesToActivate.map( dev => {
        let deviceMAC = dev.deviceMAC.substring(0, dev.deviceMAC.length - 2);
        this.sendmsg(`/medusa/set/${deviceMAC}`, "SWITCH_ALARM_OFF");
      });
    }else{
      let date = new Date();
      this.storedSystems[index].fullAlarmStatus = true;
      this.storedSystems[index].armedTimestamp = `${date.toLocaleDateString()} ${date.getHours()}: ${date.getMinutes()} :${date.getSeconds()}`;
      // TODO: Filtrar por sistema cuando los dispositivos tengan Status.system
      devicesToActivate = this.storedDevices;
      devicesToActivate.map( dev => {
        let deviceMAC = dev.deviceMAC.substring(0, dev.deviceMAC.length - 2);
        this.sendmsg(`/medusa/set/${deviceMAC}`, "SWITCH_ALARM_ON");
      });
    }
    this.storage.setSystems(this.storedSystems);
  }

  showNetworkStatus(i){
    let msg = {
      subheader: this.systemDevices[i].signal_strength,
      msg: this.systemDevices[i].localIp,
      header: this.systemDevices[i].wifiSSID
    }
    this.presentAlert(msg);
  }

  getSystemStatusById(id){
    let index = this.storedSystems.findIndex ( sys => sys.id === parseInt(id,10));
    return this.storedSystems[index];
  }

  async presentAlert(msg) {
    this.alert = await this.alertController.create({
      cssClass: 'text-center abel',
      header: msg.header,
      subHeader: `-${msg.subheader}dB`,
      message: msg.msg,
      buttons: ['OK'],
      backdropDismiss: true
    });
    await this.alert.present();
  }

}
