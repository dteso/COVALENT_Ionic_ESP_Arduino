import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TouchscreenComponent } from './touchscreen.component';

describe('TouchscreenComponent', () => {
  let component: TouchscreenComponent;
  let fixture: ComponentFixture<TouchscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TouchscreenComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TouchscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
