import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../../../services/categoria';

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

  categorias: any[] = [];
  constructor(
    private categoriaService: CategoriaService,
    public loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.email = sessionStorage.getItem('email') || '';
    this.imagen = sessionStorage.getItem('imagen') || 'assets/user.jpg';
    //console.log('Img en el header: ' + this.imagen);
    this.username = sessionStorage.getItem('username') || '';
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe(
      (categorias) => {
        this.categorias = categorias;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
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

  irAFormulario() {
    this.router.navigate(['/form'], {
      queryParams: { returnUrl: this.router.url, accion: 'login' },
    });
  }
}
