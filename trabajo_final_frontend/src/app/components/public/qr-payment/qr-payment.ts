import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { QRCodeComponent } from 'angularx-qrcode';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.html',
  styleUrls: ['./qr-payment.css'],
  standalone: true,
  imports: [
    QRCodeComponent,
    CommonModule
  ]
})
export class QrPayment {
  @Input() amount!: number;
  @Input() description!: string;
  @Output() pagoExitoso = new EventEmitter<any>();
  @Output() pagoFallido = new EventEmitter<any>();
  qrDataString: string | null = null;
  window = window;
  isLoading = true;
  isPolling = false;
  statusMessage = 'Esperando pago...';
  private pollingSubscription?: Subscription;
  private verificationActive = true;
  paymentState: 'polling' | 'approved' | 'rejected' | 'cancelled' = 'polling';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnInit() {
    this.statusMessage=''
    this.generateDynamicQR(this.amount, this.description);
  }

  generateDynamicQR(amount: number, description: string) {
    const body = {
      amount: amount,
      description: description,
      external_reference: `VENTA-${Date.now()}`
    };
    this.http.post<any>(`${environment.apiUrl}/mp/generate-qr`, body).subscribe({
      next: (response) => {
        if (response.success) {
          this.qrDataString = response.qr_data;
          this.isLoading = false;
          this.startPaymentVerification(body.external_reference);
          this.toastr.info('Escanea el código QR con la app de Mercado Pago para continuar.', 'QR Generado');
        }
      },
      error: (error: any) => {
        this.toastr.error('No pudimos generar el código QR en este momento.', 'Error de Pago');
        this.pagoFallido.emit(error);
        this.isLoading = false;
      }
    });
  }

  showQRCode(qrData: string) {
    console.log('Mostrar QR:', qrData);
  }

  startPaymentVerification(externalReference: string) {
    this.paymentState = 'polling';
    this.statusMessage=''
    this.isPolling = true;
    this.verificationActive = true;

    this.pollingSubscription = interval(5000)
      .pipe(
        takeWhile(() => this.verificationActive),
        switchMap(() => this.http.get<any>(`${environment.apiUrl}/mp/check-status/${externalReference}`))
      )
      .subscribe({
        next: (response) => {
          if (response.payment_status === 'approved') {
            this.statusMessage = '¡Pago Aprobado!';
            this.paymentState = 'approved';
            this.pagoExitoso.emit(response); // Emitir evento de éxito
            this.stopPolling();
          } else if (response.payment_status === 'rejected') {
            this.paymentState = 'rejected';
            this.statusMessage = 'Pago Rechazado. Intenta de nuevo.';
            this.pagoFallido.emit(response); // Emitir evento de fallo
            this.stopPolling();
          }
        },
        error: (error) => {
          this.toastr.error('Error al verificar el estado del pago.', 'Error');
          this.pagoFallido.emit(error); // Emitir evento de fallo
        }
      });

    setTimeout(() => this.stopPolling(), 300000);
  }
  reintentar() {
    this.paymentState = 'polling';
    this.statusMessage = 'Esperando pago...';
    this.isLoading = true;
    this.qrDataString = null;
    this.generateDynamicQR(this.amount, this.description);
  }

  stopPolling() {
    this.verificationActive = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  cancelarPago() {
    this.stopPolling();
    this.paymentState = 'cancelled';
    this.pagoFallido.emit({ message: 'Pago cancelado por el usuario' });
  }

  ngOnDestroy() {
    this.stopPolling();
  }


}
