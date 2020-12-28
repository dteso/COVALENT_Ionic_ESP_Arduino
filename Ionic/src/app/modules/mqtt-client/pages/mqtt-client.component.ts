import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MqttService } from 'ngx-mqtt';
import { IMqttMessage } from 'ngx-mqtt/public-api';
import { Subscription } from 'rxjs';
import { MQTT_SERVICE_OPTIONS } from '../components/mqtt-options';
import { MQTT_SERVERS } from '../components/mqtt-servers';

@Component({
  selector: 'app-mqtt-client',
  templateUrl: './mqtt-client.component.html',
  styleUrls: ['./mqtt-client.component.scss'],
})
export class MqttClientComponent implements OnInit {

  private subscription: Subscription;
  topicname: any;
  date:Date;
  msg: any;
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true }) msglog: ElementRef;
  options = MQTT_SERVICE_OPTIONS;
  mqttServers = MQTT_SERVERS;
  title = "MQTT Client";
  serverSelected = 0;
  host = '';
  port = null;
  lastTopicIndex = 0;
  msgToSend = '';
  topics = [];
  deletedTopics = [];

  mqttForm: FormGroup;

  constructor(
    private _mqttService: MqttService,
    private formBuilder: FormBuilder
  ) {
    this.date=new Date();
    this.mqttForm = this.formBuilder.group({
      topicname: ['', Validators.required]
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
    if(this.topics.filter(topic => topic.topic === this.mqttForm.controls.topicname.value).length > 0 || this.mqttForm.invalid){
      return;
    };
    console.log('inside subscribe new topic');
    this.topics.push({ 
      topic: this.mqttForm.controls.topicname.value, 
      message: '', 
      timestamp: this.date.getTime(),
      allowPublish: false
    });
    this.subscription = this._mqttService.observe(this.mqttForm.controls.topicname.value).subscribe((message: IMqttMessage) => {
      if(this.deletedTopics.filter( topic => topic.topic === message.topic).length > 0){
        this.subscription.unsubscribe();
        let topicPos=0;
        topicPos = this.deletedTopics.find( dt => dt.topic === message.topic);
        this.deletedTopics.splice(topicPos,1);
        return;
      }
      let pos = 0;
      this.msg = message;
      console.log('msg: ', message);
      this.clear();
      let count = 0;
      this.topics.forEach( topic => {
        topic.topic === message.topic? pos=count : count++;
      });
      this.topics[pos].topic = message.topic;
      this.topics[pos].message = message.payload.toString();
      this.topics[pos].timestamp = this.date.getTime();
      this.lastTopicIndex = pos;
      this.mqttForm.controls.topicname.setValue('');
      this.logMsg('Last MESSAGE received was: << ' + message.payload.toString() + '>> on TOPIC: << ' + message.topic +' >>');
    });
    this.clear();
    this.logMsg('Subscribed to topic: << ' + this.mqttForm.controls.topicname.value +' >>');
  }

  sendmsg(index:any, topic:string, msg: string): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(topic, msg, { qos: 1, retain: true });
    this.msg = '';
    this.msgToSend = '';
    this.topics[index].allowPublish = false;
  }

  logMsg(message): void {
    this.msglog.nativeElement.innerHTML += '' + message;
  }

  clear(): void {
    this.msglog.nativeElement.innerHTML = '';
  }

  onSelectServer(evt){
    this.serverSelected = this.mqttServers.indexOf(evt.detail.value);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    this.topics = [];
    this.deletedTopics = [];
  }

  onModelChange(){
    this.options.hostname = this.host;
    this.options.port = this.port;
  }

  connect(){
    this._mqttService.disconnect();
    this._mqttService.connect(this.options);
  }

  deleteTopic(index){
    this.deletedTopics.push(this.topics[index]);
    this.topics.splice(index, 1);
  }
}


