import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  color: string;
  imagenUrl?: string;
  categoria: any;
}

export interface ProductoResponse {
  status: string;
  msg: string;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api/producto';

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<ProductoResponse>(this.apiUrl)
      .pipe(
        map(response => response.productos || [])
      );
  }

  obtenerProductoPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  obtenerProductosPorCategoria(categoriaNombre: string): Observable<Producto[]> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/categoria/${categoriaNombre}`)
      .pipe(
        map(response => response.productos || [])
      );
  }

  crearProducto(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<any>(this.apiUrl, producto)
      .pipe(
        map(response => response.producto)
      );
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
