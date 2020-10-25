import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsoleComponent } from './console.component';
import { CustomSerialService } from 'src/app/services/services';



@NgModule({
  declarations: [ConsoleComponent],
  imports: [
    CommonModule
  ],
  providers: [CustomSerialService],
  exports: [ConsoleComponent]
})
export class ConsoleModule { }
