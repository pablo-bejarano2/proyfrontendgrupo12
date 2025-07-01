// trabajo_final_frontend/src/app/components/public/checkout/checkout.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ItemPedidoService } from 'src/app/services/item-pedido';
import { CuponService } from 'src/app/services/cupon';
import { PedidoService } from 'src/app/services/pedido';
import { ItemPedido } from 'src/app/models/item-pedido';
import { Pedido } from 'src/app/models/pedido';
import { MisValidadores } from '../../../validadores/mis-validadores';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: ItemPedido[] = [];
  subtotal = 0;
  shipping = 'Gratis';
  tax = 0;
  total = 0;
  couponCode = '';
  couponMessage = '';
  descuento = 0;
  public descuentoPorcentaje = 0;

  constructor(
    private fb: FormBuilder,
    private itemPedidoService: ItemPedidoService,
    private cuponService: CuponService,
    private pedidoService: PedidoService
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'),
        MisValidadores.validarPrimerLetra,
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(5)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')
      ]],
      zip: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{4,10}$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        MisValidadores.validarEmail,
      ]],
      cardNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{13,19}$')
      ]],
      expiration: ['', [
        Validators.required,
        Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$') // MM/YY
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{3,4}$')
      ]]
    });
  }

  ngOnInit() {
    this.itemPedidoService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calcularTotales();
    });
  }
  trackByItem(index: number, item: any): any {
    return item?.id || index;
  }
  calcularTotales() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
    this.tax = Math.round(this.subtotal * 0.07);
    this.total = this.subtotal + this.tax - this.descuento;
  }

  applyCoupon() {
    if (!this.couponCode) return;
    this.cuponService.validarCupon(this.couponCode).subscribe({
      next: (cupon) => {
        if (cupon && cupon.descuento) {
          this.descuento = Math.round(this.subtotal * (cupon.descuento / 100));
          this.couponMessage = `Cupón aplicado: -${cupon.descuento}% (${this.formatearMoneda(this.descuento)})`;
          this.descuentoPorcentaje = cupon.descuento;
        } else {
          this.descuento = 0;
          this.couponMessage = 'Cupón no válido';
        }
        this.calcularTotales();
      },
      error: (err) => {
        this.descuento = 0;
        this.couponMessage = err.error?.msg || 'Cupón no válido';
        this.calcularTotales();
      }
    });
  }

  formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  onSubmit() {
    if (this.checkoutForm.invalid) return;

    const pedido: Pedido = {
      items: this.cartItems
        .map(item => item.id)
        .filter((id): id is string => typeof id === 'string'),
      metodoPago: 'tarjeta', // o el método seleccionado
      direccion: 'ID_DE_DIRECCION', // Debes obtener este ID del backend
      cupon: this.couponCode || undefined,
      total: this.total
    };

    this.pedidoService.crearPedido(pedido).subscribe({
      next: () => {
        this.itemPedidoService.clearCart();
        // Aquí puedes redirigir o mostrar mensaje de éxito
      }
    });
  }
}
