import { TestBed } from '@angular/core/testing';

import { Cupon } from './cupon';

describe('Cupon', () => {
  let service: Cupon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cupon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
