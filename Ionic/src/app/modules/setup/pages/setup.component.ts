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
  message = '';
  messages = [];

  title = 'Setup';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetooth: BluetoothService,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.showSpinner = true;
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
      });
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
    /**
   * Al cerrar la aplicación se asegura de que se cierre la conexión bluetooth.
   */
  // ngOnDestroy() {
  //   this.disconnect();
  // }
    /**
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
        //this.presentToast(this.translate.instant(fail));
        this.presentToast("ERROR");
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
        // header: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.TITLE'),
        // message: this.translate.instant('BLUETOOTH.ALERTS.RECONNECT.MESSAGE'),
        header: 'RECONEXIÓN',
        message: 'MENSAJE',
        buttons: [
          {
            // text: this.translate.instant('CANCEL'),
            text: 'CANCELAR',
            role: 'cancel',
            handler: () => {}
          },
          {
            // text: this.translate.instant('ACCEPT'),
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
        // header: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.TITLE'),
        // message: this.translate.instant('BLUETOOTH.ALERTS.CONNECT.MESSAGE'),
        header: 'Connect?',
        message: 'Connect to this device?',
        buttons: [
          {
            // text: this.translate.instant('CANCEL'),
            // role: 'cancel',
            text: 'CANCELAR',
            role: 'cancel',
            handler: () => {}
          },
          {
            // text: this.translate.instant('ACCEPT'),
            text: 'ACEPTAR',
            handler: () => {
              this.bluetooth.deviceConnection(seleccion.id).then(success => {
                this.sendMessage('Ouuuh yeah!');
                this.isConnected = true;
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
