import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-wifi-logger',
  templateUrl: './wifi-logger.component.html',
  styleUrls: ['./wifi-logger.component.scss'],
})
export class WifiLoggerComponent implements OnInit {

  connected = false;

  private wifiForm : FormGroup;

  constructor( private formBuilder: FormBuilder ) {
    this.wifiForm = this.formBuilder.group({
      ssid: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(){

  }
  
  logForm(){
    console.log(this.wifiForm.value);
  }
}
