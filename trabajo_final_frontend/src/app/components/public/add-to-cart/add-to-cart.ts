import { Component, inject, OnInit, signal, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemPedido } from '../../../models/item-pedido';
import { ItemPedidoService } from '../../../services/item-pedido';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DecimalPipe],
  templateUrl: './add-to-cart.html',
  styleUrl: './add-to-cart.css'
})
export class AddToCart implements OnInit {
  itemProductService = inject(ItemPedidoService);
  private decimalPipe = inject(DecimalPipe);

  @Input() isVisible = false;
  @Output() modalClosed = new EventEmitter<void>();

  couponCode = '';
  private _isApplyingCoupon = signal(false);
  private _couponError = signal<string | null>(null);

  readonly isApplyingCoupon = this._isApplyingCoupon.asReadonly();
  readonly couponError = this._couponError.asReadonly();

  private _cartItems = signal<ItemPedido[]>([]);
  readonly cartItems = this._cartItems.asReadonly();

  constructor(private router: Router) {}


  ngOnInit(): void {
    this.itemProductService.cartItems$.subscribe((items: ItemPedido[]) => {
      this._cartItems.set(items);
    });
  }
  formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  trackByItem(index: number, item: ItemPedido): string | number {
    return item.id || index;
  }

  increaseQuantity(item: ItemPedido): void {
    if (!item.id) {
      console.error('Item ID is required');
      return;
    }
    this.itemProductService.updateQuantity(
      item.id,
      item.cantidad + 1
    );
  }

  decreaseQuantity(item: ItemPedido): void {
    if (!item.id) {
      console.error('Item ID is required');
      return;
    }
    if (item.cantidad <= 1) {
      this.removeItem(item);
      return;
    }
    try {
      this.itemProductService.updateQuantity(
        item.id,
        item.cantidad - 1
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  removeItem(item: ItemPedido): void {
    if (!item.id) {
      console.error('Item ID is required for removal');
      return;
    }
    this.itemProductService.removeItem(item.id);
  }

  proceedToCheckout(): void {
    console.log('Proceeding to checkout with:', {
      items: this.cartItems(),
      summary: this.itemProductService.cartSummary()
    });
    if (this.cartItems().length === 0) {
      console.warn('Cannot proceed with empty cart');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  calcularTotal(item: ItemPedido): number {
    if (!item || !item.producto || typeof item.producto.precio !== 'number' || typeof item.cantidad !== 'number') {
      return 0;
    }
    const total = item.producto.precio * item.cantidad;
    return isNaN(total) ? 0 : total;
  }

  formatearPrecio(precio: number | null | undefined): string {
    if (precio === null || precio === undefined || isNaN(precio)) {
      return this.decimalPipe.transform(0, '1.0-0') || '0';
    }
    return this.decimalPipe.transform(precio, '1.0-0') || '0';
  }

  formatearTotal(item: ItemPedido): string {
    const total = this.calcularTotal(item);
    return this.formatearPrecio(total);
  }

  formatearSubtotal(): string {
    try {
      const subtotal = this.itemProductService.cartSummary().subtotal;
      return this.formatearPrecio(subtotal);
    } catch (error) {
      console.error('Error getting subtotal:', error);
      return '0';
    }
  }

  formatearImpuesto(): string {
    try {
      const tax = this.itemProductService.cartSummary().tax;
      return this.formatearPrecio(tax);
    } catch (error) {
      console.error('Error getting tax:', error);
      return '0';
    }
  }

  formatearTotalGeneral(): string {
    try {
      const total = this.itemProductService.cartSummary().total;
      return this.formatearPrecio(total);
    } catch (error) {
      console.error('Error getting total:', error);
      return '0';
    }
  }

  getProductInfo(item: ItemPedido): string {
    const info = [];
    if (item.talla) info.push(`Talla: ${item.talla}`);
    if (item.color) info.push(`Color: ${item.color}`);
    return info.join(' | ');
  }

  cerrarModal(): void {
  this.modalClosed.emit();
}
}
