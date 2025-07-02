import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { Pedido } from '../models/pedido';
import {
  environment
} from '@/environments/environment';
import { map, Observable } from 'rxjs';

export interface Pedido {
  _id: string;
  cliente?: { _id: string; nombres: string };
  emailCliente: string;
  items: { producto: { _id: string; nombre: string }; cantidad: number; subtotal: number }[];
  total: number;
  estado: string; // 'pendiente', 'enviado', 'entregado', etc
  fecha: string;
  direccion: { calle: string; ciudad: string; provincia: string; codigoPostal: string };
  metodoPago: string; // 'tarjeta', 'paypal', etc
  cupon?: { codigo: string; descuento: number }; // ID del cupón aplicado, si hay
}


@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crearPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.API_URL, pedido);
  }

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API_URL);
  }

  obtenerPedidoPorId(id: string): Observable<Pedido> {
    return this.http.get<Pedido> (`${this.API_URL}/${id}`);
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(this.API_URL).pipe(
      map(res => res.pedidos)
    );
  }

  createPedidos(pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.API_URL, pedido);
  }

  updatePedido(id: string, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<{ status: string, msg: string, pedido: Pedido }>(`${this.API_URL}/${id}`, pedido)
      .pipe(map(res => res.pedido));
  }

  deletePedido(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);

  }
}
