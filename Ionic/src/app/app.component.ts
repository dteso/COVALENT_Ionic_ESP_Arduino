import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { appPages } from './shared/menu'
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { StatusService } from './services/status.service';
import { makeid } from './shared/utils/helpers';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = appPages; 

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private storage: StorageService,
    private statusService: StatusService,
    private statusBar: StatusBar,
    private router: Router
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    await this.storage
    .getTokenizedTopic()
    .then((topic) => {
      if(topic){
        this.statusService.tokenizedTopic = topic;
      }else{
        this.statusService.tokenizedTopic = makeid(8);
        this.storage.setTokenizedTopic(this.statusService.tokenizedTopic);
        console.log(this.statusService.tokenizedTopic);
      }
    })
    .catch((err) => console.log("error ", err));
  }

  ngOnInit() {
    this.router.navigate(['/home']);
  }
}
