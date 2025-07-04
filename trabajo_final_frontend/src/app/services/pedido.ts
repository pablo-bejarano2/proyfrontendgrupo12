import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { map, Observable } from 'rxjs';

export interface Pedido {
  _id: string;
  cliente?: { _id: string; nombres: string };
  emailCliente: string;
  items: { _id: string; producto: { _id: string; nombre: string }; cantidad: number; subtotal: number }[];
  total: number;
  estado: string;
  fecha: string;
  direccion: { _id: string; calle: string; ciudad: string; provincia: string; codigoPostal: string };
  metodoPago: string;
  cupon?: { _id: string; codigo: string; descuento: number };
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private API_URL = environment.apiUrl + '/pedido';

  constructor(private http: HttpClient) {}

  createPedidos(pedido: Partial<Pedido>): Observable<Pedido> {
    // Envía el objeto tal cual, sin transformar campos a IDs
    return this.http.post<{ status: string, msg: string, pedido: Pedido }>(this.API_URL, pedido)
      .pipe(map(res => res.pedido));
  }

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(this.API_URL).pipe(
      map(res => res.pedidos)
    );
  }

  obtenerPedidoPorId(id: string): Observable<Pedido> {
    return this.http.get<{ pedido: Pedido }>(`${this.API_URL}/${id}`).pipe(
      map(res => res.pedido)
    );
  }

  obtenerPedidoPorClienteId(clienteId: string): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(`${this.API_URL}/cliente/${clienteId}`).pipe(
      map(res => res.pedidos)
    );
  }

  updatePedido(id: string, pedido: Partial<Pedido>): Observable<Pedido> {
    // Envía el objeto tal cual, sin transformar campos a IDs
    return this.http.put<{ status: string, msg: string, pedido: Pedido }>(`${this.API_URL}/${id}`, pedido)
      .pipe(map(res => res.pedido));
  }

  deletePedido(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
