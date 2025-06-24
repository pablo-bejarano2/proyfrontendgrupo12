import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormsModule,
  NgForm,
  ValidationErrors,
} from '@angular/forms';
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
  returnUrl!: string; //url para usar router
  msglogin!: string; // mensaje que indica si no paso el login
  accion: string = 'login'; //accion para el comportamiento del form
  mostrarPassword: boolean = false; //para mostrar la contraseña

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

  ngOnInit(): void {
    this.loadGoogleScript(); // 1. Carga dinámica del script de Google
    (window as any).handleCredentialResponse =
      this.handleCredentialResponse.bind(this); // 2. Declara la función global que Google usará
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  /*Esta función simplemente carga el script oficial de Google Identity Services.*/
  private loadGoogleScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      const token = response.credential;
      this.loginService.loginGoogle(token).subscribe(
        (result) => {
          //Manejar la respuesta del backend (guardar datos, redirigir, etc.)
          sessionStorage.setItem('userGoogle', result.nombre);
          sessionStorage.setItem('emailGoogle', result.email);
          sessionStorage.setItem('imagenGoogle', result.imagen);
          this.router.navigate(['/home']);
        },
        (error) => {
          alert('Error al iniciar sesión con Google');
        }
      );
    });
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

  login() {
    this.loginService
      .login(this.userform.username, this.userform.password)
      .subscribe(
        (result) => {
          var usuario = result;
          if (usuario.status == 1) {
            //Guardar el usuario en cookies en el cliente
            sessionStorage.setItem('usuario', usuario.username);
            sessionStorage.setItem('usuarioId', usuario.userId);
            sessionStorage.setItem('rol', usuario.rol);

            //redirigimos a home o a pagina que llamo
            this.router.navigateByUrl(this.returnUrl);
          } else {
            //usuario no encontrado
            this.msglogin = result.msg;
          }
        },
        (error) => {
          alert('Error de conexión');
          console.log('Error de conexión');
          console.log(error);
        }
      );
    this.formUsuario.reset();
  }

  createCount() {
    this.loginService.createCount(this.userform).subscribe(
      (result) => {
        var usuario = result;
        console.log(usuario);
        if (usuario.status == 1) {
          console.log(usuario);
          this.toastr.success(usuario.msg);
        } else {
          this.msglogin = usuario.msg;
        }
      },
      (error) => {
        console.log(error);
        this.toastr.error(error.error.msg || 'Error procensado la operación');
      }
    );
    this.formUsuario.reset();
  }

  procesarFormulario() {
    if (this.accion === 'register') {
      this.asignarValores('cliente');
      this.createCount();
    } else {
      //No permitir enviar form vacío en login
      if (
        !this.formUsuario.get('username')?.value ||
        !this.formUsuario.get('password')?.value
      ) {
        this.msglogin = 'Debe completar usuario y contraseña';
        return;
      }
      this.asignarValores();
      this.login();
    }
    this.msglogin = '';
  }

  asignarValores(rol: string = '') {
    const valores = this.formUsuario.value;
    this.userform.nombres = valores.nombres;
    this.userform.apellido = valores.apellido;
    this.userform.email = valores.email;
    this.userform.username = valores.username;
    this.userform.password = valores.password;
    if (rol) {
      this.userform.rol = rol;
    }
    console.log('en asignarValores');
    console.log(this.userform);
  }

  cambiarAccion(nuevaAccion: string) {
    this.accion = nuevaAccion;
    this.msglogin = '';
    this.formUsuario.reset();
  }

  irHome() {
    console.log('Redirigiendo al inicio...');
    this.router.navigate(['/home']);
  }

  cambioPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
