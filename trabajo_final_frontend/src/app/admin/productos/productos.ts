import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto, ProductoService } from '../../services/producto';
import { ProductoForm } from './producto-form/producto-form';
import { ToastrService } from 'ngx-toastr';
import { CategoriaForm } from './categoria-form/categoria-form';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-productos',
  imports: [CommonModule, CategoriaForm, ReactiveFormsModule, ProductoForm],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  busquedaControl = new FormControl('');

  constructor(private productoService: ProductoService, private toastr: ToastrService) { }


  ngOnInit(): void {
    this.cargarProductos();
    this.buscarProductoPorNombre();
  }


  abrirModal(producto?: Producto): void {
    if (producto) {
      this.productoSeleccionado = producto;
    } else {
      this.productoSeleccionado = null;
    }
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  buscarProductoPorNombre() {
    this.busquedaControl.setValue(this.productoService.valorBusqueda);
    this.busquedaControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((valor) => this.productoService.buscarPorNombre(valor ?? ''))
      )
      .subscribe((respuesta) => {
        this.productos = respuesta;
      })
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
            this.productos = [...this.productos]; // Forzar refresco

          }
          this.toastr.success('Producto actualizado con éxito');
          this.cerrarModal();
        },
        error: (error) => {
        // Mostrar mensaje específico si viene del backend
        if (error?.error?.msg) {
          this.toastr.error(error.error.msg);
        } else {
          this.toastr.error('Error al actualizar el producto');
        }
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
         error: (error) => {
        // Mostrar mensaje específico si viene del backend
        if (error?.error?.msg) {
          this.toastr.error(error.error.msg);
        } else {
          this.toastr.error('Error al actualizar el producto');
        }
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
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00bcd4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.eliminarProducto(id).subscribe({
          next: () => {
            this.productos = this.productos.filter(prod => prod._id !== id);
            this.toastr.success('Producto eliminado con éxito !');
          },
          error: () => this.toastr.error('Error al eliminar Producto')
        });
      }
    });
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
