import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface LocalidadCP {
  cp: string;
  localidad: string;
  provincia: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodigoPostalService {
  private API_URL = environment.apiUrl + '/codigoPostal';

  constructor(private http: HttpClient) {}

  buscarPorCP(codigoPostal: string): Observable<LocalidadCP[]> {
    return this.http.get<LocalidadCP[]>(`${this.API_URL}/${codigoPostal}`);
  }
}
