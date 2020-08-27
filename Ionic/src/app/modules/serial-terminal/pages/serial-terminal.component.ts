import { Component, OnInit } from '@angular/core';
import { Serial } from '@ionic-native/serial/ngx';

@Component({
  selector: 'app-serial-terminal',
  templateUrl: './serial-terminal.component.html',
  styleUrls: ['./serial-terminal.component.scss']
})
export class SerialTerminalComponent implements OnInit {

  constructor(private serial: Serial) { }

  ngOnInit() {
  }



}
