import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cupon } from '../models/cupon';

@Injectable({
  providedIn: 'root'
})
export class CuponService {
  private apiUrl = 'http://localhost:3000/api/cupon';

  constructor(private http: HttpClient) {}

  validarCupon(codigo: string) {
    return this.http.post<any>(this.apiUrl + '/aplicar', { codigo });
  }

  obtenerCupones(): Observable<Cupon[]> {
    return this.http.get<Cupon[]>(this.apiUrl);
  }

  crearCupon(cupon: Cupon): Observable<Cupon> {
    return this.http.post<Cupon>(this.apiUrl, cupon);
  }
}
