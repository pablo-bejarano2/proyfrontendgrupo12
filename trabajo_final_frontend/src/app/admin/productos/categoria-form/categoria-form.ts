import { Component } from '@angular/core';
import { Categoria, CategoriaService } from '../../../services/categoria';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    this.nuevaCategoria ={
      nombre : this.nombre,
      descripcion: this.descripcion
    };
    if(!this.nuevaCategoria){
      this.toastr.warning('Debe existir una categoría !!');
    }else{

      this.categoriaService.crearCategoria(this.nuevaCategoria).subscribe({
        next: (cat) =>{
          this.categorias.push(cat);
          this.toastr.success('Categoría creada !');
          this.nuevaCategoria = undefined;
          this.cargarCategorias();
        },
        error: () => this.toastr.error('Error al crear la categoría')
      }); 
    }
  }



}
