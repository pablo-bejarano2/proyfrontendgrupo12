import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemPedido } from '../models/item-pedido';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemPedidoService {
  private _cartItems = new BehaviorSubject<ItemPedido[]>([]);
  readonly cartItems$ = this._cartItems.asObservable();
  readonly cartItemsCount$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, i) => sum + i.cantidad, 0))
  );
  private abrirCarritoSubject = new Subject<void>();
  abrirCarrito$ = this.abrirCarritoSubject.asObservable();
  constructor() {
      this.loadCartFromStorage();
    }

  abrirCarrito() {
    this.abrirCarritoSubject.next();
  }


  addItem(item: ItemPedido): void {
    const items = this._cartItems.getValue();
    // Usar _id en lugar de id y también comparar talla y color para items únicos
    const index = items.findIndex(i =>
      i.producto._id === item.producto._id &&
      i.talla === item.talla &&
      i.color === item.color
    );

    if (index !== -1) {
      // Si ya existe, aumentar cantidad
      items[index].cantidad += item.cantidad;
    } else {
      // Si no existe, agregar nuevo item
      items.push({
        ...item,
        id: this.generateItemId(item) // Generar ID único para el item del carrito
      });
    }
    this._cartItems.next(items);
    this.saveCartToStorage();
  }

  removeItem(itemId: string): void {
    const items = this._cartItems.getValue().filter(i => i.id !== itemId);
    this._cartItems.next(items);
    this.saveCartToStorage();
  }

  updateQuantity(itemId: string, cantidad: number): void {
    const items = this._cartItems.getValue().map(i =>
      i.id === itemId ? { ...i, cantidad } : i
    );
    this._cartItems.next(items);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this._cartItems.next([]);
    this.saveCartToStorage();
  }

  cartSummary() {
    const items = this._cartItems.getValue();
    const subtotal = items.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
    const tax = Math.round(subtotal * 0.21);
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, i) => sum + i.cantidad, 0)
    };
  }

  // Método helper para generar ID único del item en el carrito
  private generateItemId(item: ItemPedido): string {
    return `${item.producto._id}-${item.talla}-${item.color || 'default'}-${Date.now()}`;
  }

  // Método para verificar si un producto con talla específica ya está en el carrito
  isInCart(productoId: string, talla: string, color?: string): boolean {
    const items = this._cartItems.getValue();
    return items.some(i =>
      i.producto._id === productoId &&
      i.talla === talla &&
      i.color === color
    );
  }

  // Método para obtener la cantidad de un producto específico en el carrito
  getQuantityInCart(productoId: string, talla: string, color?: string): number {
    const items = this._cartItems.getValue();
    const item = items.find(i =>
      i.producto._id === productoId &&
      i.talla === talla &&
      i.color === color
    );
    return item ? item.cantidad : 0;
  }

  // Método para obtener un item específico del carrito
  getCartItem(productoId: string, talla: string, color?: string): ItemPedido | undefined {
    const items = this._cartItems.getValue();
    return items.find(i =>
      i.producto._id === productoId &&
      i.talla === talla &&
      i.color === color
    );
  }

  // --- Persistencia ---
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this._cartItems.getValue()));
    } catch (error) {
      console.error('Error guardando carrito en localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const data = localStorage.getItem('cart');
      if (data) {
        const parsedData = JSON.parse(data);
        // Validar que los datos sean válidos antes de cargarlos
        if (Array.isArray(parsedData)) {
          this._cartItems.next(parsedData);
        }
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage:', error);
      // En caso de error, inicializar con carrito vacío
      this._cartItems.next([]);
    }
  }
}
