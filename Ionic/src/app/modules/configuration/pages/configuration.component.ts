import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { DeviceTypes } from '../../../shared/utils/enums/device-types.enum';
import { enumToObjectsArray } from '../../../shared/utils/helpers';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent implements OnInit {

  deviceTypes = [];
  deviceTypesEnum = DeviceTypes;
  systems = [];

  constructor(
    private storage:StorageService
  ) {
    
   }

async ngOnInit() {
  this.deviceTypes = enumToObjectsArray(DeviceTypes);
  await this.storage.getSystems().then( systems => this.systems = systems );
  console.log(this.deviceTypes);
  }

}
