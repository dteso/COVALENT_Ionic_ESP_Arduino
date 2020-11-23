import { Component, Input, OnInit } from '@angular/core';
import { SerialData } from 'src/app/services/models';
import { CustomSerialService } from 'src/app/services/services';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
})
export class ConsoleComponent implements OnInit {

  @Input() serialData: SerialData;
  @Input() showButtons: boolean;

  constructor(private readonly customSerialService:CustomSerialService) { }

  ngOnInit() {}

  sendEnableWebServer(){
    this.customSerialService.sendData("CREATE_WEB_SERVER");
  }

  clearConsole(){
    this.serialData.fullStr = "";
  }

  saveLog(){
    console.log("Save form");
  }

}
