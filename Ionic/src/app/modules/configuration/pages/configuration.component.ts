import { Component, OnInit } from '@angular/core';
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

  constructor() { }

ngOnInit() {
  this.deviceTypes = enumToObjectsArray(DeviceTypes);
  console.log(this.deviceTypes);
  }

}
