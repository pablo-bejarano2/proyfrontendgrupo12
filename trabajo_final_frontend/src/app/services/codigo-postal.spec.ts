import { TestBed } from '@angular/core/testing';

import { CodigoPostal } from './codigo-postal';

describe('CodigoPostal', () => {
  let service: CodigoPostal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodigoPostal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
