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
  accion: string = 'login'; //accion para el comportamiento del form
  mostrarPassword: boolean = false; //para mostrar la contraseña

  constructor(
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ngZone: NgZone
  ) {
    this.formUsuario = this.fb.group(this.obtenerControlesFormulario(), {
      validators: MisValidadores.passwordsIguales,
    }); //inicializa el formulario con los controles y validadores
  }

  ngOnInit(): void {
    this.loadGoogleScript(); //Carga dinámica del script de Google
    (window as any).handleCredentialResponse =
      this.handleCredentialResponse.bind(this); //Declara la función global que Google usará
  }

  /*Carga el script oficial de Google Identity Services.*/
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
      this.loginService.loginGoogle(token).subscribe(
        (result) => {
          this.guardarUsuarioEnStorage(result);
          this.router.navigate(['/home']);
        },
        (error) => {
          this.toastr.error(error.error.msg || 'Error procensado la operación');
        }
      );
    });
  }

  //Validaciones para el formulario
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
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        MisValidadores.validarEmail,
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-Z0-9_ ]+$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        MisValidadores.validarPassword,
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    };
  }

  //Login normal
  login() {
    this.loginService
      .login(this.userform.username, this.userform.password)
      .subscribe(
        (result) => {
          if (result.status == 1) {
            //Guardar el usuario en cookies en el cliente
            this.guardarUsuarioEnStorage(result);

            //Redirigimos a home o a pagina que llamo
            this.router.navigate(['/home']);
          } else {
            //Usuario o contraseña incorrectos
            this.msglogin = result.msg;
          }
        },
        (error) => {
          this.toastr.error(error.error.msg || 'Error procensado la operación');
        }
      );
    this.formUsuario.reset(); //Limpiar el formulario
  }

  guardarUsuarioEnStorage(usuario: any) {
    const { username, email, nombres, apellido, userId, imagen } = usuario;
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('nombres', nombres);
    sessionStorage.setItem('apellido', apellido);
    sessionStorage.setItem('id', userId);

    if (imagen) {
      sessionStorage.setItem('imagen', imagen);
    }
  }

  //Crear cuenta
  createCount() {
    this.loginService.createCount(this.userform).subscribe(
      (result) => {
        if (result.status == 1) {
          this.toastr.success(result.msg);
        } else {
          this.msglogin = result.msg;
        }
      },
      (error) => {
        this.toastr.error(error.error.msg || 'Error procensado la operación');
        alert(error.error.causa);
      }
    );
    this.formUsuario.reset(); //Limpiar el formulario
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
    this.formUsuario.reset();
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

  irHome() {
    this.router.navigate(['/home']);
  }

  cambioPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
