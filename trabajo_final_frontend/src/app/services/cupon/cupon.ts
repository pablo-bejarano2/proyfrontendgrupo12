import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Cupon {
  _id: string;
  codigo: string;
  nombre: string;
  descuento: number;
  fechaExpiracion: string;
  activo: boolean;
  usosMaximos: number;
  usosRestantes: number;
}



@Injectable({
  providedIn: 'root'
})
export class CuponService {
  private apiUrl = `${environment.apiUrl}/cupon`;

  constructor(private http: HttpClient ) {}

  getCupones(){
    return this.http.get<{ cupones: Cupon[] }>(this.apiUrl).pipe(
      map(response => response.cupones)
    );
  }

  createCupon(cupon: Partial<Cupon>) {
    return this.http.post<Cupon>(this.apiUrl, cupon);
  }

  updateCupon(id: string,cupon: Partial<Cupon>): Observable<any> {
    return this.http.put<Cupon>(`${this.apiUrl}/${id}`, cupon);
  }

  deleteCupon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
