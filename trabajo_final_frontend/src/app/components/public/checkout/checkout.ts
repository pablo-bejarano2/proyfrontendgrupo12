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
import { CodigoPostalService, LocalidadCP} from '@/app/services/codigo-postal';
import {
  NgClass
} from '@angular/common';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    QrPayment,
    NgClass
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
  public pagoCompletado=false;
  codigoPostal: string = '';
  localidades: LocalidadCP[] = [];
  provinciaSeleccionada: string = '';
  localidadSeleccionada: string = '';

  pagarConQR() {
    if (this.checkoutForm.invalid) {
      this.mostrarCamposFaltantes();
      return;
    }

    this.mostrarQR = true;
    document.body.classList.add('modal-open');
    setTimeout(() => {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    }, 10);
  }
  mostrarCarritoVacio() {
    this.toastr.warning('Tu carrito está vacío', 'No hay productos');
    this.router.navigate(['/tienda']);
  }
  mostrarCamposFaltantes() {
    const campos = [
      { key: 'fullName', nombre: 'Nombre completo' },
      { key: 'address', nombre: 'Dirección' },
      { key: 'zip', nombre: 'Código postal' },
      { key: 'localidad', nombre: 'Localidad' },
      { key: 'email', nombre: 'Email' }
    ];

    const camposFaltantes = campos
      .filter(campo => this.checkoutForm.get(campo.key)?.invalid)
      .map(campo => campo.nombre);

    if (camposFaltantes.length > 0) {
      this.toastr.warning(
        `Completa los siguientes campos: ${camposFaltantes.join(', ')}`,
        'Formulario incompleto'
      );
    }
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
    private router: Router,
    private codigoPostalService: CodigoPostalService
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
      zip: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{4,10}$')
      ]],
      localidad: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        MisValidadores.validarEmail,
      ]]
    });
  }
  camposEnvioValidos(): boolean {
    const campos = ['fullName', 'address', 'localidad', 'zip', 'email'];
    return campos.every(campo => this.checkoutForm.get(campo)?.valid);
  }
  onPaymentSuccess(paymentData: any) {
    this.pagoCompletado = true;
    this.mostrarQR = false;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this.toastr.success('¡Pago realizado con éxito!', 'Pago Exitoso');
  }

  onPaymentFailure(error?: any) {
    this.mostrarQR = false;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const message = error?.message || 'El pago fue cancelado o falló. Por favor, intenta de nuevo.';
    this.toastr.error(message, 'Pago Fallido');
  }

  ngOnInit() {
    this.checkoutForm.patchValue({
      fullName: `${sessionStorage.getItem('nombres') || ''} ${sessionStorage.getItem('apellido') || ''}`,
      email: sessionStorage.getItem('email') || '',
    });
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
    if (this.checkoutForm.invalid) {
      this.toastr.error('Formulario incompleto', 'Error');
      return;
    }

    const checkoutData = {
      email: this.checkoutForm.value.email,
      direccion: {
        calle: this.checkoutForm.value.address,
        ciudad: this.checkoutForm.value.localidad,
        provincia: this.provinciaSeleccionada,
        codigoPostal: this.checkoutForm.value.zip
      },
      items: this.cartItems,
      total: this.total,
      cuponCode: this.couponCode
    };

    try {
      console.log('Enviando datos de pedido:', JSON.stringify(checkoutData));
      const pedido = await firstValueFrom(this.pedidoService.crearPedidoCompleto(checkoutData));
      console.log('Pedido creado:', pedido);
      this.toastr.success('Pedido creado con éxito', 'Éxito');
      this.itemPedidoService.clearCart();
      this.router.navigate(['/gracias', pedido._id]);
    } catch (error: any) {
      console.error('Error al crear pedido:', error);
      this.toastr.error(
        error.error?.msg || error.message || 'Error desconocido al crear el pedido',
        'Error'
      );
    }
  }
  onPagoFallido(error?: any) {
      this.mostrarQR = false;
      let message = 'El pago fue cancelado o falló. Por favor, intenta de nuevo.';
      if (error?.message) {
        message = error.message;
      }
      this.toastr.error(message, 'Pago Fallido');
  }
  buscarCodigoPostal() {
    const codigoPostal = this.checkoutForm.get('zip')?.value;
    if (codigoPostal?.length === 4) {
      this.codigoPostalService.buscarPorCP(codigoPostal).subscribe({
        next: (data) => {
          this.localidades = data;
          if (data.length > 0) {
            this.provinciaSeleccionada = data[0].provincia;

            // Limpiamos el campo de localidad para que el usuario seleccione una
            this.checkoutForm.get('localidad')?.setValue('');
          } else {
            this.toastr.warning('No se encontraron localidades para este código postal', 'Advertencia');
          }
        },
        error: (err) => {
          this.toastr.error('Error al buscar el código postal', 'Error');
          console.error('Error buscando código postal:', err);
        }
      });
    }
  }
}
