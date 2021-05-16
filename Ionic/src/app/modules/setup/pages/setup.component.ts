import { BluetoothService, StorageService } from "./../../../services/services";
import { StatusService } from "../../../services/status.service";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ToastController, AlertController } from "@ionic/angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";

@Component({
  selector: "app-setup",
  templateUrl: "./setup.component.html",
  styleUrls: ["./setup.component.scss"],
})
export class SetupComponent implements OnInit {
  @ViewChild("terminal") private myContainer: ElementRef;

  devices: any[] = [];
  showSpinner = false;
  isConnected = false;
  isEnabled = false;
  messages = [];
  selectedDevice;
  fullData: Array<String> = [];

  title = "Bluetooth";
  btForm: FormGroup;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetooth: BluetoothService,
    private statusService: StatusService,
    private storage: StorageService,
    private formBuilder: FormBuilder
  ) {
    this.btForm = this.formBuilder.group({
      message: ["", Validators.required],
    });
  }

  ionViewDidEnter(){
    this.sendMessage("    --------- Bluetooth Online ---------");
  }

  ngOnInit() {
    if (!this.statusService.getBluetoothConnectionStatus()) {
      this.bluetooth
        .enableBT()
        .then((isEnabled) => {
          console.info(isEnabled);
          this.isEnabled = true;
          this.showSpinner = true;
          this.manageConnection();
        })
        .catch((err) => {
          this.isEnabled = false;
        });
    }
  }

  disconnect(): Promise<boolean> {
    return new Promise((result) => {
      this.isConnected = false;
      this.statusService.state.bluetoothConnected = false;
      this.bluetooth.disconnect().then((response) => {
        result(response);
      });
    });
  }

  onSubmit() {
    if (!this.btForm.invalid) {
      this.sendMessage(this.btForm.controls.message.value);
    }
  }

  manageConnection() {
    // this.bluetooth.storedConnection().then(
    //   (connected) => {
    //     console.info(connected);
    //     this.isConnected = true;
    //     this.statusService.setBluetoothConnected(true);
    //     this.statusService.state.bluetoothConnected = true;
    //     this.showSpinner = false;
    //     this.sendMessage("> BLUETOOTH CONNECTED");
    //     this.storage.getBluetoothId().then((res) => {
    //       this.statusService.state.bluetoothId = res;
    //       if (this.statusService.state.bluetoothId) {
    //         this.sendMessage(
    //           ">>>BLUETOOTH_ID: " + this.statusService.state.bluetoothId
    //         );
    //       }
    //     });
    //   },
    //   (fail) => {
        this.bluetooth
          .searchBluetooth()
          .then(
            (devices: Array<Object>) => {
              this.devices = devices;
              this.showSpinner = false;
            },
            (error) => {
              this.presentToast(error, "danger");
              this.showSpinner = false;
            }
          )
          .catch((err) => {
            this.bluetooth.enableBT();
          });
    //   }
    // );
  }

  // ngOnDestroy() {
  //   this.disconnect();
  // }

  refreshBluetooth(refresher) {
    if (refresher) {
      this.bluetooth.searchBluetooth().then(
        (successMessage: Array<Object>) => {
          this.devices = [];
          this.devices = successMessage;
          refresher.target.complete();
        },
        (fail) => {
          this.presentToast("Activate bluetooth first", "primary");
          refresher.target.complete();
        }
      );
    }
  }

  checkConnection(seleccion) {
    this.bluetooth.checkConnection().then(
      async (isConnected) => {
        console.info(isConnected);
        const alert = await this.alertCtrl.create({
          header: "RECONEXIÓN",
          message: "MENSAJE",
          buttons: [
            {
              text: "CANCELAR",
              role: "cancel",
              handler: () => {},
            },
            {
              text: "ACEPTAR",
              handler: () => {
                this.disconnect().then(() => {
                  this.bluetooth.deviceConnection(seleccion.id).then(
                    (success) => {
                      this.sendMessage("> BLUETOOTH CONNECTED");
                      this.isConnected = true;
                      this.statusService.setBluetoothConnected(true);
                      this.presentToast("CONECTADO CORRECTAMENTE", "success");
                    },
                    (fail) => {
                      console.info(fail);
                      this.isConnected = false;
                      this.statusService.setBluetoothConnected(false);
                      this.presentToast("NO SE PUDO CONECTAR", "danger");
                    }
                  );
                });
              },
            },
          ],
        });
        await alert.present();
      },
      async (notConnected) => {
        console.info(notConnected);
        const alert = await this.alertCtrl.create({
          header: "Connect?",
          message: "Connect to this device?",
          buttons: [
            {
              text: "CANCELAR",
              role: "cancel",
              handler: () => {},
            },
            {
              text: "ACEPTAR",
              handler: () => {
                this.bluetooth.deviceConnection(seleccion.id).then(
                  (success) => {
                    console.info(success);
                    this.sendMessage("> BLUETOOTH CONNECTED");
                    this.isConnected = true;
                    this.statusService.setBluetoothConnected(true);
                    this.selectedDevice = seleccion;
                    this.presentToast("Connected :)", "success");
                  },
                  (fail) => {
                    console.info(fail);
                    this.isConnected = false;
                    this.statusService.setBluetoothConnected(false);
                    this.presentToast("Connection failed :(", "danger");
                  }
                );
              },
            },
          ],
        });
        await alert.present();
      }
    );
  }

  /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  sendMessage(message: any) {
    this.bluetooth.dataInOut(`${message}\n`).subscribe((data) => {
      this.scrollToBottom();
      if (data !== "BLUETOOTH.NOT_CONNECTED") {
        if (data) {
          this.addLine(message);
          this.fullData.push(data);
        }
      } else {
        this.presentToast("NO DEVICES CONNECTED", "danger");
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
    this.scrollToBottom();
  }

  /**
   * Presenta un cuadro de mensaje.
   * @param {string} text Mensaje a mostrar.
   */
  async presentToast(text: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: color,
    });
    await toast.present();
  }

  getNow() {
    return new Date();
  }

  scrollToBottom(): void {
    try {
      this.myContainer.nativeElement.scroll({
        top: this.myContainer.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
    } catch (err) {}
  }
}
