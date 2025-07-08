import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface Direccion {
  _id?: string;
  calle: string;
  ciudad: string;
  provincia?: string;
  codigoPostal: string;
}

@Injectable({
  providedIn: 'root'
})
export class DireccionService {
  private API_URL = environment.apiUrl + '/direccion';

  constructor(private http: HttpClient) {}

  createDireccion(direccion: Partial<Direccion>): Observable<Direccion> {
    return this.http.post<Direccion>(this.API_URL, direccion);
  }
}
