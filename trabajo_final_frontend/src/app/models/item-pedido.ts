import { Producto } from '../services/producto';

export interface ItemPedido {
  id?: string;
  producto: Producto;
  cantidad: number;
  talla: string;
  precio_unitario: number;
  color?: string;
}
