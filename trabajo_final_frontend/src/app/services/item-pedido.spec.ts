import { TestBed } from '@angular/core/testing';

import { ItemPedido } from './item-pedido';

describe('ItemPedido', () => {
  let service: ItemPedido;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemPedido);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
