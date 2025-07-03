import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PedidoService, Pedido } from '../../services/pedido';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos {
  pedidos: Pedido[] = [];
  filtro: string = 'todos';
  busqueda: string = '';
  nuevoPedido: Partial<Pedido> = {};
  pedidosExpandidos: Set<string> = new Set();
  pedidoEditado: Pedido | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(private pedidoService: PedidoService) { }

  ngOnInit() {
    this.obtenerPedidos();
  }

  obtenerPedidos() {
    this.pedidoService.getPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;
    });
  }

  filtrarPedidos() {
    let pedidosFiltrados = this.pedidos;

    if (this.filtro === 'pendientes') {
      pedidosFiltrados = pedidosFiltrados.filter(pedido => pedido.estado === 'pendiente');
    }
    if (this.busqueda && this.busqueda.trim() !== '') {
      const texto = this.busqueda.trim().toLowerCase();
      pedidosFiltrados = pedidosFiltrados.filter(p =>
        p._id.toLowerCase().includes(texto) ||
        (p.cliente?.nombres?.toLowerCase().includes(texto)) ||
        (p.emailCliente?.toLowerCase().includes(texto))
      );
    }

    return pedidosFiltrados;
  }

  crearPedido() {
    if (!this.nuevoPedido.cliente || !this.nuevoPedido.items || !this.nuevoPedido.total) {
      this.mensajeError = 'Por favor, complete todos los campos obligatorios.';
      setTimeout(() => this.mensajeError = null, 4000);
      return;
    }
    this.pedidoService.createPedidos(this.nuevoPedido).subscribe(
      pedido => {
        this.pedidos.push(pedido);
        this.mensajeExito = 'Pedido creado exitosamente.';
        setTimeout(() => this.mensajeExito = null, 4000);
        this.nuevoPedido = {};
      },
      error => {
        console.error('Error al crear el pedido:', error);
        this.mensajeError = 'Ocurrió un error al crear el pedido.';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    );
  }
  editarPedido(pedido: Pedido) {
    this.pedidoEditado = { ...pedido };
    if (!this.pedidoEditado.cupon) {
      this.pedidoEditado.cupon = { _id: '', codigo: '', descuento: 0 };
    }
    setTimeout(() => {
      const modal = document.getElementById('modalEditarPedido');
      if (modal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(modal);
        bsModal.show();
      }
    });
  }
  eliminarPedido(pedido: Pedido) {
    if (!pedido._id) return;
    this.pedidoService.deletePedido(pedido._id).subscribe(
      () => {
        this.pedidos = this.pedidos.filter(p => p._id !== pedido._id);
        this.mensajeExito = 'Pedido eliminado exitosamente.';
        setTimeout(() => this.mensajeExito = null, 4000);
      },
      error => {
        console.error('Error al eliminar el pedido:', error);
        this.mensajeError = 'Ocurrió un error al eliminar el pedido.';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    );
  }


  actualizarPedido(formEditar?: NgForm) {
    if (formEditar && formEditar.invalid) {
      this.mensajeError = 'Por favor, complete todos los campos obligatorios.';
      setTimeout(() => this.mensajeError = null, 4000);
      return;
    }
    if (!this.pedidoEditado || !this.pedidoEditado._id) return;
    this.pedidoService.updatePedido(this.pedidoEditado._id, this.pedidoEditado).subscribe(
      (pedidoActualizado) => {
        const index = this.pedidos.findIndex(p => p._id === this.pedidoEditado!._id);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
          this.mensajeExito = 'Pedido actualizado exitosamente.';
          setTimeout(() => this.mensajeExito = null, 4000);
          this.pedidoEditado = null;

          setTimeout(() => {
            const modal = document.getElementById('modalEditarPedido');
            if (modal) {
              // @ts-ignore
              const bsModal = window.bootstrap.Modal.getInstance(modal);
              if (bsModal) bsModal.hide();
            }
          });
        }
      },
      error => {
        console.error('Error al actualizar el pedido:', error);
        this.mensajeError = 'Ocurrió un error al actualizar el pedido.';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    );
  }

  toggleExpandirPedido(pedidoId: string) {
    if (this.pedidosExpandidos.has(pedidoId)) {
      this.pedidosExpandidos.delete(pedidoId);
    } else {
      this.pedidosExpandidos.add(pedidoId);
    }
  }

  getEstadoClass(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente': return 'border-warning bg-light';
      case 'enviado': return 'border-success bg-success bg-opacity-10';
      case 'cancelado': return 'border-danger bg-danger bg-opacity-10';
      default: return 'border-secondary bg-light';
    }
  }
  getBadgeClass(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente': return 'bg-warning text-dark';
      case 'enviado': return 'bg-success text-white';
      case 'cancelado': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  marcarEnviado(pedido: Pedido) {
    const nuevoEstado = pedido.estado === 'enviado' ? 'pendiente' : 'enviado';
    this.pedidoService.updatePedido(pedido._id, { ...pedido, estado: nuevoEstado }).subscribe(
      (pedidoActualizado) => {
        const index = this.pedidos.findIndex(p => p._id === pedido._id);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
        }
      },
      error => {
        console.error('Error al actualizar el estado del pedido:', error);
        this.mensajeError = 'Ocurrió un error al actualizar el estado del pedido.';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    );
  }
  marcarCancelado(pedido: Pedido) {
    const nuevoEstado = pedido.estado === 'cancelado' ? 'pendiente' : 'cancelado';
    this.pedidoService.updatePedido(pedido._id, { ...pedido, estado: nuevoEstado }).subscribe(
      (pedidoActualizado) => {
        const index = this.pedidos.findIndex(p => p._id === pedido._id);
        if (index !== -1) {
          this.pedidos[index] = pedidoActualizado;
        }
      },
      error => {
        console.error('Error al actualizar el estado del pedido:', error);
        this.mensajeError = 'Ocurrió un error al actualizar el estado del pedido.';
        setTimeout(() => this.mensajeError = null, 4000);
      }
    );
  }
}
