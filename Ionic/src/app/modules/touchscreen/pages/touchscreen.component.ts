import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Position } from 'src/app/shared/position';
import { Platform, IonInput, ToastController, AlertController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { BluetoothService, StorageService } from 'src/app/services/services';

@Component({
  selector: 'app-touchscreen',
  templateUrl: './touchscreen.component.html',
  styleUrls: ['./touchscreen.component.scss'],
})
export class TouchscreenComponent implements AfterViewInit  {
  @ViewChild('imageCanvas') canvas: any; // for Canvas
  canvasElement: any;
  context:any

  @ViewChild('myInput') myInput: IonInput; // for Keyboard
  
  title='TouchScreen';
  position: Position;
  showIt = false;
  character: string;
  inputValue: string;
  lastLength = 0;

  message = '';
  messages = [];

  constructor(
    private plt: Platform,
    private kb: Keyboard,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetooth: BluetoothService,
    private storage: StorageService
    ) { 
    this.position=new Position();
    this.position.x = 0;
    this.position.y = 0;
  }

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 450;
    this.context = this.canvasElement.getContext('2d');
  }

  show(){
    this.showIt = !this.showIt;
    this.showIt? this.myInput.setFocus() : this.kb.hide();
    if(!this.showIt) this.character='';
  }

  getCurrentPosition(ev){
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height); //Clear the canvas
    let lastX = this.position.x;
    if(Math.round(ev.touches[0].pageY) > 500){
      this.position.x = lastX;
      this.position.y=450;
    }
    else if(Math.round(ev.touches[0].pageY) < 50){
      this.position.x = lastX;
      this.position.y=0;
    }else{
      this.position.x = Math.round(ev.touches[0].pageX);
      this.position.y = Math.round(ev.touches[0].pageY)-50;
    }
    console.log(`${this.position.x} - ${this.position.y}`);
    this.title=`Touchscreen  ( ${this.position.x} , ${this.position.y} )`;
    this.drawCurrentPosition();
  } 

  drawCurrentPosition() {
    this.sendMessage(`${this.position.x},${this.position.y}#`);
    this.context.font="200px Arial";
    this.context.fillStyle='cyan';
    this.context.fillText('·',this.position.x-30,this.position.y+60);
  }

  onClick(ev){
    this.sendMessage(`click#`);
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height); //Clear the canvas
    console.log(`Click`);
    this.title=`Touchscreen  ( ${ev.clientX} , ${ev.clientY} ) ·`;
    this.drawClick('×', ev); //Alt+158
  }

  drawClick(myText, ev?:any) {
    this.context.font="50px Arial";
    this.context.fillStyle='orange';
    this.context.fillText(myText,ev.clientX-30,ev.clientY-30); 
  }


  getChar(evt: any){
    this.inputValue=evt.target.value;
    this.character=this.inputValue[this.inputValue.length - 1];

    if(evt.key == 'Backspace' || this.lastLength > this.inputValue.length){
      console.log('Backspace');
      this.character='Backspace';
    }else if(evt.key == 'Enter'){
      console.log('Enter');
      this.character='Enter';
    }else if(this.character == ' '){
      console.log('Whitespace');
      this.character='Whitespace';
    }else{
      console.log(this.character);
    }
    this.sendMessage(`${this.character}#`);//Añade # al final para que le controlador reconozca que ha finalizado el comando
    this.lastLength = this.inputValue.length;
  }
  
  onTouchStart(evt){
    console.log("TCHSTRT");
    this.sendMessage(`TCHSTRT ${ Math.round(evt.touches[0].pageX) } , ${ Math.round(evt.touches[0].pageY)}`);
  }

  onTouchEnd(evt){
    console.log("TOUCH_END");
    //this.sendMessage(`TOUCH_END`);
  }

     /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  sendMessage(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
        try {
          if (data) {
            const entry = JSON.parse(data);
            this.addLine(message);
          }
        } catch (error) {
          console.log(`[bluetooth-168]: ${JSON.stringify(error)}`);
        }
        this.presentToast(data);
        this.message = '';
      } else {
        this.presentToast(data);
      }
    });
  }

    /**
   * Recupera la información básica del servidor para las graficas de lineas.
   * @param message
   */
  addLine(message) {
    this.messages.push(message);
  }

    /**
   * Presenta un cuadro de mensaje.
   * @param {string} text Mensaje a mostrar.
   */
  async presentToast(text: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    await toast.present();
  }

}
 