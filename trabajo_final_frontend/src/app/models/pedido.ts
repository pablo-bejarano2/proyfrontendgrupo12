export interface Pedido {
  _id?: string;
  cliente?: string; // ID de usuario (opcional)
  emailCliente?: string;
  fecha?: Date;
  estado?: 'pendiente' | 'enviado' | 'entregado' | 'cancelado';
  items: string[]; // IDs de ItemPedido (según backend)
  metodoPago: 'tarjeta' | 'efectivo' | 'transferencia';
  direccion: string; // ID de Dirección
  cupon?: string; // ID de cupón
  total: number;
}
