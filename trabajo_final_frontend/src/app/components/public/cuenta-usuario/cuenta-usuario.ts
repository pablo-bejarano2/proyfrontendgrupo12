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
  //Usuario para el update
  userUpdated: Usuario = new Usuario();
  //quitar
  pedidos = [
    {
      fecha: '2025-06-20',
      estado: 'Entregado',
      direccion: 'Calle Falsa 123, Buenos Aires',
      metodoPago: 'Tarjeta de crédito',
      total: 12500,
    },
    {
      fecha: '2025-06-15',
      estado: 'Pendiente',
      direccion: 'Av. Siempre Viva 742, Córdoba',
      metodoPago: 'MercadoPago',
      total: 8450,
    },
    {
      fecha: '2025-06-10',
      estado: 'Cancelado',
      direccion: 'San Martín 456, Rosario',
      metodoPago: 'Efectivo',
      total: 3200,
    },
  ];

  constructor(
    private loginService: LoginService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formUsuario = this.fb.group(this.obtenerControlesFormulario());
  }

  ngOnInit(): void {
    //Valores del sessionStorage
    this.idUsuario = sessionStorage.getItem('id') || '';
    this.emailUsuario = sessionStorage.getItem('email') || '';
    this.imagenUsuario = sessionStorage.getItem('imagen') || 'assets/user.jpg';
    // Inicializa el formulario con los valores
    this.formUsuario.patchValue(this.obtenerDatosUsuarioDesdeStorage());
  }

  seleccionarOpcion(opcion: string): void {
    this.opcionSeleccionada = opcion;
  }

  actualizarUsuario() {
    this.cargarUsuario();
    this.loginService.updateCount(this.userUpdated).subscribe(
      (result) => {
        if (result.status == 1) {
          const { username, nombres, apellido } = result.usuario;
          //Actualizar formulario
          this.formUsuario.patchValue({ username, nombres, apellido });
          this.actualizarSessionStorage({ username, nombres, apellido });
          this.msgUpdate = '';
          this.toastr.success(result.msg);
        } else {
          this.formUsuario.patchValue(this.obtenerDatosUsuarioDesdeStorage());
          this.msgUpdate = result.msg;
        }
      },
      (error) => {
        this.toastr.error(error.error.msg || 'Error procensado la operación');
      }
    );
  }

  private cargarUsuario(): void {
    const { username, nombres, apellido } = this.formUsuario.value;

    this.userUpdated = {
      _id: this.idUsuario,
      email: this.emailUsuario,
      username,
      nombres,
      apellido,
      password: '', // Asignar el valor adecuado si es necesario
      rol: '', // Asignar el valor adecuado si es necesario
    };
  }

  private obtenerDatosUsuarioDesdeStorage(): any {
    return {
      username: sessionStorage.getItem('username') || '',
      nombres: sessionStorage.getItem('nombres') || '',
      apellido: sessionStorage.getItem('apellido') || '',
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

  private obtenerControlesFormulario() {
    return {
      nombres: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'),
        MisValidadores.validarPrimerLetra,
      ]),
      apellido: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'),
        MisValidadores.validarPrimerLetra,
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-Z0-9_ ]+$'),
      ]),
    };
  }
}
