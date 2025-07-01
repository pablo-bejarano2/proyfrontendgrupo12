export interface Talla {
  talla: string;
  stock: number;
}

export interface Categoria {
  _id: string;
  nombre: string;
}

export class Producto {
  _id?: string;
  nombre!: string;
  descripcion!: string;
  precio!: number;
  color!: string;
  imagenes!: string[];
  imagenUrl?: string; // Para compatibilidad con la interfaz anterior
  tallas!: Talla[];
  categoria!: Categoria | string;

  constructor(init?: Partial<Producto>) {
    Object.assign(this, init);
  }

  // Getter para compatibilidad con código que use 'id'
  get id(): string | undefined {
    return this._id;
  }

  // Método helper para obtener el nombre de la categoría
  get categoriaNombre(): string {
    if (this.categoria && typeof this.categoria === 'object' && this.categoria.nombre) {
      return this.categoria.nombre;
    }
    return '';
  }

  // Método helper para obtener la primera imagen
  get imagenPrincipal(): string {
    if (this.imagenes && this.imagenes.length > 0) {
      return this.imagenes[0];
    }
    return this.imagenUrl || '';
  }

  // Método helper para obtener stock total
  get stockTotal(): number {
    if (!this.tallas || this.tallas.length === 0) {
      // Si no hay tallas definidas, devolver 0 o un valor por defecto
      return 0;
    }
    return this.tallas.reduce((total, talla) => total + talla.stock, 0);
  }

  // Método helper para obtener stock de una talla específica
  getStockPorTalla(tallaSeleccionada: string): number {
    const talla = this.tallas?.find(t => t.talla === tallaSeleccionada);
    return talla ? talla.stock : 0;
  }

  // Método helper para obtener todas las tallas disponibles
  get tallasDisponibles(): string[] {
    return this.tallas?.filter(t => t.stock > 0).map(t => t.talla) || [];
  }
}
