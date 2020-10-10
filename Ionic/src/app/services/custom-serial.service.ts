import { Injectable } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';
import { SerialData } from './models';


@Injectable({
  providedIn: 'root'
})
export class CustomSerialService {

  serialData: SerialData;

  constructor(private serial: Serial) {
    this.serialData = {
      data: '',
      connected: false,
      str: '',
      fullStr: '',
      codeInput: '',
      message: '',
    };
  }

  runSerialPort() {
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
        this.serialData.connected = true;
        this.serial.registerReadCallback().subscribe((data) => {
          var view = new Uint8Array(data);
          if (view.length >= 1) {
            for (var i = 0; i < view.length; i++) {
              //if we received a \n, the message is complete, display it
              if (view[i] == 13) {
                this.serialData.fullStr = this.serialData.fullStr + this.serialData.str + '\n';
                this.serialData.str = '';
              }
              // if not, concatenate with the begening of the message
              else {
                var temp_str = String.fromCharCode(view[i]);
                var str_esc = escape(temp_str);
                this.serialData.codeInput = unescape(str_esc);
                this.serialData.str += unescape(str_esc);
              }
            }
        }
          this.serialData.data = "[ok]";
          this.serialData.str = "-" + this.serialData.str;
          if (!this.serialData.data) this.serialData.data = "ERROR REGISTER READ CALLBACK";
        });
      });
    }).catch((error: any) => {
      this.serialData.connected = false;
      this.serialData.data = "CONNECTION [ko]";
      console.log(error)
    });
  }

  getSerialData(): Promise<SerialData> {
    return new Promise((resolve, reject) => {
      resolve(this.serialData),
        reject("ERROR TO LOAD SERIAL DATA");
    });
  }

  showOptions() {
    console.log("Options");
  }

  cleanConsole() {
    this.serialData.fullStr = '';
    console.log("Clear Console");
  }
}
