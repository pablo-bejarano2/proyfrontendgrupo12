import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ItemPedidoService } from 'src/app/services/item-pedido';
import { DireccionService} from '@/app/services/direccion';
import { CuponService } from 'src/app/services/cupon/cupon';
import { PedidoService, Pedido } from 'src/app/services/pedido';
import { MisValidadores } from '../../../validadores/mis-validadores';
import { QrPayment} from '@/app/components/public/qr-payment/qr-payment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom }  from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    QrPayment
  ],
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
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
  public pagoCompletado=false

  pagarConQR() {
    this.mostrarQR = true;
  }
  // En tu CheckoutComponent
  verEstadoFormulario() {
    console.log(this.checkoutForm.status); // 'VALID' o 'INVALID'
    console.log(this.checkoutForm.errors); // Errores generales
    console.log(this.checkoutForm.value);  // Valores actuales
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      console.log(key, control?.status, control?.errors);
    });
  }

  constructor(
    private fb: FormBuilder,
    private itemPedidoService: ItemPedidoService,
    private direccionService: DireccionService,
    private cuponService: CuponService,
    private pedidoService: PedidoService,
    private toastr: ToastrService,
    private router: Router
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
      ]]
    });
  }
  camposEnvioValidos(): boolean {
    const campos = ['fullName', 'address', 'city', 'zip', 'email'];
    return campos.every(campo => this.checkoutForm.get(campo)?.valid);
  }

  ngOnInit() {
    this.checkoutForm.patchValue({
      fullName: `${sessionStorage.getItem('nombres') || ''} ${sessionStorage.getItem('apellido') || ''}`,
      email: sessionStorage.getItem('email') || '',
    });
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

  async finalizarPedido() {
    console.log("El pago fue exitoso, procediendo a guardar el pedido...");

    if (this.checkoutForm.invalid) {
      this.toastr.error('Por favor, completa todos los campos de envío antes de pagar.', 'Formulario Incompleto');
      return;
    }
    const requiredFields = ['fullName', 'address', 'city', 'zip', 'email'];
    for (const field of requiredFields) {
      if (this.checkoutForm.get(field)?.invalid) return;
    }

    // Construye los items según la interfaz de Pedido del service
    const itemIds: string[] = [];
    for (const item of this.cartItems) {
      const itemCreado = await firstValueFrom(
        this.itemPedidoService.createItemPedido({
          producto: item.producto._id,
          cantidad: item.cantidad,
          subtotal: item.producto.precio * item.cantidad
        })
      );
      itemIds.push(itemCreado._id!);
    }
    const direccionCreada = await firstValueFrom(
      this.direccionService.createDireccion({
        calle: this.checkoutForm.value.address,
        ciudad: this.checkoutForm.value.city,
        provincia: '',
        codigoPostal: this.checkoutForm.value.zip
      })
    );

    // Construye el pedido según la interfaz del service
    const pedido = {
      emailCliente: this.checkoutForm.value.email,
      items: itemIds,
      total: this.total,
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      direccion: direccionCreada._id,
      metodoPago: 'qr',
      cupon: this.couponCode ? this.couponCode : undefined
    } as unknown as Partial<Pedido>;

    this.pedidoService.createPedidos(pedido).subscribe({
      next: (pedidoGuardado) => {
        this.toastr.success('Tu pedido ha sido confirmado y se está preparando.', '¡Gracias por tu compra!');
        this.itemPedidoService.clearCart();
        this.mostrarQR = false;
        setTimeout(() => {
          this.router.navigate(['/gracias', pedidoGuardado._id]);
        }, 2000);
      },
      error: () => {
        this.toastr.error('Hubo un problema al guardar tu pedido. Por favor, contacta a soporte.', 'Error Crítico');
      }
    });
  }
  onPagoFallido(error?: any) {
      this.mostrarQR = false;
      let message = 'El pago fue cancelado o falló. Por favor, intenta de nuevo.';
      if (error?.message) {
        message = error.message;
      }
      this.toastr.error(message, 'Pago Fallido');
  }
}
