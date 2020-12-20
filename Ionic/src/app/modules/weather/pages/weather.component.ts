import { Component, OnInit } from '@angular/core';
import { SerialData, StatusService } from 'src/app/services/services';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {

  tempValue = '0';
  humValue = '0';

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    lastStr: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };
  title = "Indoor weather";

  constructor(
    private statusService: StatusService
  ) { }

  ngOnInit() {
    setTimeout(()=> {
      this.tempValue = this.statusService.state.temperature;
      this.humValue = this.statusService.state.humidity;
    }, 250);
  }

}
