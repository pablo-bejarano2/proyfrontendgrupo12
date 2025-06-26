import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../../services/producto';


@Component({
  selector: 'app-productos',
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})

export class Productos implements OnInit {

  productos: Producto[] = [];

  constructor(private productoService: ProductoService){}

  cargarProductos(): void {
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
  crearProducto(nuevoProducto: Partial<Producto>): void {
    this.productoService.crearProducto(nuevoProducto).subscribe(
      (productoCreado: Producto) => {
        this.productos.push(productoCreado);
        console.log('Producto creado:', productoCreado);
      },
      (error) => {
        console.error('Error al crear producto:', error);
      }
    );
  }
  // Método para eliminar un producto por ID
  eliminarProducto(id: string): void {
    this.productoService.eliminarProducto(id).subscribe(
      () => {
        this.productos = this.productos.filter(producto => producto._id !== id);
        console.log('Producto eliminado:', id);
      },
      (error) => {
        console.error('Error al eliminar producto:', error);
      }
    );
  }
  // Método para actualizar un producto
  actualizarProducto(id: string, productoActualizado: Partial<Producto>): void {
    this.productoService.actualizarProducto(id, productoActualizado).subscribe(
      (producto: Producto) => {
        const index = this.productos.findIndex(p => p._id === id);
        if (index !== -1) {
          this.productos[index] = producto;
        }
        console.log('Producto actualizado:', producto);
      },
      (error) => {
        console.error('Error al actualizar producto:', error);
      }
    );
  }


  ngOnInit(): void {
    this.cargarProductos();
  }

}
