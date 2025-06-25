// trabajo_final_frontend/src/app/services/categoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  environment
} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/categoria`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener categorías:', error);
          return of([]);
        })
      );
  }
}
