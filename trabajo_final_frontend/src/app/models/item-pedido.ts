import { Producto } from '../services/producto';

export interface ItemPedido {
  _id?: string;
  producto: Producto;
  cantidad: number;
  subtotal: number;
  talla: string;
  precio_unitario: number;
  color?: string;
}
