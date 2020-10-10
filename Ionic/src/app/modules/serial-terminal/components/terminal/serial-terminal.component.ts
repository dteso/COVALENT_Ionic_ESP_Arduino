import { Component, OnInit } from '@angular/core';
import { SerialData } from '../../../../services/models';
import { CustomSerialService } from 'src/app/services/services';

@Component({
  selector: 'app-serial-terminal',
  templateUrl: './serial-terminal.component.html',
  styleUrls: ['./serial-terminal.component.scss']
})
export class SerialTerminalComponent implements OnInit {

  serialData:SerialData = {
    data : '',
    connected : false,
    str:'',
    fullStr : '',
    codeInput: '',
    message: '',
  };

  constructor(private customSerialService: CustomSerialService) {}
  
  ngOnInit() {
    setInterval(()=>{
      this.customSerialService.runSerialPort();
      this.customSerialService.getSerialData().then( res => {
        this.serialData = res;
      }).catch(console.log);
    },100);
  }

}
