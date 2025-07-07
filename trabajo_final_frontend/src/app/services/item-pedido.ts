import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { ItemPedido } from '../models/item-pedido';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ItemPedidoService {
  private API_URL = environment.apiUrl + '/itemPedido';
  private CART_STORAGE_KEY = 'shopping_cart_items';

  // Eliminar la duplicación de este subject
  private cartItemsSubject = new BehaviorSubject<ItemPedido[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartItemsCountSubject = new BehaviorSubject<number>(0);
  public cartItemsCount$ = this.cartItemsCountSubject.asObservable();

  private abrirCarritoSubject = new Subject<void>();
  public abrirCarrito$ = this.abrirCarritoSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartFromStorage();
    this.updateCartCount();
  }

  private loadCartFromStorage() {
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        this.cartItemsSubject.next(items);
        this.updateCartCount();
      } catch (e) {
        console.error('Error al cargar el carrito desde localStorage:', e);
        this.cartItemsSubject.next([]);
      }
    }
  }

  private saveCartToStorage(items: ItemPedido[]) {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
  }

  createItemPedido(item: Partial<ItemPedido>): Observable<ItemPedido> {
    return this.http.post<any>(this.API_URL, item).pipe(
      map(response => response.itemPedido)
    );
  }

  addItem(item: ItemPedido) {
    const items = [...this.cartItemsSubject.value, item];
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.updateCartCount();
  }

  updateQuantity(id: string, cantidad: number) {
    const items = this.cartItemsSubject.value.map(item =>
      item._id === id ? { ...item, cantidad } : item
    );
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.updateCartCount();
  }

  removeItem(id: string) {
    const items = this.cartItemsSubject.value.filter(item => item._id !== id);
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.updateCartCount();
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
    this.updateCartCount();
  }

  abrirCarrito() {
    this.abrirCarritoSubject.next();
  }

  cartSummary() {
    const items = this.cartItemsSubject.value;
    const subtotal = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    const tax = subtotal * 0.21; // ejemplo: 21% IVA
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  private updateCartCount() {
    this.cartItemsCountSubject.next(this.cartItemsSubject.value.length);
  }
}
