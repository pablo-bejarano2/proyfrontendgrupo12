import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  output,
  SimpleChange,
  SimpleChanges,
  ViewChildren,
  ViewChild,
  ElementRef,
  QueryList
} from '@angular/core';
import { FormArray, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Producto } from '../../../services/producto';
import { Categoria, CategoriaService } from '../../../services/categoria';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MisValidadores } from '../../../validadores/mis-validadores';
@Component({
  selector: 'app-producto-form',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm implements OnInit {
  @Input() producto: Producto | null = null; // Producto a editar o crear
  @Output() cerrar = new EventEmitter<void>(); // Evento para cerrar el modal y notificar al componente padre
  @Output() guardarForm = new EventEmitter<FormData>(); // Evento para notificar al componente padre cuando se guarda un producto
  @ViewChildren('inputReemplazo') inputsReemplazo!: QueryList<ElementRef>;
  @ViewChild('inputAgregarImagen') inputAgregarImagen!: ElementRef<HTMLInputElement>;
  productoForm!: FormGroup;
  categorias: Categoria[] = [];
  imagenesSeleccionadas: File[] = []; // Array para almacenar las imágenes seleccionadas

  constructor(private fb: FormBuilder, private categoriaService: CategoriaService) { }
  ngOnInit(): void {
    this.cargarCategorias();
    this.categoriaService.categoriasActualizadas$.subscribe(() => {
      this.cargarCategorias();
    });
    this.productoForm = this.fb.group({
      nombre: [this.producto?.nombre || '', Validators.required],
      descripcion: [this.producto?.descripcion || '', Validators.required],
      precio: [this.producto?.precio || '', [Validators.required, Validators.min(0)]],
      color: [this.producto?.color || '', Validators.required],
      categoria: [this.producto?.categoria?._id || '', Validators.required],
      tallas: this.fb.array([], MisValidadores.minLengthArray(1)),
    });
    if (this.producto?.tallas?.length) {
      this.producto.tallas.forEach((t: any) => this.agregarTalla(t));
    } else {
      this.agregarTalla('');
    }
  }
  get tallas(): FormArray {
    return this.productoForm.get('tallas') as FormArray;
  }
  agregarTalla(talla: any = { talla: '', stock: 0 }) {
    this.tallas.push(this.fb.group({
      talla: [talla.talla || '', Validators.required],
      stock: [talla.stock || 0, [Validators.required, Validators.min(0)]]
    }));
  }
  eliminarTalla(index: number) {
    this.tallas.removeAt(index);
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    this.imagenesSeleccionadas = Array.from(files);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['producto'] && this.producto) {
      this.productoForm.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion,
        precio: this.producto.precio,
        color: this.producto.color,
        imagenes: this.producto.imagenes,
        categoria: typeof this.producto.categoria === 'object'
          ? this.producto.categoria._id
          : this.producto.categoria
      });

      // Limpiar tallas actuales
      while (this.tallas.length !== 0) {
        this.tallas.removeAt(0);
      }
      // Agregar las tallas del producto
      if (this.producto.tallas && this.producto.tallas.length) {
        this.producto.tallas.forEach((t: any) => this.agregarTalla(t));
      } else {
        this.agregarTalla();
      }
    }
  }

  guardar() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }
    if (this.productoForm.valid) {
      const formData = new FormData();
      const productoData = this.productoForm.value;
      formData.append('nombre', productoData.nombre);
      formData.append('descripcion', productoData.descripcion);
      formData.append('precio', productoData.precio);
      formData.append('color', productoData.color);
      formData.append('categoria', productoData.categoria);
      formData.append('tallas', JSON.stringify(productoData.tallas));
      this.imagenesSeleccionadas.forEach((file, index) => {
        formData.append('imagenes', file);
      });

      formData.forEach((valor, clave) => {
        console.log(clave, valor);
      });
      this.guardarForm.emit(formData); // Emitimos el evento con los datos del formulario
    }
  }
  eliminarImagenExistente(index: number) {
    if (this.producto && this.producto.imagenes) {
      this.producto.imagenes.splice(index, 1);
    }
  }
  abrirInputReemplazo(index: number) {
    this.inputsReemplazo.toArray()[index].nativeElement.click();
  }
  reemplazarImagen(event: any, index: number) {
    const file: File = event.target.files[0];
    if (file) {
      // Reemplaza la imagen en el array de imágenes seleccionadas para enviar al backend
      if (this.producto && this.producto.imagenes) {
        // Opcional: previsualización inmediata
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.producto!.imagenes[index] = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      // Guarda el archivo para enviar al backend
      this.imagenesSeleccionadas[index] = file;
    }
  }
  agregarImagenes(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.imagenesSeleccionadas.push(files[i]);
    }
    // Limpiar el input para permitir volver a seleccionar las mismas imágenes si se desea
    event.target.value = '';
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
    console.log(this.categorias);
  }

  cancelar() {
    this.productoForm.reset();
    this.cerrar.emit();
  }


}
