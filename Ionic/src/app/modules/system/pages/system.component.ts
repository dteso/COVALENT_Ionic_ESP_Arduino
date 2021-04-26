import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/services';


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit{

  storedSystems  = [];
  
  constructor(
    private readonly storage: StorageService,
    private readonly router: Router
  ) { }

  async ngOnInit() {
    await this.storage.getSystems().then(sys => {
      this.storedSystems = sys;
      console.log(this.storedSystems);
    }).catch(err=> console.log("error ", err));
  }

  toSystemDetail(id){
    this.router.navigate([`system-detail/${id}`]);
  }
}
   