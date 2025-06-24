import {
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CategoriaService
} from '../../../services/categoria';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  categorias: any[]=[];
  constructor(private categoriaService: CategoriaService) { }

    ngOnInit(): void {
      this.cargarCategorias();
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

}
