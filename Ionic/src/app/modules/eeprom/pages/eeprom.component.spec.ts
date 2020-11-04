import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EepromComponent } from './eeprom.component';

describe('EepromComponent', () => {
  let component: EepromComponent;
  let fixture: ComponentFixture<EepromComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EepromComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EepromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
