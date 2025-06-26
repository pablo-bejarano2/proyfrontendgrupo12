import { TestBed } from '@angular/core/testing';

import {
  Producto,
  ProductoService
} from './producto';

describe('Producto', () => {
  let service: ProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
