export interface Cupon {
  _id?: string;
  codigo: string;
  descuento: number; // Monto o porcentaje de descuento
  activo?: boolean;
  fechaExpiracion?: Date;
}
