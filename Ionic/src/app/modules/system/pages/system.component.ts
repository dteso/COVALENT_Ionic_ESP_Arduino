import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMqttMessage, MqttService, MQTT_SERVICE_OPTIONS } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { BluetoothService, StorageService } from 'src/app/services/services';
import { StatusService } from 'src/app/services/status.service';
import { MQTT_SERVERS } from '../../mqtt-client/components/mqtt-servers';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit{

  storedDevices  = [];
  connectedDevices = [];
  bluetoothDevices = [];
  mcuOutputStatus = false;
  activeBluetooth;

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
    private router: Router
  ) {
    this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
    this._mqttService.connect(this.options);
    this.subscribeTo(`medusa/devices/outputs`);
   }

  async ngOnInit() {
    await this.storage.getDevices().then(devs => {
      this.storedDevices = devs;
      console.log(this.storedDevices);
    }).catch(err=> console.log("error ", err));
    await this.storage.getBluetoothId().then(res=> {
      this.activeBluetooth = res;
    });
    this.exploreBluetoothDevices();
    this.sendmsg(`medusa/devices/outputs`, 'SUPERV');
    await this.bluetooth.getCurrentDevice().then( res => console.log("RES:" + JSON.stringify(res)));
  }

  ionViewWillEnter(){
    this.sendmsg(`medusa/devices/outputs`, 'SUPERV');
    this.exploreBluetoothDevices();
  }

  ionViewDidLeave(){
    this.subscription.unsubscribe();
  }

  exploreBluetoothDevices(){
    this.storedDevices.map(dev => {
      dev.searchingBluetooth = true;
    });
    this.bluetooth.searchBluetooth().then((successMessage: Array<Object>) => {
      this.bluetoothDevices = [];
      this.bluetoothDevices = successMessage;
      console.info('Bluetooth Devices', this.bluetoothDevices);
      this.storedDevices.map(dev => {
        dev.searchingBluetooth = false;
      });
    }, fail => {
      console.info("Error de conexión");
    });
  }

  onAction1(i, device){
    this.mcuOutputStatus = !this.mcuOutputStatus;
    this.sendmsg(`medusa/set/${device.name}`, this.mcuOutputStatus? 'D6=1': 'D6=0');
  }

  sendmsg(topic:string, msg: string): void {
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true });
  }

  subscribeTo(topic){
    this.subscription = this._mqttService.observe(topic).subscribe((message: IMqttMessage) => {
     console.log(message.payload.toString());
     if(message.payload.toString() !== 'SUPERV'){
      this.device = message.payload.toString();
      const data = JSON.parse(this.device);
      console.log('Device: ', data);
      let index=0;
      if(this.storedDevices){
        this.storedDevices.map(dev => {
          if(dev.name === data.name){
            this.storedDevices[index].online =  true;
            this.storedDevices[index].temperature =  data.temp;
            this.storedDevices[index].humidity =  data.hum;
            this.connectedDevices.push(data);
          }else{
            index++;
          }
        });
      }
    }
  });
  }

  getBluetoothAvailable(btId: string): boolean{
    return this.bluetoothDevices.find( bt => bt.address === btId);
  }

  getActiveBluetooth(btId: string): boolean{
    return btId === this.activeBluetooth;
  }

  bluetoothConnection(btId: string){
    this.bluetooth.disconnect();
    let currentDevice = this.storedDevices.filter( dev => dev.bluetoothId === btId)[0];
    currentDevice.connectingByBluetooth = true;
    currentDevice.connectionError = false;
    this.bluetooth.deviceConnection(btId).then(res => {
      this.activeBluetooth = btId;
      currentDevice.connectingByBluetooth = false;
      currentDevice.connectionError = false;
      this.router.navigate(['/device']);
      this.statusService.state.bluetoothConnected = true;
    }).catch( err => {
      currentDevice.connectingByBluetooth = false;
      currentDevice.connectionError = true;
      //this.activeBluetooth = '';
      this.storage.setBluetoothId('');
      console.log(`E R R O R ----> ${err}`)
    });
  }

}
   