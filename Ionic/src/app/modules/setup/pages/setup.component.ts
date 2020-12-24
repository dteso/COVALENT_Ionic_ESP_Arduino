import { BluetoothService, StorageService } from './../../../services/services';
import { StatusService } from '../../../services/status.service';
import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {

  devices: any[] = [];
  showSpinner = false;
  isConnected = false;
  isEnabled = false;
  //message = '';
  messages = [];
  selectedDevice;
  fullData='';

  title = 'Bluetooth';
  btForm: FormGroup;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetooth: BluetoothService,
    private statusService: StatusService,
    private formBuilder: FormBuilder
  ) { 
    this.btForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    if(!this.statusService.getBluetoothConnectionStatus()){
      this.bluetooth.enableBT().then(isEnabled => {
        this.isEnabled= true;
        this.showSpinner = true;
        this.manageConnection();
      }).catch( err => {
        this.isEnabled= false;
      });
    }
  }

  disconnect(): Promise<boolean> {
    return new Promise(result => {
      this.isConnected = false;
      this.statusService.setBluetoothConnected(false);
      this.bluetooth.disconnect().then(response => {
        result(response);
      });
    });
  }


  onSubmit(){
    if(!this.btForm.invalid){
      this.sendMessage(this.btForm.controls.message.value);
    }
  }


  manageConnection() {
    this.bluetooth.storedConnection().then((connected) => {
      this.isConnected = true;
      this.statusService.setBluetoothConnected(true);
      this.showSpinner = false;
      this.sendMessage('> BLUETOOTH CONNECTED');
    }, (fail) => {
      this.bluetooth.searchBluetooth().then((devices: Array<Object>) => {
        this.devices = devices;
        this.showSpinner = false;
      }, (error) => {
        this.presentToast(error);
        this.showSpinner = false;
      }).catch(err => {
        this.bluetooth.enableBT();
      });
    });
  }



  // ngOnDestroy() {
  //   this.disconnect();
  // }

  refreshBluetooth(refresher) {
    if (refresher) {
      this.bluetooth.searchBluetooth().then((successMessage: Array<Object>) => {
        this.devices = [];
        this.devices = successMessage;
        refresher.target.complete();
      }, fail => {
        this.presentToast("Activate bluetooth first");
        refresher.target.complete();
      });
    }
  }


  checkConnection(seleccion) {
    this.bluetooth.checkConnection().then(async (isConnected) => {
      const alert = await this.alertCtrl.create({
        header: 'RECONEXIÓN',
        message: 'MENSAJE',
        buttons: [
          {
            text: 'CANCELAR',
            role: 'cancel',
            handler: () => { }
          },
          {
            text: 'ACEPTAR',
            handler: () => {
              this.disconnect().then(() => {
                this.bluetooth.deviceConnection(seleccion.id).then(success => {
                  this.sendMessage('> BLUETOOTH CONNECTED');
                  this.isConnected = true;
                  this.statusService.setBluetoothConnected(true);
                  this.presentToast('CONECTADO CORRECTAMENTE');
                }, fail => {
                  this.isConnected = false;
                  this.statusService.setBluetoothConnected(false);
                  this.presentToast('NO SE PUDO CONECTAR');
                });
              });
            }
          }
        ]
      });
      await alert.present();
    }, async (notConnected) => {
      const alert = await this.alertCtrl.create({
        header: 'Connect?',
        message: 'Connect to this device?',
        buttons: [
          {
            text: 'CANCELAR',
            role: 'cancel',
            handler: () => { }
          },
          {
            text: 'ACEPTAR',
            handler: () => {
              this.bluetooth.deviceConnection(seleccion.id).then(success => {
                this.sendMessage('> BLUETOOTH CONNECTED');
                this.isConnected = true;
                this.statusService.setBluetoothConnected(true);
                this.selectedDevice = seleccion;
                this.presentToast('Connected :)');
              }, fail => {
                this.isConnected = false;
                this.statusService.setBluetoothConnected(false);
                this.presentToast('Connection failed :(');
              });
            }
          }
        ]
      });
      await alert.present();
    });
  }


  /**
  * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
  */
  sendMessage(message: string) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe(data => {
      if (data !== 'BLUETOOTH.NOT_CONNECTED') {
          if (data) {
            this.addLine(message);
          }
        this.fullData+= data;
      } else {
        this.presentToast('NO DEVICES CONNECTED');
      }
      this.btForm.controls.message.reset();
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
