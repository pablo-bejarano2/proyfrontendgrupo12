import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PedidoService, Pedido } from 'src/app/services/pedido';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gracias',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule
  ],
  templateUrl: './gracias.html',
  styleUrl: './gracias.css'
})
export class Gracias implements OnInit {
  pedidoId: string = '';
  pedido: Partial<Pedido> = {};

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.pedidoId) {
      this.router.navigate(['/']);
      return;
    }

    this.cargarPedido();
  }

  cargarPedido(): void {
    this.pedidoService.getPedidoById(this.pedidoId).subscribe({
      next: (data: any) => {
        this.pedido = data.pedido;
      },
      error: (err) => {
        this.toastr.error('No se pudo cargar la información del pedido', 'Error');
        this.router.navigate(['/']);
      }
    });
  }
  verMisPedidos() {
    if (this.estaAutenticado()) {
      this.router.navigate(['/cuenta'], { queryParams: { tab: 'pedidos' } });
    } else {
      this.toastr.info('Debes iniciar sesión para ver tus pedidos');
      this.router.navigate(['/login']);
    }
  }

  formatearMoneda(valor?: number): string {
    if (valor === undefined || valor === null) {
      return '$0.00';
    }
    return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  estaAutenticado(): boolean {
    return !!sessionStorage.getItem('id');
  }
}
