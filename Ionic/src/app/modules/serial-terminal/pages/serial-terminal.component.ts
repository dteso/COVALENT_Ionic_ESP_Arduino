import { Component, OnInit } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';

@Component({
  selector: 'app-serial-terminal',
  templateUrl: './serial-terminal.component.html',
  styleUrls: ['./serial-terminal.component.scss']
})
export class SerialTerminalComponent implements OnInit {

  data = '';
  connected = false;
  str='';
  fullStr = '';
  codeInput;
  message: '';

  constructor(private serial: Serial) {}
  
  ngOnInit() {
    setInterval(()=>{this.runSerialPort()},100);
  }

  runSerialPort(){
    this.serial.requestPermission().then(() => {
      this.serial.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: true,
        rts: true,
        sleepOnPause: false
      }).then(() => {
        console.log('Serial connection opened');
        this.connected=true;
        this.serial.registerReadCallback().subscribe((data)=> {
          var view = new Uint8Array(data);
          if(view.length >= 1) {
            for(var i=0; i < view.length; i++) {
                //if we received a \n, the message is complete, display it
                if(view[i] == 13) {
                    this.fullStr = this.fullStr + this.str + '\n';
                    this.str = '';
                }
                // if not, concatenate with the begening of the message
                else {
                  var temp_str = String.fromCharCode(view[i]);
                  var str_esc = escape(temp_str);
                  this.codeInput = unescape(str_esc);
                  this.str += unescape(str_esc);
                }
            }
        }
          this.data="[ok]";
          this.str="-"+ this.str;
          if(!this.data) this.data = "ERROR REGISTER READ CALLBACK";
        });
      });
    }).catch((error: any) => {
      this.connected=false;
      this.data = "CONNECTION [ko]";
      console.log(error)
    });
  }

  showOptions(){
    console.log("Options");
  }

  cleanConsole(){
    this.fullStr='';
    console.log("Clear Console");
  }


}
