import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherComponent } from './pages/weather.component';
import { WeatherRoutingModule } from './weather-routing.module';
import { GaugeModule } from 'angular-gauge';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from 'src/app/core/core.module';



@NgModule({
  declarations: [WeatherComponent],
  imports: [
    CommonModule,
    WeatherRoutingModule,
    IonicModule,
    CoreModule,
    GaugeModule.forRoot()
  ],
  bootstrap: [WeatherComponent],
  exports: [
    WeatherComponent
  ]
})
export class WeatherModule { }
