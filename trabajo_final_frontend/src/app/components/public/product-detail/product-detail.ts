import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ItemPedidoService } from '../../../services/item-pedido';
import { ProductoService } from '../../../services/producto';
import { ItemPedido } from '../../../models/item-pedido';
import { Producto } from '../../../models/producto';
import { AddToCart } from '../add-to-cart/add-to-cart';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, AddToCart],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  itemProductService = inject(ItemPedidoService);
  productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);

  showCartModal = false;
  currentProduct: Producto | null = null;
  selectedSize = '';
  activeThumbnailIndex = 0;
  imagesInView = true;
  wishlistActive = false;
  hoveredIndex = -1;
  products: any[] = [];
  mainImages: string[] = [];
  thumbnails: { src: string, alt: string }[] = [];


  ngOnInit(): void {
     const productId = this.route.snapshot.paramMap.get('id');
     if (productId) {
       this.loadProduct(productId);
     } else {
       this.loadExampleProduct();
     }
   }

  private loadProduct(id: string): void {
    this.productoService.obtenerProductoPorId(id).subscribe(
      (producto) => {
        this.currentProduct = new Producto(producto) ;
        this.initImages();
      },
      (error) => {
        console.error('Error al cargar el producto:', error);
      }
    );
  }
  private initImages(): void {
    if (this.currentProduct && this.currentProduct.imagenes) {
      this.mainImages = this.currentProduct.imagenes;
      this.thumbnails = this.currentProduct.imagenes.map((img, i) => ({
        src: img,
        alt: `Imagen ${i + 1} de ${this.currentProduct!.nombre}`
      }));
    }
  }

  private loadExampleProduct(): void {
    this.currentProduct = new Producto({
      _id: '1',
      nombre: 'Forever Lover Sweat',
      descripcion: 'Comfortable and stylish sweatshirt made from premium cotton blend. Features a relaxed fit and soft interior lining for maximum comfort.',
      precio: 85,
      color: 'Negro',
      imagenes: [
        '/assets/product1.jpg',
        '/assets/product2.jpg',
        '/assets/product3.jpg'
      ],
      tallas: [
        { talla: 'XS', stock: 5 },
        { talla: 'S', stock: 10 },
        { talla: 'M', stock: 15 },
        { talla: 'L', stock: 8 },
        { talla: 'XL', stock: 3 }
      ],
      categoria: {
        _id: 'cat1',
        nombre: 'Apparel'
      }
    });
    this.initImages();

  }

  get sizes(): string[] {
    return this.currentProduct?.tallasDisponibles || [];
  }


  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectThumbnail(index: number): void {
    this.activeThumbnailIndex = index;
  }

  toggleWishlist(): void {
    this.wishlistActive = !this.wishlistActive;
  }

  setHover(index: number, isHovered: boolean): void {
    this.hoveredIndex = isHovered ? index : -1;
  }

  addToBag(): void {
    console.log('=== INICIO addToBag() ===');
    console.log('currentProduct:', this.currentProduct);
    console.log('selectedSize:', this.selectedSize);

    if (!this.currentProduct) {
      console.error('No hay producto cargado');
      alert('Error: No hay producto cargado');
      return;
    }

    if (!this.selectedSize) {
      console.warn('No hay talla seleccionada');
      alert('Por favor selecciona una talla');
      return;
    }

    const stockDisponible = this.currentProduct.getStockPorTalla(this.selectedSize);
    console.log('Stock disponible para talla', this.selectedSize, ':', stockDisponible);

    if (stockDisponible <= 0) {
      console.warn(`Sin stock para talla ${this.selectedSize}`);
      alert(`La talla ${this.selectedSize} no tiene stock disponible`);
      return;
    }

    const itemPedido: ItemPedido = {
      id: this.generateItemId(),
      producto: this.currentProduct,
      cantidad: 1,
      talla: this.selectedSize,
      precio_unitario: this.currentProduct.precio,
      color: this.currentProduct.color
    };

    console.log('ItemPedido creado:', itemPedido);

    try {
      this.itemProductService.addItem(itemPedido);
      console.log('Item agregado al servicio exitosamente');

      this.showCartModal = true;
      console.log('Modal del carrito mostrado');

      console.log('=== FIN addToBag() EXITOSO ===');
    } catch (error) {
      console.error('Error agregando producto al carrito:', error);
      alert('Hubo un error al agregar el producto al carrito');
    }
  }

  onCartModalClosed(): void {
    this.showCartModal = false;
  }

  private generateItemId(): string {
    return `${this.currentProduct!._id}-${this.selectedSize}-${Date.now()}`;
  }

  get productPrice(): string {
    return this.currentProduct?.precio.toString() || '0';
  }

  get productName(): string {
    return this.currentProduct?.nombre || '';
  }

  get productSku(): string {
    return this.currentProduct?._id?.toUpperCase() || 'N/A';
  }

  get stockInfo(): string {
    if (!this.selectedSize || !this.currentProduct) return '';
    const stock = this.currentProduct.getStockPorTalla(this.selectedSize) || 0;
    return stock > 0 ? `${stock} disponibles` : 'Sin stock';
  }

  get isProductLoaded(): boolean {
    return this.currentProduct !== null;
  }

  // Getter corregido para categoría
  get categoriaNombre(): string {
    if (!this.currentProduct?.categoria) {
      return 'Productos';
    }

    // Si categoria es un string, devolverlo directamente
    if (typeof this.currentProduct.categoria === 'string') {
      return this.currentProduct.categoria;
    }

    // Si categoria es un objeto, devolver su propiedad nombre
    if (typeof this.currentProduct.categoria === 'object' && 'nombre' in this.currentProduct.categoria) {
      return this.currentProduct.categoria.nombre || 'Productos';
    }

    return 'Productos';
  }

  getTallaInfo(talla: string, medida: 'pecho' | 'cintura'): string {
    const medidas: { [key: string]: { pecho: string, cintura: string } } = {
      'XS': { pecho: '86-89', cintura: '66-69' },
      'S': { pecho: '90-93', cintura: '70-73' },
      'M': { pecho: '94-97', cintura: '74-77' },
      'L': { pecho: '98-101', cintura: '78-81' },
      'XL': { pecho: '102-105', cintura: '82-85' }
    };

    return medidas[talla]?.[medida] || '-';
  }

  // Método helper para obtener el nombre de la categoría de forma segura
  getCategoryName(): string {
    return this.categoriaNombre;
  }

  // Método helper para verificar si hay descripción
  hasDescription(): boolean {
    return !!(this.currentProduct?.descripcion && this.currentProduct.descripcion.trim().length > 0);
  }

  // Método helper para verificar si hay stock total
  hasStockTotal(): boolean {
    return !!(this.currentProduct?.stockTotal && this.currentProduct.stockTotal > 0);
  }

  // Método helper para verificar si hay color
  hasColor(): boolean {
    return !!(this.currentProduct?.color && this.currentProduct.color.trim().length > 0);
  }

  // Método helper para verificar si hay tallas
  hasTallas(): boolean {
    return !!(this.currentProduct?.tallas && this.currentProduct.tallas.length > 0);
  }

  // Agregar estos métodos para debug y verificación
  get isButtonEnabled(): boolean {
    const hasSize = !!this.selectedSize;
    const hasStock = this.currentProduct ? this.currentProduct.stockTotal > 0 : false;

    console.log('Debug botón:', {
      selectedSize: this.selectedSize,
      hasSize,
      stockTotal: this.currentProduct?.stockTotal,
      hasStock,
      enabled: hasSize && hasStock
    });

    return hasSize && hasStock;
  }

  // Método mejorado para verificar stock
  get hasStock(): boolean {
    if (!this.currentProduct || !this.selectedSize) return false;
    const stock = this.currentProduct.getStockPorTalla(this.selectedSize);
    return stock > 0;
  }
}
