import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WebServerComponent } from './web-server.component';

describe('WebServerComponent', () => {
  let component: WebServerComponent;
  let fixture: ComponentFixture<WebServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebServerComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WebServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
