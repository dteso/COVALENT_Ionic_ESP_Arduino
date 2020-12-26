import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MqttService } from 'ngx-mqtt';
import { IMqttMessage } from 'ngx-mqtt/public-api';
import { Subscription } from 'rxjs';
import { MQTT_SERVICE_OPTIONS } from '../components/mqtt-options';

@Component({
  selector: 'app-mqtt-client',
  templateUrl: './mqtt-client.component.html',
  styleUrls: ['./mqtt-client.component.scss'],
})
export class MqttClientComponent implements OnInit {

  private subscription: Subscription;
  topicname: any;
  msg: any;
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true }) msglog: ElementRef;
  options = MQTT_SERVICE_OPTIONS;
  title = "MQTT Client";
  serverSelected = 0;
  host='';
  port=null;

  mqttForm: FormGroup;

  mqttServers = [
    {
      name: 'Custom server edit',
      hostname: '',
      port: 0,
      path: '/mqtt',
      imgUrl: './assets/images/localhost.png'
    },
    {
      name: 'Mosquitto',
      hostname: 'test.mosquitto.org',
      port: 8080,
      path: '/mqtt',
      imgUrl: './assets/images/mosquitto.png'
    },
    {
      name: 'Emqx',
      hostname: 'broker.emqx.io',
      port: 8083,
      path: '/mqtt',
      imgUrl: './assets/images/emqx.png'
    },
    {
      name: 'Hivemq',
      hostname: 'broker.hivemq.com',
      port: 8000,
      path: '/mqtt',
      imgUrl: './assets/images/hivemq.png'
    },
  ]
  constructor(
    private _mqttService: MqttService,
    private formBuilder: FormBuilder
  ) {
    this.mqttForm = this.formBuilder.group({
      topicname: [''],
      msg: ['', Validators.required],
    });
    // TODO: Changing mqtt connection parameters dinamically
    this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
    this._mqttService.connect(this.options);
    // TODO: Form creation pending for this configuration
  }

  ngOnInit(): void {
    this._mqttService.unsafePublish('test', 'Connection Success from C0V4L3N7', { qos: 1, retain: true });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  subscribeNewTopic(): void {
    console.log('inside subscribe new topic')
    this.subscription = this._mqttService.observe(this.mqttForm.controls.topicname.value).subscribe((message: IMqttMessage) => {
      this.msg = message;
      console.log('msg: ', message);
      this.clear();
      this.logMsg('· Message > ' + message.payload.toString() + '<br> · Topic: ' + message.topic);
    });
    this.clear();
    this.logMsg('· Subscribed to topic: ' + this.mqttForm.controls.topicname.value);
  }

  sendmsg(): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(this.mqttForm.controls.topicname.value, this.mqttForm.controls.msg.value, { qos: 1, retain: true })
    this.msg = '';
  }

  logMsg(message): void {
    this.msglog.nativeElement.innerHTML += '<br><hr>' + message;
  }

  clear(): void {
    this.msglog.nativeElement.innerHTML = '';
  }

  onSelectServer(evt){
    this.serverSelected = this.mqttServers.indexOf(evt.detail.value);
    this._mqttService.disconnect();
    this.options.hostname = this.mqttServers[this.serverSelected].hostname;
    this.options.port = this.mqttServers[this.serverSelected].port;
    this.options.path = this.mqttServers[this.serverSelected].path;
    this._mqttService.connect(this.options);
    this.logMsg('');
    this.mqttForm.controls.topicname.setValue('');
    this.mqttForm.controls.msg.setValue('');
    this.host='';
    this.port='';
  }

  onModelChange(){
    this.options.hostname = this.host;
    this.options.port = this.port;
  }

  connect(){
    this._mqttService.disconnect();
    this._mqttService.connect(this.options);
  }
}


