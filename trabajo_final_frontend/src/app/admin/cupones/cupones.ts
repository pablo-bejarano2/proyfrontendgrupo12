import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CuponService, Cupon } from '../../services/cupon/cupon';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupones.html',
  styleUrl: './cupones.css'
})
export class Cupones implements OnInit {
  cupones: Cupon[] = [];
  filtro: string = '';
  nuevoCupon: Partial<Cupon> = {};
  cuponEditado: Cupon | null = null;
  hoy: string = '';
  codigoExistente: boolean = false;

  constructor(
    private cuponService: CuponService,
    private toastr: ToastrService
  ) {
    const d = new Date();
    this.hoy = d.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.obtenerCupones();
  }

  obtenerCupones() {
    this.cuponService.getCupones().subscribe({
      next: (cupones) => {
        this.cupones = cupones;
      },
      error: () => {
        this.toastr.error('Error al cargar cupones', 'Error');
      }
    });
  }

  filtrarCupones() {
    if (!this.filtro) return this.cupones;
    return this.cupones.filter(c =>
      c.codigo.toLowerCase().includes(this.filtro.toLowerCase()) ||
      c.nombre.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  crearCupon(form: NgForm) {
    form.control.markAllAsTouched();
    this.codigoExistente = false;
    
    if (form.invalid) {
      this.toastr.error('Por favor, complete correctamente todos los campos.', 'Formulario inválido');
      return;
    }
    
    if (this.cupones.some(c => c.codigo.toLowerCase() === this.nuevoCupon.codigo?.toLowerCase())) {
      this.codigoExistente = true;
      this.toastr.error('Ya existe un cupón con ese código.', 'Código duplicado');
      return;
    }
    
    if (new Date(this.nuevoCupon.fechaExpiracion!) < new Date(this.hoy)) {
      this.toastr.error('La fecha de expiración no puede ser anterior a hoy.', 'Fecha inválida');
      return;
    }

    this.cuponService.createCupon(this.nuevoCupon).subscribe({
      next: () => {
        this.obtenerCupones();
        this.nuevoCupon = {};
        form.resetForm();
        this.toastr.success('Cupón creado exitosamente', 'Éxito');
        (document.getElementById('modalNuevoCuponClose') as HTMLElement)?.click();
      },
      error: (err) => {
        let msg = 'Error al crear el cupón.';
        if (err?.error?.causa) {
          const match = err.error.causa.match(/: (.+)$/);
          msg = match ? match[1] : err.error.causa;
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.toastr.error(msg, 'Error');
      }
    });
  }

  editarCupon(cupon: Cupon) {
    this.cuponEditado = { ...cupon };
  }

  guardarEdicion(form: NgForm) {
    form.control.markAllAsTouched();
    
    if (form.invalid) {
      this.toastr.error('Por favor, complete correctamente todos los campos.', 'Formulario inválido');
      return;
    }
    
    if (!this.cuponEditado) return;

    // Validar código único (excluyendo el cupón actual)
    if (this.cupones.some(c =>
      c.codigo.toLowerCase() === this.cuponEditado!.codigo?.toLowerCase() &&
      c._id !== this.cuponEditado!._id
    )) {
      this.toastr.error('Ya existe un cupón con ese código.', 'Código duplicado');
      return;
    }

    if (new Date(this.cuponEditado!.fechaExpiracion!) < new Date(this.hoy)) {
      this.toastr.error('La fecha de expiración no puede ser anterior a hoy.', 'Fecha inválida');
      return;
    }

    this.cuponService.updateCupon(this.cuponEditado._id, this.cuponEditado).subscribe({
      next: () => {
        this.obtenerCupones();
        this.cuponEditado = null;
        this.toastr.success('Cupón actualizado exitosamente', 'Éxito');
        (document.getElementById('modalEditarCuponClose') as HTMLElement)?.click();
      },
      error: (err) => {
        let msg = 'Error al editar el cupón.';
        if (err?.error?.causa) {
          const match = err.error.causa.match(/: (.+)$/);
          msg = match ? match[1] : err.error.causa;
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.toastr.error(msg, 'Error');
      }
    });
  }

  eliminarCupon(id: string | undefined) {
    if (!id) return;
    
    Swal.fire({
      title: '¿Eliminar cupón?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cuponService.deleteCupon(id).subscribe({
          next: () => {
            this.obtenerCupones();
            this.toastr.success('Cupón eliminado exitosamente', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al eliminar el cupón', 'Error');
          }
        });
      }
    });
  }

  activarCupon(cupon: Cupon) {
    Swal.fire({
      title: '¿Activar cupón?',
      text: `El cupón "${cupon.codigo}" estará disponible para usar.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cuponService.updateCupon(cupon._id!, { activo: true }).subscribe({
          next: () => {
            this.obtenerCupones();
            this.toastr.success('Cupón activado exitosamente', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al activar el cupón', 'Error');
          }
        });
      }
    });
  }

  desactivarCupon(cupon: Cupon) {
    Swal.fire({
      title: '¿Desactivar cupón?',
      text: `El cupón "${cupon.codigo}" no estará disponible para usar.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cuponService.updateCupon(cupon._id!, { activo: false }).subscribe({
          next: () => {
            this.obtenerCupones();
            this.toastr.success('Cupón desactivado exitosamente', 'Éxito');
          },
          error: () => {
            this.toastr.error('Error al desactivar el cupón', 'Error');
          }
        });
      }
    });
  }
}