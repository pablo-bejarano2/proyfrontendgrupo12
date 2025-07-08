import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import {
  switchMap,
  forkJoin,
  map,
  Observable,
  firstValueFrom,
  of
} from 'rxjs';
import { ItemPedidoService } from './item-pedido';
import { DireccionService } from './direccion';
import { CuponService } from '../services/cupon/cupon';

export interface Pedido {
  _id: string;
  cliente?: string | { _id: string; nombres: string };
  emailCliente: string;
  items: { _id: string; producto: { _id: string; nombre: string }; cantidad: number; subtotal: number }[];
  total: number;
  estado: string;
  fecha: string;
  direccion: string | {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    sucursalEnvio?: string;
    transportadora?: string;
  };
  metodoPago: string;
  cupon?: { _id: string; codigo: string; descuento: number };
  transportadora: string;
  sucursalEnvio: string;
}
export interface CheckoutData {
  email: string;
  direccion: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  items: any[];
  total: number;
  cuponCode?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private API_URL = environment.apiUrl + '/pedido';

  constructor(
    private http: HttpClient,
    private itemPedidoService: ItemPedidoService,
    private direccionService: DireccionService,
    private cuponService: CuponService,
  ) {}

  crearPedidoCompleto(checkoutData: CheckoutData): Observable<Pedido> {
    // Obtener el token (podría ser null para usuarios no autenticados)
    const token = localStorage.getItem('token');

    // Crear headers - funcionará con o sin token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };

    // 1. Crear items de pedido - ahora funciona para invitados también
    const itemPromises = checkoutData.items.map(item =>
      this.http.post<any>(`${environment.apiUrl}/itemPedido`, {
        producto: item.producto,
        cantidad: item.cantidad,
        talla: item.talla,
        subtotal: item.subtotal || 0
      }, { headers })
    );

    return forkJoin(itemPromises).pipe(
      switchMap((itemsCreados: any[]) => {
        const clienteId = sessionStorage.getItem('id');
        const itemIds = itemsCreados.map(item => item.itemPedido._id);

        // 2. Crear dirección - funciona para invitados también
        return this.http.post<any>(`${environment.apiUrl}/direccion`, {
          calle: checkoutData.direccion.calle,
          ciudad: checkoutData.direccion.ciudad,
          provincia: checkoutData.direccion.provincia,
          codigoPostal: checkoutData.direccion.codigoPostal,
          localidad: checkoutData.direccion.ciudad
        }, { headers }).pipe(
          switchMap((direccionCreada: any) => {
            console.log('Direccion creada:', direccionCreada); // <-- AQUÍ
            // 3. Crear objeto pedido
            const pedido: Partial<Pedido> = {
              emailCliente: checkoutData.email,
              items: itemIds,
              total: checkoutData.total,
              direccion: direccionCreada.direccion._id,
              metodoPago: 'qr',
              estado: 'pendiente',
              transportadora: 'Correo Argentino',
              sucursalEnvio: checkoutData.direccion.ciudad
            };

            // 4. Si hay cupón
            if (checkoutData.cuponCode && checkoutData.cuponCode.trim() !== '') {
              pedido.cupon = { codigo: checkoutData.cuponCode.trim() } as any;
            }

            if (clienteId) {
              pedido.cliente = clienteId;
            }

            // 5. Crear pedido - ahora usando la misma lógica de headers
            return this.http.post<{ status: string, msg: string, pedido: Pedido }>(
              this.API_URL,
              pedido,
              { headers }
            ).pipe(map(res => res.pedido));
          })
        );
      })
    );
  }
  createPedidos(pedido: Partial<Pedido>): Observable<Pedido> {
    // Obtener el token manualmente
    const token = localStorage.getItem('token');

    // Crear headers con el token de autorización
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };

    // Enviar la solicitud con los headers personalizados
    return this.http.post<{ status: string, msg: string, pedido: Pedido }>(
      this.API_URL,
      pedido,
      { headers }
    ).pipe(map(res => res.pedido));
  }
//Obtiene los pedidos
  // No transforma los campos de cliente, direccion, etc. a IDs
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(this.API_URL).pipe(
      map(res => res.pedidos)
    );
  }
// Obtiene un pedido por ID
  obtenerPedidoPorId(id: string): Observable<Pedido> {
    return this.http.get<{ pedido: Pedido }>(`${this.API_URL}/${id}`).pipe(
      map(res => res.pedido)
    );
  }
//Obtiene pedidos por cliente ID
  obtenerPedidoPorClienteId(clienteId: string): Observable<Pedido[]> {
    return this.http.get<{ pedidos: Pedido[] }>(`${this.API_URL}/cliente/${clienteId}`).pipe(
      map(res => res.pedidos)
    );
  }
// Actualiza un pedido
  updatePedido(id: string, pedido: Partial<Pedido>): Observable<Pedido> {
    // Envía el objeto tal cual, sin transformar campos a IDs
    return this.http.put<{ status: string, msg: string, pedido: Pedido }>(`${this.API_URL}/${id}`, pedido)
      .pipe(map(res => res.pedido));
  }
//Elimina un pedido
  deletePedido(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getPedidoById(pedidoId: string) {
    return this.http.get(`${this.API_URL}/${pedidoId}`).pipe()
  }
}
