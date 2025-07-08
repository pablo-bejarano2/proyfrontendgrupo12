// trabajo_final_frontend/src/app/models/item-pedido.spec.ts
import { ItemPedido } from './item-pedido';

describe('ItemPedido', () => {
  it('should create an instance', () => {
    const item: ItemPedido = {
      producto: {} as any,
      cantidad: 1,
      subtotal: 100,
      talla: 'M'
    };
    expect(item).toBeTruthy();
  });
});
