import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/services';
import { MqttService, MQTT_SERVICE_OPTIONS } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { MQTT_SERVERS } from '../../mqtt-client/components/mqtt-servers';


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit{

  storedSystems  = [];
  storedDevices  = [];

  private subscription: Subscription;
  options = MQTT_SERVICE_OPTIONS;
  mqttServers = MQTT_SERVERS;
  title = "MQTT Client";
  // TODO: Seleccionado mosquitto por defecto
  serverSelected = 1;
  
  constructor(
    private readonly storage: StorageService,
    private readonly _mqttService: MqttService,
    private readonly router: Router
  ) { 
    //this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
    this._mqttService.connect(this.options);
    console.log('connecting...');
    console.log(this._mqttService.state);
    setTimeout(()=>{
      this.sendmsg(`medusa/devices/outputs`, "SUPERV");
      console.log('supervision requested');
    }, 500);
  }
  

  async ngOnInit() {
    await this.storage.getSystems().then(sys => {
      this.storedSystems = sys;
      console.log(this.storedSystems);
    }).catch(err=> console.log("error ", err));
    await this.storage.getDevices().then(devs => {
      this.storedDevices = devs;
      console.log(this.storedDevices);
    }).catch(err=> console.log("error ", err));
  }

  toSystemDetail(id){
    this.router.navigate([`system-detail/${id}`]);
  }

  manageAlarmStatus(index){
    if(this.storedSystems[index].fullAlarmStatus !== undefined && this.storedSystems[index].fullAlarmStatus === true){
      this.storedSystems[index].fullAlarmStatus = false;
      this.storedSystems[index].armedTimestamp = "";
      let devicesToActivate = [];
      // TODO: Filtrar por sistema cuando los dispositivos tengan Status.system
      devicesToActivate = this.storedDevices;
      devicesToActivate.map( dev => {
        this.sendmsg(`medusa/set/${dev.name}`, "SWITCH_ALARM_OFF");
      });
    }else{
      let date = new Date();
      this.storedSystems[index].fullAlarmStatus = true;
      this.storedSystems[index].armedTimestamp = `${date.toLocaleDateString()} ${date.getHours()}: ${date.getMinutes()} :${date.getSeconds()}`;
      let devicesToActivate = [];
      // TODO: Filtrar por sistema cuando los dispositivos tengan Status.system
      devicesToActivate = this.storedDevices;
      devicesToActivate.map( dev => {
        this.sendmsg(`medusa/set/${dev.name}`, "SWITCH_ALARM_ON");
      });
    }
    this.storage.setSystems(this.storedSystems);
  }

  sendmsg(topic: string, msg: string): void {
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true });
  }
}
   