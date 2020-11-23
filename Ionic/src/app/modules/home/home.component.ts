import { Component, OnInit } from '@angular/core';
import { State } from 'src/app/services/models';
import { BluetoothService, CustomSerialService, NetworkService } from 'src/app/services/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit{

  count = 0;

  state: State = {
    wifiConnected: false,
    wifiEnabled: false,
    serialConnected: false,
    serialEnabled: false,
    bluetoothConnected: false,
    bluetoothEnabled: false
  };

  constructor(
    private bluetoothService : BluetoothService,
    private serialService: CustomSerialService,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    // setInterval(()=>{
    //   if(!this.state.serialConnected){
    //     this.serialService.runSerialPort();
    //     this.serialService.getSerialData().then( res => {
    //       this.state.serialConnected = res.connected;
    //     });
    //   }
    //   if(!this.state.bluetoothEnabled){
    //     this.bluetoothService.enableBT().then( res => {
    //       this.state.bluetoothEnabled =  res;
    //     });
    //   }
    //   if(!this.state.wifiEnabled){
    //     this.state.wifiEnabled = this.networkService.getEnabled();
    //   }
    //   this.count++;
    // }, 1000);
  }

}
