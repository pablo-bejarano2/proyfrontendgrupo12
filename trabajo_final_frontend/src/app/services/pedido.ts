import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../models/pedido';
import {
  environment
} from '@/environments/environment';

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
    return this.http.get<Pedido>(`${this.API_URL}/${id}`);
  }
}
