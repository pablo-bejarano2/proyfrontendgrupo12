import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CuponService, Cupon } from '../../services/cupon/cupon';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupones.html',
  styleUrl: './cupones.css'
})
export class Cupones {
  cupones: Cupon[] = [];
  filtro: string = '';
  nuevoCupon: Partial<Cupon> = {};
  cuponEditado: Cupon | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  hoy: string = '';

  constructor(private cuponService: CuponService) {
    // Calcula la fecha de hoy en formato yyyy-MM-dd
    const d = new Date();
    this.hoy = d.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.obtenerCupones();
  }

  obtenerCupones() {
    this.cuponService.getCupones().subscribe(cupones => {
      this.cupones = cupones;
    });
  }

  filtrarCupones() {
    if (!this.filtro) return this.cupones;
    return this.cupones.filter(c =>
      c.codigo.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  codigoExistente: boolean = false;

  crearCupon(form: NgForm) {
    form.control.markAllAsTouched();
    this.codigoExistente = false;
    if (form.invalid) {
      this.mensajeError = 'Por favor, complete correctamente todos los campos.';
      setTimeout(() => this.mensajeError = null, 4000);
      return;
    }
    if (this.cupones.some(c => c.codigo.toLowerCase() === this.nuevoCupon.codigo?.toLowerCase())) {
      this.codigoExistente = true;
      this.mensajeError = 'Ya existe un cupón con ese código.';
      setTimeout(() => this.mensajeError = null, 4000);
      return;
    }
    if (new Date(this.nuevoCupon.fechaExpiracion!) < new Date(this.hoy)) {
      this.mensajeError = 'La fecha de expiración no puede ser anterior a hoy.';
      setTimeout(() => this.mensajeError = null, 4000);
      return;
    }
    this.cuponService.createCupon(this.nuevoCupon).subscribe({
      next: () => {
        this.obtenerCupones();
        this.nuevoCupon = {};
        this.mensajeExito = 'Cupón creado correctamente';
        setTimeout(() => this.mensajeExito = null, 4000);
        (document.getElementById('modalNuevoCuponClose') as HTMLElement)?.click();
        form.resetForm();
    },
    error: (err) => {
        let msg = 'Error al crear el cupón.';
        if (err?.error?.causa) {
          const match = err.error.causa.match(/: (.+)$/);
          msg = match ? match[1] : err.error.causa;
        } else if (err?.error?.message) {
          msg = err.error.message;
        }
        this.mensajeError = msg;
        setTimeout(() => this.mensajeError = null, 4000);
      }
    });
  }


  editarCupon(cupon: Cupon) {
    this.cuponEditado = { ...cupon };
  }

 guardarEdicion(form: NgForm) {
  form.control.markAllAsTouched();
  if (form.invalid) {
    this.mensajeError = 'Por favor, complete correctamente todos los campos.';
    setTimeout(() => this.mensajeError = null, 4000);
    return;
  }
  // Verifica que cuponEditado no sea null
  if (!this.cuponEditado) return;

  // Validar código único (excluyendo el cupón actual)
  if (this.cupones.some(c =>
    c.codigo.toLowerCase() === this.cuponEditado!.codigo?.toLowerCase() &&
    c._id !== this.cuponEditado!._id
  )) {
    this.mensajeError = 'Ya existe un cupón con ese código.';
    setTimeout(() => this.mensajeError = null, 4000);
    return;
  }

  if (new Date(this.cuponEditado!.fechaExpiracion!) < new Date(this.hoy)) {
  this.mensajeError = 'La fecha de expiración no puede ser anterior a hoy.';
  setTimeout(() => this.mensajeError = null, 4000);
  return;
}

  this.cuponService.updateCupon(this.cuponEditado._id, this.cuponEditado).subscribe({
    next: () => {
      this.obtenerCupones();
      this.cuponEditado = null;
      this.mensajeExito = 'Cupón actualizado correctamente';
      setTimeout(() => this.mensajeExito = null, 4000);
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
      this.mensajeError = msg;
      setTimeout(() => this.mensajeError = null, 4000);
    }
  });
  }

  eliminarCupon(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este cupón?')) return;
    this.cuponService.deleteCupon(id).subscribe(() => {
      this.obtenerCupones();
      this.mensajeExito = 'Cupón eliminado correctamente';
      setTimeout(() => this.mensajeExito = null, 3000);
    });
  }

  activarCupon(cupon: Cupon) {
    this.cuponService.updateCupon(cupon._id!, { activo: true }).subscribe(() => {
      this.obtenerCupones();
      this.mensajeExito = 'Cupón activado correctamente';
      setTimeout(() => this.mensajeExito = null, 3000);
    });
  }

  desactivarCupon(cupon: Cupon) {
    this.cuponService.updateCupon(cupon._id!, { activo: false }).subscribe(() => {
      this.obtenerCupones();
      this.mensajeExito = 'Cupón desactivado correctamente';
      setTimeout(() => this.mensajeExito = null, 3000);
    });
  }
}
