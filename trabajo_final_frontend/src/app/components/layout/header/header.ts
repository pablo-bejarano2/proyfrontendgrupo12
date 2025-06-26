import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  //Datos del usuario
  email: string = '';
  imagen: string = '';
  username: string = '';

  constructor(public loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.email = sessionStorage.getItem('email') || '';
    this.imagen = sessionStorage.getItem('imagen') || 'assets/user.jpg';
    this.username = sessionStorage.getItem('username') || '';
  }

  logout() {
    //Borrar las variables almacenadas mediante el storage
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }

  userLogged(): boolean {
    var resultado = false;
    var usuarioGoogle = sessionStorage.getItem('username');
    if (usuarioGoogle != null) {
      resultado = true;
    }
    return resultado;
  }

  configurarCuenta() {
    this.router.navigate(['/cuenta']);
  }
}
