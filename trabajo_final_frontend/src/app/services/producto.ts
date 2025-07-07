import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tallas: Talla[];
  color: string;
  imagenes: string[];
  categoria: any;
}
export interface Talla{
  _id: string;
  talla: string;
  stock: number;
}

export interface Categoria {
  _id: string;
  nombre: string;
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
  private API_URL = environment.apiUrl;
  valorBusqueda = '';

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

  crearProducto(producto: FormData): Observable<any>{
    return this.http.post<any>(`${this.API_URL}/producto`, producto)
      .pipe(
        map(response => response.producto)
      );
  }

actualizarProducto(id: string, producto: FormData): Observable<Producto> {
  return this.http.put<any>(`${this.API_URL}/producto/${id}`, producto)
    .pipe(
      map(response => response.producto)
    );
}

  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/producto/${id}`);
  }

  buscarPorNombre(nombre: string){
    return this.http.get<ProductoResponse>(`${this.API_URL}/producto/nombre?nombre=${nombre}`)
     .pipe(
        map(response => response.productos || []),
        catchError(error => {
          console.error('Error al obtener productos por nombre:', error);
          return of([]);
        })
      );
  }
}
