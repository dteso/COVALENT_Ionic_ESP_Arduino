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
  host = '';
  port = null;
  lastTopicIndex = 0;
  msgToSend = '';

  topics = [];

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
    console.log('inside subscribe new topic');
    this.topics.push({ topic: this.mqttForm.controls.topicname.value, message: ''});
    this.subscription = this._mqttService.observe(this.mqttForm.controls.topicname.value).subscribe((message: IMqttMessage) => {
      let pos = 0;
      this.msg = message;
      console.log('msg: ', message);
      this.clear();
      let count = 0;
      this.topics.forEach( topic => {
        if(topic.topic === message.topic){
          pos=count;
        }else{
          count++;
        }
      })
      this.topics[pos].message = message.payload.toString();
      this.lastTopicIndex = pos;
      this.logMsg('Last MESSAGE received was: << ' + message.payload.toString() + '>> on TOPIC: << ' + message.topic +' >>');
    });
    this.clear();
    this.logMsg('Subscribed to topic: << ' + this.mqttForm.controls.topicname.value +' >>');
  }

  sendmsg(topic:string, msg: string): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true })
    this.msg = '';
    this.msgToSend = '';
  }

  logMsg(message): void {
    this.msglog.nativeElement.innerHTML += '' + message;
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


