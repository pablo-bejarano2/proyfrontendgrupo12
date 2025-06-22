import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
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

@Component({
  selector: 'app-formulario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario implements OnInit {
  formUsuario!: FormGroup;
  userform: Usuario = new Usuario(); //usuario mapeado al formulario
  returnUrl!: string;
  msglogin!: string; // mensaje que indica si no paso el login
  accion: string = 'login';
  mostrarPassword: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.formUsuario = this.fb.group({
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
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-Z0-9_]+$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        MisValidadores.validarPassword,
      ]),
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    console.log(this.returnUrl);
  }

  cambiarAccion(nuevaAccion: string) {
    this.accion = nuevaAccion;
    console.log(this.accion);
    this.limpiarFormulario();
  }

  irHome() {
    console.log('Redirigiendo al inicio...');
    this.router.navigate(['/home']);
  }

  cambioPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  login() {
    this.userform.rol = 'cliente';
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
            this.msglogin = 'Credenciales incorrectas';
          }
        },
        (error) => {
          alert('Error de conexión');
          console.log('Error de conexión');
          console.log(error);
        }
      );
    this.limpiarFormulario();
  }

  createCount() {
    this.userform.rol = 'cliente';
    this.loginService.createCount(this.userform).subscribe(
      (result) => {
        console.log(result);
        this.toastr.success(result.msg);
      },
      (error) => {
        console.log(error);
        this.toastr.error(error.error.msg || 'Error procensado la operación');
      }
    );
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.userform = new Usuario();
    this.msglogin = '';
  }
}
