import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
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
  private apiUrl = `${environment.apiUrl}/pedido`;
  // Aquí puedes definir los métodos para interactuar con la API de pedidos
  // Por ejemplo, obtener pedidos, crear un nuevo pedido, actualizar el estado de un pedido


  constructor(private http: HttpClient) { }


  getPedidos(): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(this.apiUrl).pipe(
      map(res => res.pedidos)
    );
  }

  createPedidos(pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  updatePedido(id: string, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<{ status: string, msg: string, pedido: Pedido }>(`${this.apiUrl}/${id}`, pedido)
      .pipe(map(res => res.pedido));
  }

  deletePedido(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
