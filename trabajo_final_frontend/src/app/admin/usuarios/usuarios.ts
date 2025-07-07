import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MisValidadores } from '../../validadores/mis-validadores';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  formUsuario!: FormGroup; //Formulario para editar usuario
  usuarios: any[] = []; //Array para almacenar los usuarios
  usuario: any; //Usuario para mostrar en el modal
  usuarioOriginal: any; //Usuario original para restaurar en caso de cancelar edición
  username: string = ''; //Variable enlazada al form para búsqueda por username
  ultimoUsernameBuscado: string = ''; //Último username buscado para evitar llamadas innecesarias
  msgError: string = ''; //Mensaje de error para mostrar en caso de problemas
  filtrado: boolean = false; //Indica si se está filtrando por username
  editandoUsuario: boolean = false; //Indica si se está editando un usuario

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formUsuario = this.fb.group(this.obtenerControlesFormulario());
  }

  private obtenerControlesFormulario() {
    return {
      nombres: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'),
          MisValidadores.validarPrimerLetra,
        ],
      }),
      apellido: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'),
          MisValidadores.validarPrimerLetra,
        ],
      }),
      username: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.pattern('^[a-zA-Z0-9_ ]+$'),
        ],
      }),
      email: new FormControl<string>({ value: '', disabled: true }),
    };
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loginService.getUsers().subscribe({
      next: (result) => {
        this.usuarios = result.data;
      },
      error: (error) => {
        this.mostrarError(error, 'Error al cargar los usuarios');
      },
    });
  }

  mostrarDetallesUsuario(id: string, paraEditar: boolean = false) {
    this.loginService.getUserById(id).subscribe({
      next: (result) => {
        this.usuario = result.data;
        if (paraEditar) {
          this.editandoUsuario = true;
          this.usuarioOriginal = { ...this.usuario }; // Clona el usuario para restaurar si se cancela
          // Enlaza los datos del usuario al formulario reactivo
          this.formUsuario.patchValue({
            username: this.usuario.username,
            email: this.usuario.email,
            nombres: this.usuario.nombres,
            apellido: this.usuario.apellido,
          });
        }
      },
      error: (error) => this.mostrarError(error),
    });
  }

  editarUsuario(id: string) {
    this.mostrarDetallesUsuario(id, true);
  }

  guardarEdicionUsuario() {
    this.usuario = {
      ...this.usuario,
      ...this.formUsuario.value, // Actualiza los valores del usuario con el formulario
    };

    this.loginService.updateCount(this.usuario).subscribe({
      next: (result) => {
        this.editandoUsuario = false;
        this.cargarUsuarios();
        this.toastr.success(result.msg);
      },
      error: (error) => {
        this.mostrarError(error, 'Error al actualizar el usuario');
      },
    });
  }

  filtrarUsuarios() {
    const username = this.username?.trim();
    if (!username) {
      this.msgError = 'Debe ingresar un nombre de usuario para buscar';
      return;
    }

    //Evitar llamadas si el filtro no cambió
    this.msgError = '';
    if (username === this.ultimoUsernameBuscado) {
      this.toastr.info('Acaba de realizar la misma búsqueda');
      return;
    }

    this.ultimoUsernameBuscado = username;

    this.loginService.getUsersByUsername(username).subscribe({
      next: (result) => {
        if (result.data.length === 0) {
          this.toastr.info('No se encontraron usuarios con ese nombre');
          return;
        }

        this.usuarios = result.data;
        this.filtrado = true;
        this.toastr.success('Usuarios encontrados: ' + this.usuarios.length);
      },
      error: (error) => {
        this.mostrarError(error);
      },
    });
  }

  eliminarUsuario(id: string) {
    this.confirmarEliminacion().then((result) => {
      if (result.isConfirmed) {
        this.loginService.deleteUser(id).subscribe({
          next: (result) => {
            this.toastr.info(result.msg);
            this.cargarUsuarios();
          },
          error: (error) => {
            this.mostrarError(error, 'Error al eliminar el usuario');
          },
        });
      }
    });
  }

  private confirmarEliminacion(): Promise<any> {
    return Swal.fire({
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
    this.editandoUsuario = false;
    this.usuario = null;
    this.usuarioOriginal = null;
  }

  private mostrarError(
    error: any,
    fallbackMessage: string = 'Error procesando la operación'
  ) {
    const errorMessage = error?.error?.msg || fallbackMessage;
    this.toastr.error(errorMessage);
  }
}
