import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from './producto';
export interface ItemPedido {
  producto: Producto;
  talla: string;
  cantidad: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: ItemPedido[] = [];
  private cartSubject = new BehaviorSubject<ItemPedido[]>([]);
  cart$ = this.cartSubject.asObservable();

  addToCart(producto: any, talla: string, cantidad: number) {
    const subtotal = producto.precio * cantidad;

    // Buscar si ya existe ese producto con esa talla en el carrito
    const existingIndex = this.items.findIndex(
      item => item.producto._id === producto._id && item.talla === talla
    );

    if (existingIndex >= 0) {
      // Sumar cantidad si ya existe
      this.items[existingIndex].cantidad += cantidad;
      this.items[existingIndex].subtotal = this.items[existingIndex].cantidad * producto.precio;
    } else {
      // Agregar nuevo
      this.items.push({ producto, talla, cantidad, subtotal });
    }

    this.cartSubject.next(this.items);
  }

  removeFromCart(index: number) {
    this.items.splice(index, 1);
    this.cartSubject.next(this.items);
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);
  }

  getCartItems() {
    return this.items;
  }
}
