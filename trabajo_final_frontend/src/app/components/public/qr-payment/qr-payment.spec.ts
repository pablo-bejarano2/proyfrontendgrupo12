import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPayment } from './qr-payment';

describe('QrPayment', () => {
  let component: QrPayment;
  let fixture: ComponentFixture<QrPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
