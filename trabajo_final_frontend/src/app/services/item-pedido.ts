import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import { ItemPedido } from '../models/item-pedido';
import { environment } from '@/environments/environment';
import {
  HttpClient
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ItemPedidoService {
  private API_URL = environment.apiUrl + '/item-pedido';

  constructor(private http: HttpClient) {
    this.updateCartCount();
  }

  createItemPedido(item: Partial<ItemPedido>): Observable<ItemPedido> {
    return this.http.post<ItemPedido>(this.API_URL, item);
  }
  private cartItemsSubject = new BehaviorSubject<ItemPedido[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartItemsCountSubject = new BehaviorSubject<number>(0);
  cartItemsCount$ = this.cartItemsCountSubject.asObservable();

  private abrirCarritoSubject = new Subject<void>();
  abrirCarrito$ = this.abrirCarritoSubject.asObservable();

  addItem(item: ItemPedido) {
    const items = [...this.cartItemsSubject.value, item];
    this.cartItemsSubject.next(items);
    this.updateCartCount();
  }

  updateQuantity(id: string, cantidad: number) {
    const items = this.cartItemsSubject.value.map(item =>
      item._id === id ? { ...item, cantidad } : item
    );
    this.cartItemsSubject.next(items);
    this.updateCartCount();
  }

  removeItem(id: string) {
    const items = this.cartItemsSubject.value.filter(item => item._id !== id);
    this.cartItemsSubject.next(items);
    this.updateCartCount();
  }

  clearCart() {
    this.cartItemsSubject.next([]);
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
