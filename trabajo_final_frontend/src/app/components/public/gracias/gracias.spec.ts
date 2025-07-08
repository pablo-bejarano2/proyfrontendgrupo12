import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gracias } from './gracias';

describe('Gracias', () => {
  let component: Gracias;
  let fixture: ComponentFixture<Gracias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gracias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gracias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
