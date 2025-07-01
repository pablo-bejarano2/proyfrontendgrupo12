// trabajo_final_frontend/src/app/services/categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import {
  environment
} from '../../environments/environment';

export interface Categoria {
  _id?: string,
  nombre: string,
  descripcion: string
}

export interface CategoriaResponse {
  status: string,
  msg: string,
  categorias: Categoria[];
}
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private API_URL = environment.apiUrl;
  private categoriasActualizadas = new BehaviorSubject<void>(undefined);
  categoriasActualizadas$ = this.categoriasActualizadas.asObservable();

  constructor(private http: HttpClient) { }

  notificarCambioCategorias(){
    this.categoriasActualizadas.next();
  }
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<CategoriaResponse>(`${this.API_URL}/categoria`)
      .pipe(
        map(response => response.categorias || []),
        catchError(error => {
          console.error('Error al obtener categorias:', error);
          return of([]);
        })
      );
  }
  crearCategoria(categoria: Categoria): Observable<any> {
    return this.http.post<Categoria>(`${this.API_URL}/categoria`, categoria);
  }

  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/categoria/${id}`).pipe(
      catchError(error => {
        console.error('Error al eliminar categoría:', error);
        return of({
          status: 'ERROR',
          msg: 'Error procesando operación',
          causa: error.message
        });
      })
    );
  }

}
