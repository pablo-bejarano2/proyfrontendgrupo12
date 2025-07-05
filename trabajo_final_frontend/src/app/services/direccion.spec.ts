import { TestBed } from '@angular/core/testing';

import { Direccion } from './direccion';

describe('Direccion', () => {
  let service: Direccion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Direccion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
