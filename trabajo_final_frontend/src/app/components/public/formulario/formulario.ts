import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Usuario } from '../../../models/usuario';
import { LoginService } from '../../../services/login';
import { ToastrService } from 'ngx-toastr';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MisValidadores } from '../../../validadores/mis-validadores';

declare const google: any; //para evitar errores de TypeScript

@Component({
  selector: 'app-formulario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario implements OnInit {
  formUsuario!: FormGroup; //formulario de usuario
  userform: Usuario = new Usuario(); //usuario para el alta y login
  msglogin!: string; // mensaje que indica si no paso el login
  accion!: string; //accion para el comportamiento del form
  mostrarPassword: boolean = false; //para mostrar la contraseña
  mostrarConfirmPassword: boolean = false; //para mostrar la confirmación de contraseña
  ingresoDesdeAdmin: boolean = false; //Indica si el formulario se abre desde el admin
  returnUrl!: string; //URL de retorno después del login o registro

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngZone: NgZone
  ) {
    this.formUsuario = this.fb.group(this.obtenerControlesFormulario(), {
      validators: MisValidadores.passwordsIguales,
    }); //inicializa el formulario con los controles y validadores
  }

  //Validaciones para el formulario
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
      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          MisValidadores.validarEmail,
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
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          MisValidadores.validarPassword,
        ],
      }),
      confirmPassword: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    };
  }

  ngOnInit(): void {
    this.loadGoogleScript(); //Carga dinámica del script de Google
    (window as any).handleCredentialResponse =
      this.handleCredentialResponse.bind(this); //Declara la función global que Google usará
    //Obtener params del componente que llamó al formulario
    this.route.queryParams.subscribe((params) => {
      if (params['accion'] === 'register') {
        this.accion = 'register';
        this.ingresoDesdeAdmin = true; //Indica que se abrió desde el admin
      } else {
        this.accion = 'login';
      }
      this.returnUrl = params['returnUrl']; //Guarda la URL de retorno para redirigir después del login o register
    });
  }

  //Carga el script oficial de Google Identity Services
  private loadGoogleScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  //Valida el token en el backend y regresa los datos del usuario de Google
  handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      const token = response.credential;
      this.loginService.loginGoogle(token).subscribe({
        next: (result) => {
          if (this.ingresoDesdeAdmin) {
            this.toastr.success('Usuario creado correctamente');
            this.router.navigate([this.returnUrl]);
          } else {
            this.guardarUsuarioEnStorage(result);
            sessionStorage.setItem('imagen', result.imagen);
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          this.toastr.error(error.error.msg || 'Error procesando la operación');
        },
      });
    });
  }

  //Login normal con credenciales de username y password
  login() {
    this.loginService
      .login(this.userform.username, this.userform.password)
      .subscribe({
        next: (result) => {
          this.guardarUsuarioEnStorage(result);
          this.formUsuario.reset();
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.toastr.error(error.error.msg || 'Error procensado la operación');
        },
      });
  }

  //Guarda los datos del usuario en sessionStorage
  guardarUsuarioEnStorage(usuario: any) {
    const { username, email, nombres, apellido, userId, token, rol } = usuario;
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('nombres', nombres);
    sessionStorage.setItem('apellido', apellido);
    sessionStorage.setItem('id', userId);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('rol', rol);
  }

  //Crear cuenta
  createCount() {
    this.loginService.createCount(this.userform).subscribe({
      next: (result) => {
        this.toastr.success(result.msg);
        this.formUsuario.reset(); //Limpiar el formulario
        if (this.ingresoDesdeAdmin) {
          this.router.navigate([this.returnUrl]); //Redirigir al admin
        } else {
          this.accion = 'login';
        }
      },
      error: (error) => {
        this.toastr.error(error.error.msg || 'Error procensado la operación');
      },
    });
  }

  //Crear cuenta o Inicio de Sesión de acuerdo al valor de 'accion'
  procesarFormulario() {
    this.msglogin = '';
    const { username, password } = this.formUsuario.value;

    if (this.accion === 'register') {
      this.asignarValores();
      this.createCount();
    } else {
      //No permitir enviar form vacío en login
      if (!username || !password) {
        this.msglogin = 'Debe completar usuario y contraseña';
        return;
      }
      this.asignarValores();
      this.login();
    }
  }

  asignarValores() {
    //Solo funciona bien si los nombres de los campos del formulario
    //coinciden exactamente con las propiedades de userform
    Object.assign(this.userform, this.formUsuario.value);
  }

  cambiarAccion(nuevaAccion: string) {
    this.accion = nuevaAccion;
    this.msglogin = '';
    this.formUsuario.reset();
  }

  volver() {
    this.router.navigate([this.returnUrl]);
  }

  cambioPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
