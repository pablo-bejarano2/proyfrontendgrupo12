import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto, ProductoService } from '../../services/producto';
import { ProductoForm } from './producto-form/producto-form';
import { ToastrService } from 'ngx-toastr';
import { CategoriaForm } from './categoria-form/categoria-form';
@Component({
  selector: 'app-productos',
  imports: [CommonModule, ProductoForm, CategoriaForm],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  productos: Producto[] = [];
  mostrarModal = false; // Controla la visibilidad del modal
  productoSeleccionado: Producto | null = null;

  constructor(private productoService: ProductoService, private toastr: ToastrService) { }


  ngOnInit(): void {
    this.cargarProductos();
  }

  abrirModal(producto?: Producto): void {
    if(producto){
      this.productoSeleccionado = producto;
    } else {
      this.productoSeleccionado = null;
    }
    }

  cerrarModal(): void {
    this.productoSeleccionado = null; // Reinicia la selección del producto
  }

  guardarProducto(productoForm: FormData) {
    if (this.productoSeleccionado) {
      // Modo editar
      this.productoService.actualizarProducto(this.productoSeleccionado._id, productoForm).subscribe({
        next: (productoActualizado) => {
          // Reemplazamos el producto en la lista local
          const index = this.productos.findIndex(p => p._id === productoActualizado._id);
          if (index !== -1) {
            this.productos[index] = productoActualizado;
          }
          this.toastr.success('Producto actualizado con éxito');
          this.cerrarModal();
        },
        error: () => {
          this.toastr.error('Error al actualizar el producto');
        }
      });

    } else {
      // Modo crear
      this.productoService.crearProducto(productoForm).subscribe({
        next: (productoCreado) => {
          this.productos.push(productoCreado); // Añadimos sin recargar todo
          this.toastr.success('Producto creado con éxito');
          this.cerrarModal();
        },
        error: () => {
          this.toastr.error('Error al crear el producto');
        }
      });
    }
  }

  cargarProductos(): void { //Consumo api de productos
    this.productoService.obtenerProductos().subscribe(
      (productos: Producto[]) => {
        this.productos = productos;
      },
      (error) => {
        console.error('Error al cargar productos:', error);
      }
    );
  }

  //Método para Crear un nuevo Producto
  crearProducto(nuevoProducto: FormData): void {
    this.productoService.crearProducto(nuevoProducto).subscribe(
      (productoCreado: Producto) => {
        console.log('Producto creado:', productoCreado);
      },
      (error) => {
        console.error('Error al crear producto:', error);
      }
    );
  }
  // Método para eliminar un producto por ID
  eliminarProducto(id: string): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () =>{
      this.productos = this.productos.filter(prod => prod._id !== id);
      this.toastr.success('Producto eliminado con éxito !');
      },
      error: () => this.toastr.error('Error al eliminar Producto')
    })
  }
  // Método para actualizar un producto
  actualizarProducto(id: string, productoActualizado: FormData): void {
    this.productoService.actualizarProducto(id, productoActualizado).subscribe(
      (producto: Producto) => {
        console.log('Producto actualizado:', producto);
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
      }
    );
  }



}
