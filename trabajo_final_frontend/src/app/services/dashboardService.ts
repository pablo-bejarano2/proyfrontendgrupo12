import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private API_URL = environment.apiUrl + '/dashboard';

  constructor(private http: HttpClient) { }


  getUsuariosPorDia(): Observable<number[]> {
    return this.http.get<number[]>(`${this.API_URL}/usuariosPorDia`);
  }
  getPedidosPorDia(): Observable<number[]> {
    return this.http.get<number[]>(`${this.API_URL}/pedidosPorDia`);
  }
  getDineroPorPedido(): Observable<number[]> {
    return this.http.get<number[]>(`${this.API_URL}/dineroPorPedido`);
  }
  getCuponesUsados(): Observable<{labels: string[], data: number[]}> {
    return this.http.get<{labels: string[], data: number[]}>(`${this.API_URL}/cuponesUsados`);
  }

}
