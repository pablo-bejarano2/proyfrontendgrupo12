import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ItemPedidoService } from 'src/app/services/item-pedido';
import { DireccionService } from '@/app/services/direccion';
import { CuponService } from 'src/app/services/cupon/cupon';
import { PedidoService } from 'src/app/services/pedido';
import { MisValidadores } from '../../../validadores/mis-validadores';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CodigoPostalService, LocalidadCP } from '@/app/services/codigo-postal';

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
  cartItems: any[] = [];
  subtotal = 0;
  shipping = 'Gratis';
  tax = 0;
  total = 0;
  couponCode = '';
  couponMessage = '';
  descuento = 0;
  public mostrarQR = false;
  public descuentoPorcentaje = 0;
  public pagoCompletado = false;
  codigoPostal: string = '';
  localidades: LocalidadCP[] = [];
  provinciaSeleccionada: string = '';
  localidadSeleccionada: string = '';

  constructor(
    private fb: FormBuilder,
    private itemPedidoService: ItemPedidoService,
    private cuponService: CuponService,
    private pedidoService: PedidoService,
    private toastr: ToastrService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.itemPedidoService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        setTimeout(() => {
          this.mostrarCarritoVacio();
        }, 300);
      } else {
        this.calcularTotales();
      }
    });
  }


  irATienda() {
    this.router.navigate(['/tienda']);
  }
  mostrarCarritoVacio() {
    this.toastr.warning('Tu carrito está vacío', 'No hay productos');
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
          this.toastr.success(`Cupón '${this.couponCode}' aplicado con éxito!`, '¡Descuento Obtenido!');
        } else {
          this.descuento = 0;
          this.couponMessage = 'Cupón no válido';
          this.toastr.warning('El cupón ingresado no es válido.', 'Cupón Inválido');
        }
        this.calcularTotales();
      },
      error: (err) => {
        this.descuento = 0;
        this.couponMessage = err.error?.msg || 'Cupón no válido';
        this.calcularTotales();
        this.toastr.error(err.error?.msg || 'El cupón no es válido o ha expirado.', 'Error de Cupón');
      }
    });
  }

  formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }


}
