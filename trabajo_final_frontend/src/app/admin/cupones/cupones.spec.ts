import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cupones } from './cupones';

describe('Cupones', () => {
  let component: Cupones;
  let fixture: ComponentFixture<Cupones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cupones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cupones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
