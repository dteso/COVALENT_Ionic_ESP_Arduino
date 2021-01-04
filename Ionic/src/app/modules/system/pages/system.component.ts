import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/services';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit {

  devices  = [];

  constructor(
    private readonly storage: StorageService
  ) {

   }

  async ngOnInit() {
    await this.storage.getDevices().then(devs => this.devices = devs).catch(err=> console.log("error ", err));
  }

}
