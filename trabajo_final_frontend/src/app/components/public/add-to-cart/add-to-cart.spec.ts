import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCart } from './add-to-cart';

describe('AddToCart', () => {
  let component: AddToCart;
  let fixture: ComponentFixture<AddToCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToCart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
