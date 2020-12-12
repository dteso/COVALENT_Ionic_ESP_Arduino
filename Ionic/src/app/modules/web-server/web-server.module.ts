import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebServerComponent } from './pages/web-server.component';
import { WebServerRoutingModule } from './web-server-routing.module';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [WebServerComponent],
  imports: [
    CommonModule,
    IonicModule,
    CoreModule,
    WebServerRoutingModule
  ],
  providers:[
    
  ],
  exports: [
    WebServerComponent
  ],
  bootstrap: [WebServerComponent]
})
export class WebServerModule { }
