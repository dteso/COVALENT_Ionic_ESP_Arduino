import { Component, OnInit } from '@angular/core';
import { SerialData } from '../../../../services/models';
import { CustomSerialService } from 'src/app/services/services';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-serial-terminal',
  templateUrl: './serial-terminal.component.html',
  styleUrls: ['./serial-terminal.component.scss']
})
export class SerialTerminalComponent implements OnInit {

  serialData: SerialData = {
    data: '',
    connected: false,
    str: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };

  private terminalForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private customSerialService: CustomSerialService) {
    this.terminalForm = this.formBuilder.group({
      message: ['']
    });
  }

  ngOnInit() {
    this.customSerialService.runSerialPort();
    setInterval(() => {
      this.customSerialService.getSerialData().then(res => {
        this.serialData = res;
      }).catch(console.log);
    }, 100);
  }

  sendSerialData() {
    this.customSerialService.sendData("APP-DATA >>> " + this.terminalForm.controls.message.value);
    this.terminalForm.controls.message.setValue('');
  }

}
