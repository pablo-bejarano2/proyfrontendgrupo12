import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  usuarios: any[] = []; //Array para almacenar los usuarios
  usuario: any = null; //Usuario para mostrar en el modal
  username!: string; //Variable enlazada al form para búsqueda por username
  ultimoUsernameBuscado: string = '';
  msgError!: any;
  filtrado: boolean = false; //Indica si se está filtrando por username

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loginService.getUsers().subscribe((result) => {
      this.usuarios = result;
    });
  }

  mostrarDetallesUsuario(id: string) {
    this.loginService.getUserById(id).subscribe(
      (result) => {
        this.usuario = result;
      },
      (error) => {
        this.mostrarError(error);
      }
    );
  }

  filtrarUsuarios() {
    const username = this.username?.trim();
    if (!username) {
      this.msgError = 'Debe ingresar un nombre de usuario para buscar.';
      return;
    }

    //Evitar llamadas si el filtro no cambió
    if (username === this.ultimoUsernameBuscado) return;

    this.ultimoUsernameBuscado = username;
    this.msgError = '';
    this.loginService.getUsersByUsername(this.username).subscribe(
      (result) => {
        this.usuarios = result;
        this.filtrado = true;
        if (this.usuarios.length === 0) {
          this.toastr.info('No se encontraron usuarios con ese nombre.');
          return;
        }

        this.toastr.success('Usuarios encontrados: ' + this.usuarios.length);
      },
      (error) => {
        this.mostrarError(error);
      }
    );
  }

  eliminarUsuario(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Estoy seguro',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-danger',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.loginService.deleteUser(id).subscribe({
          next: (result) => {
            this.toastr.info(result.msg);
            this.cargarUsuarios();
          },
          error: (error) => {
            this.mostrarError(error, 'Error al eliminar el usuario.');
          },
        });
      }
    });
  }

  borrarFiltro() {
    this.msgError = '';
    this.username = '';
    this.filtrado = false;
    this.cargarUsuarios();
  }

  crearUsuario() {
    this.router.navigate(['/form'], {
      queryParams: { returnUrl: this.router.url, accion: 'register' },
    });
  }

  cerrarModal() {
    this.usuario = null;
  }

  private mostrarError(
    error: any,
    fallbackMessage: string = 'Error procesando la operación.'
  ) {
    const errorMessage = error?.error?.msg || fallbackMessage;
    this.toastr.error(errorMessage);
  }
}
