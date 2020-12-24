import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MqttService } from 'ngx-mqtt';
import { IMqttMessage } from 'ngx-mqtt/public-api';
import { Subscription } from 'rxjs';

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

  mqttForm: FormGroup;

  constructor(
    private _mqttService: MqttService,
    private formBuilder: FormBuilder  
  ) { 
    this.mqttForm = this.formBuilder.group({
      topicname: [''],
      msg: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    setInterval(()=>{
      this._mqttService.unsafePublish('medusa/devices/outputs', 'Im alive', { qos: 1, retain: true });
    }, 1000);
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  subscribeNewTopic(): void {
    console.log('inside subscribe new topic')
    this.subscription = this._mqttService.observe(this.mqttForm.controls.topicname.value).subscribe((message: IMqttMessage) => {
      this.msg = message;
      console.log('msg: ', message);
      this.clear();
      this.logMsg('Message: ' + message.payload.toString() + '<br> for topic: ' + message.topic);
    });
    this.clear();
    this.logMsg('subscribed to topic: ' + this.mqttForm.controls.topicname.value);
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
}


