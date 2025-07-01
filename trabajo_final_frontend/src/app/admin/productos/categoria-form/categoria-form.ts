import { Component } from '@angular/core';
import { Categoria, CategoriaService } from '../../../services/categoria';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-categoria-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css'
})
export class CategoriaForm {

  nuevaCategoria: Categoria | undefined;
  nombre: string = '';
  descripcion: string = '';
  categorias: Categoria[] = [];

  constructor(private categoriaService: CategoriaService, private toastr: ToastrService) { }

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe(
      (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  crearCategoria(): void {
    this.nuevaCategoria = {
      nombre: this.nombre,
      descripcion: this.descripcion
    };
    if (!this.nuevaCategoria.nombre || !this.nuevaCategoria.descripcion) {
      this.toastr.warning('Los campos no deben estar vacíos');
    } else {

      this.categoriaService.crearCategoria(this.nuevaCategoria).subscribe({
        next: (cat) => {
          this.categorias.push(cat);
          this.toastr.success('Categoría creada !');
          this.nuevaCategoria = undefined;
          this.cargarCategorias();
          this.categoriaService.notificarCambioCategorias();
        },
        error: () => this.toastr.error('Error al crear la categoría')
      });
    }
  }
  eliminarCategoria(id: string): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe({
          next: () => {
            this.categorias = this.categorias.filter(cat => cat._id !== id);
            this.toastr.success('Categoría eliminado con éxito !');
            this.categoriaService.notificarCambioCategorias();
          },
          error: () => this.toastr.error('Error al eliminar la Categoria')
        });
      }
    });
  }


}
