import { BluetoothService, StorageService } from './../../../services/services';
import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

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
  message = '';
  messages = [];
  selectedDevice;

  title = 'Bluetooth';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetooth: BluetoothService
  ) { }

  ngOnInit() {
    this.bluetooth.enableBT().then(isEnabled => {
      this.isEnabled= true;
      this.showSpinner = true;
      this.manageConnection();
    }).catch( err => {
      this.isEnabled= false;
    });
  }
  /**
 * Cierra la conexión bluetooth.
 */
  disconnect(): Promise<boolean> {
    return new Promise(result => {
      this.isConnected = false;
      this.bluetooth.disconnect().then(response => {
        result(response);
      });
    });
  }


  manageConnection() {
    this.bluetooth.storedConnection().then((connected) => {
      this.isConnected = true;
      this.showSpinner = false;
      this.sendMessage('> Ouuuh yeah!');
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


  /**
 * Al cerrar la aplicación se asegura de que se cierre la conexión bluetooth.
 */
  // ngOnDestroy() {
  //   this.disconnect();
  // }
  /**
   * 
 * Busca los dispositivos bluetooth dispositivos al arrastrar la pantalla hacia abajo.
 * @param refresher
 */
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

  /**
 * Verifica si ya se encuentra conectado a un dispositivo bluetooth o no.
 * @param seleccion Son los datos del elemento seleccionado  de la lista
 */
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
                  this.sendMessage('Ouuuh yeah!');
                  this.isConnected = true;
                  this.presentToast('CONECTADO CORRECTAMENTE');
                }, fail => {
                  this.isConnected = false;
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
                this.sendMessage('Ouuuh yeah!');
                this.isConnected = true;
                this.selectedDevice = seleccion;
                this.presentToast('Connected :)');
              }, fail => {
                this.isConnected = false;
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
    this.bluetooth.dataInOut(`${message}#\n`).subscribe(data => {
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
