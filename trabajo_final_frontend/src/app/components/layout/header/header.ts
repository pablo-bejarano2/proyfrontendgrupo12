import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../../../services/categoria';
import { ItemPedidoService } from '../../../services/item-pedido';
import { AddToCart } from '@/app/components/public/add-to-cart/add-to-cart';
import { NavigationStart} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, AddToCart],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  //Datos del usuario
  email: string = '';
  imagen: string = '';
  username: string = '';
  cartItemsCount: number = 0;
  showCartModal = false;
  categorias: any[] = [];
  mostrarMenu: boolean = false; // Variable para controlar la visibilidad del menú

  constructor(
    private categoriaService: CategoriaService,
    public loginService: LoginService,
    private router: Router,
    private itemPedidoService: ItemPedidoService // Inyecta el servicio del carrito
  ) {
    this.showCartModal = false;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showCartModal = false;
      }
    });
  }

  ngOnInit() {
    this.showCartModal = false;
    this.cargarCategorias();
    this.email = sessionStorage.getItem('email') || '';
    this.imagen = sessionStorage.getItem('imagen') || 'assets/user.jpg';
    //console.log('Img en el header: ' + this.imagen);
    this.username = sessionStorage.getItem('username') || '';
    this.itemPedidoService.cartItemsCount$.subscribe((count) => {
      this.cartItemsCount = count;
    });
    this.itemPedidoService.abrirCarrito$.subscribe(() => {
      console.log('Evento abrirCarrito$ recibido');
      if(!this.showCartModal){
        this.showCartModal = true;
      }
    });
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

  abrirCarrito() {
    console.log('Botón de carrito clickeado');

    this.showCartModal=true;
  }
  irAFormulario() {
    this.router.navigate(['/form'], {
      queryParams: { returnUrl: this.router.url, accion: 'login' },
    });
  }
}
