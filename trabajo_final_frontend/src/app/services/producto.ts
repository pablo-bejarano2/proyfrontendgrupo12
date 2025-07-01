import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto } from '../models/producto';

export interface ProductoResponse {
  status: string;
  msg: string;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<ProductoResponse>(`${this.API_URL}/producto`)
      .pipe(
        map(response => response.productos || []),
        catchError(error => {
          console.error('Error al obtener productos:', error);
          return of([]);
        })
      );
  }

  obtenerProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/producto/${id}`);
  }

  obtenerProductosPorCategoria(categoriaNombre: string): Observable<Producto[]> {
    return this.http.get<ProductoResponse>(`${this.API_URL}/producto/categoria/${categoriaNombre}`)
      .pipe(
        map(response => response.productos || []),
        catchError(error => {
          console.error('Error al obtener productos por categoría:', error);
          return of([]);
        })
      );
  }

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<any>(`${this.API_URL}/producto`, producto)
      .pipe(
        map(response => response.producto)
      );
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.API_URL}/producto/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/producto/${id}`);
  }
}
