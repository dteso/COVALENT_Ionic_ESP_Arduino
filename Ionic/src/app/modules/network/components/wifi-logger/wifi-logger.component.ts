import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NetworkService } from 'src/app/services/services';

@Component({
  selector: 'app-wifi-logger',
  templateUrl: './wifi-logger.component.html',
  styleUrls: ['./wifi-logger.component.scss'],
})
export class WifiLoggerComponent implements OnInit {

  connected = false;

  private wifiForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private networkService: NetworkService) {
    this.wifiForm = this.formBuilder.group({
      ssid: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.networkService.getSSID().then(res => {
      if (res) {
        this.connected = true;
      }
      this.wifiForm.controls.ssid.setValue(res);
    });
  }


  logForm() {
    console.log(this.wifiForm.value);
  }
}
