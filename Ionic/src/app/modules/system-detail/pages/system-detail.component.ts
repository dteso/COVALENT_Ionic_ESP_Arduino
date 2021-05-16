import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MqttService, IMqttMessage } from "ngx-mqtt";
import { Subscription } from "rxjs";
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

  private subscription: Subscription;
  options = MQTT_SERVICE_OPTIONS;
  mqttServers = MQTT_SERVERS;
  title = "MQTT Client";
  // TODO: Seleccionado mosquitto por defecto
  serverSelected = 1;
  device;

  constructor(
    private readonly storage: StorageService,
    private readonly _mqttService: MqttService,
    private readonly bluetooth: BluetoothService,
    private readonly statusService: StatusService,
    private readonly route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((data) => {
      this.systemId = data.id;
    });
    this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
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
        devs.map((dev) => (dev.system = !dev.system ? 0 : dev.system));
        this.storedDevices = devs;
        this.systemDevices = this.storedDevices.filter(
          (stored) => stored.system === parseInt(this.systemId, 10)
        );
        this.systemDevices = this.storedDevices;
        this.systemDevices.map((dev) => {
          dev.online = false;
        });
        console.log("System Devices: ", this.systemDevices);
        this._mqttService.connect(this.options);
        this.subscribeTo(`medusa/devices/outputs`);
      })
      .catch((err) => console.log("error ", err));
    await this.storage.getBluetoothId().then((res) => {
      this.activeBluetooth = res;
    });
    this.exploreBluetoothDevices();
    this.sendmsg(`medusa/devices/outputs`, "SUPERV");
    await this.bluetooth
      .getCurrentDevice()
      .then((res) => console.log("RES:" + JSON.stringify(res)));
  }

  ionViewWillEnter() {
    this.sendmsg(`medusa/devices/outputs`, "SUPERV");
    this.exploreBluetoothDevices();
  }

  ionViewDidLeave() {
    this.subscription.unsubscribe();
  }

  exploreBluetoothDevices() {
    this.systemDevices.map((dev) => {
      dev.searchingBluetooth = true;
    });
    this.bluetooth.searchBluetooth().then(
      (successMessage: Array<Object>) => {
        this.bluetoothDevices = [];
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
    if(device.d6_status === "1"){
      this.sendmsg(`medusa/set/${device.name}`, "TOGGLE_SWITCH_OFF");
      device.d6_status = "0";
    }else{
      this.sendmsg(`medusa/set/${device.name}`, "TOGGLE_SWITCH_ON");
      device.d6_status = "1";
    }      
  }

  async deleteDevice(index) {
    this.systemDevices.splice(index, 1);
    await this.storage.setDevices(this.systemDevices);
  }

  sendmsg(topic: string, msg: string): void {
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true });
  }

  subscribeTo(topic) {
    this.connectedDevices = [];
    this.subscription = this._mqttService
      .observe(topic)
      .subscribe((message: IMqttMessage) => {
        console.log("MQTT message", message.payload.toString());
        if (message.payload.toString() !== "SUPERV") {
          this.device = message.payload.toString();
          const data = JSON.parse(this.device);
          console.log("Device: ", data);
          if (this.systemDevices) {
            let index = this.systemDevices.findIndex(
              (dev) => dev.name === data.name
            );
            this.systemDevices[index].online = true;
            this.systemDevices[index].temperature = data.temp;
            this.systemDevices[index].humidity = data.hum;
            this.systemDevices[index].type = data.type.trimLeft();
            this.systemDevices[index].d6_status = data.d6_status;
            if (!data.system) {
              this.systemDevices[index].system = 0;
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
        //this.activeBluetooth = '';
        this.storage.setBluetoothId("");
        console.log(`E R R O R ----> ${err}`);
      });
  }
}
