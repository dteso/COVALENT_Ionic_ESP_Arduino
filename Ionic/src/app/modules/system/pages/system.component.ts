import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { StorageService } from "src/app/services/services";
import { MqttService, MQTT_SERVICE_OPTIONS } from "ngx-mqtt";
import { Subscription } from "rxjs";
import { MQTT_SERVERS } from "../../mqtt-client/components/mqtt-servers";

@Component({
  selector: "app-system",
  templateUrl: "./system.component.html",
  styleUrls: ["./system.component.scss"],
})
export class SystemComponent implements OnInit {
  storedSystems = [];
  storedDevices = [];

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
  ) {}

  async ngOnInit() {}

  async ionViewDidEnter() {
    
    this.getData();
  }

  async getData() {
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
        this.storedDevices = devs;
        console.log(this.storedDevices);
      })
      .catch((err) => console.log("error ", err));
  }

  toSystemDetail(id) {
    this.router.navigate([`system-detail/${id}`]);
  }

  sendmsg(topic: string, msg: string): void {
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true });
  }
}
