import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { NetworkService, StorageService } from 'src/app/services/services';
import { StatusService } from 'src/app/services/status.service';


interface System{
  id: number;
  name: string;
  ssid?: string;
  location?: string;
  description?: string;
}

@Component({
  selector: 'app-add-system',
  templateUrl: './add-system.component.html',
  styleUrls: ['./add-system.component.scss'],
})
export class AddSystemComponent implements OnInit {

  private newSystemForm: FormGroup;
  system: System;
  connected = false;

  constructor(
    private formBuilder: FormBuilder,
    private networkService: NetworkService,
    private toastCtrl: ToastController,
    private statusService: StatusService,
    private storage: StorageService
  ) { 
    this.newSystemForm = this.formBuilder.group({
      name: ['', Validators.required],
      ssid: [''],
      location: [''],
      description: [''],
    });
  }

  ngOnInit() {
    this.networkService.getSSID().then(res => {
      if (res) {
        this.connected = true;
        console.log('got SSID!');
      }
      this.newSystemForm.controls.ssid.setValue(res);
    });
  }

  saveSystem(){
    this.system =  this.newSystemForm.value;
    this.storeConfig();
    this.newSystemForm.reset();
  }

  async storeConfig() {
    this.statusService.state.system = this.system.name;
    await this.storage.setSystem(this.system).then(res => 
      {
        console.log(res);
        this.presentToast("NEW SYSTEM ADDED !!!", "success");
      })
      .catch(err => console.log("ERROR: ", err));
  }

  async presentToast(text: string, color:string) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: color
    });
    await toast.present();
  }

}
