import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MisValidadores } from '../../../validadores/mis-validadores';
import { Usuario } from '../../../models/usuario';
import { LoginService } from '../../../services/login';
import { ToastrService } from 'ngx-toastr';
import { PedidoService, Pedido } from '../../../services/pedido';

@Component({
  selector: 'app-cuenta-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cuenta-usuario.html',
  styleUrl: './cuenta-usuario.css',
})
export class CuentaUsuario implements OnInit {
  formUsuario!: FormGroup;
  opcionSeleccionada: string = 'datos'; // por defecto
  msgUpdate: string = '';
  //Datos del usuario
  usernameUsuario: string = '';
  emailUsuario: string = '';
  imagenUsuario: string = '';
  nombreUsuario: string = '';
  apellidoUsuario: string = '';
  idUsuario: string = '';
  rolUsuario: string = '';
  //Usuario para el update
  userUpdated: Usuario = new Usuario();
  //quitar
  pedidos: Pedido[] = [];

  constructor(
    private loginService: LoginService,
    private PedidoService: PedidoService,
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
    };
  }

  ngOnInit(): void {
    //Valores del sessionStorage
    this.idUsuario = sessionStorage.getItem('id') || '';
    this.emailUsuario = sessionStorage.getItem('email') || '';
    this.imagenUsuario = sessionStorage.getItem('imagen') || 'assets/user.jpg';
    this.rolUsuario = sessionStorage.getItem('rol') || '';
    // Inicializa el formulario con los valores
    this.formUsuario.patchValue(this.obtenerDatosUsuarioDesdeStorage());
    this.obtenerPedidos();
  }

  private obtenerDatosUsuarioDesdeStorage(): any {
    return {
      username: sessionStorage.getItem('username') || '',
      nombres: sessionStorage.getItem('nombres') || '',
      apellido: sessionStorage.getItem('apellido') || '',
    };
  }

  seleccionarOpcion(opcion: string): void {
    this.opcionSeleccionada = opcion;
  }

  actualizarUsuario() {
    if (this.sinCambios()) {
      this.toastr.info('No se han realizado cambios en los datos del usuario');
      return;
    }

    this.cargarUsuario();
    this.loginService.updateCount(this.userUpdated).subscribe({
      next: (result) => {
        const { username, nombres, apellido } = result.usuario;
        console.log(result.usuario);
        //Actualizar formulario
        this.formUsuario.patchValue({ username, nombres, apellido });
        this.actualizarSessionStorage({ username, nombres, apellido });
        this.msgUpdate = '';
        this.toastr.success(result.msg);
      },
      error: (error) => {
        this.formUsuario.patchValue(this.obtenerDatosUsuarioDesdeStorage());
        this.toastr.error(error.error.msg || 'Error procensado la operación');
      },
    });
  }

  private sinCambios(): boolean {
    const datosOriginales = this.obtenerDatosUsuarioDesdeStorage();
    const datosActuales = this.formUsuario.value;

    return (
      datosOriginales.username === datosActuales.username &&
      datosOriginales.nombres === datosActuales.nombres &&
      datosOriginales.apellido === datosActuales.apellido
    );
  }

  private cargarUsuario(): void {
    const { username, nombres, apellido } = this.formUsuario.value;

    this.userUpdated = {
      _id: this.idUsuario,
      username,
      password: '',
      email: '',
      nombres,
      apellido,
      rol: '',
    };
  }

  private actualizarSessionStorage(datos: {
    username: string;
    nombres: string;
    apellido: string;
  }): void {
    sessionStorage.setItem('username', datos.username);
    sessionStorage.setItem('nombres', datos.nombres);
    sessionStorage.setItem('apellido', datos.apellido);
  }

  obtenerPedidos(): void {
    this.PedidoService.obtenerPedidoPorClienteId(this.idUsuario).subscribe({
      next: (data) => {
        this.pedidos = data;
      },
      error: (err) => {
        console.error('Error al cargar pedidos', err);
      },
    });
  }
}
