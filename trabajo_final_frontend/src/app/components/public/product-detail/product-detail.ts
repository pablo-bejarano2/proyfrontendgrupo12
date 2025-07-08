import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ItemPedidoService } from '../../../services/item-pedido';
import { ProductoService, Producto, Talla } from '../../../services/producto';
import { ItemPedido } from '../../../models/item-pedido';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  itemProductService = inject(ItemPedidoService);
  productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);
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
        this.currentProduct = producto;
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
    this.currentProduct = {
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
        { _id: 't1', talla: 'XS', stock: 5 },
        { _id: 't2', talla: 'S', stock: 10 },
        { _id: 't3', talla: 'M', stock: 15 },
        { _id: 't4', talla: 'L', stock: 8 },
        { _id: 't5', talla: 'XL', stock: 3 }
      ],
      categoria: {
        _id: 'cat1',
        nombre: 'Apparel'
      }
    };
    this.initImages();
  }

  get sizes(): string[] {
    return this.tallasDisponibles;
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
    if (!this.currentProduct) {
      alert('Error: No hay producto cargado');
      return;
    }
    if (!this.selectedSize) {
      alert('Por favor selecciona una talla');
      return;
    }
    const stockDisponible = this.getStockPorTalla(this.selectedSize);
    if (stockDisponible <= 0) {
      alert(`La talla ${this.selectedSize} no tiene stock disponible`);
      return;
    }
    const itemPedido: ItemPedido = {
      _id: this.generateItemId(),
      producto: this.currentProduct,
      cantidad: 1,
      talla: this.selectedSize,
      precio_unitario: this.currentProduct.precio,
      color: this.currentProduct.color,
      subtotal: this.currentProduct.precio*1
    };
    try {
      this.itemProductService.addItem(itemPedido);
      this.itemProductService.abrirCarrito();
    } catch (error) {
      alert('Hubo un error al agregar el producto al carrito');
    }
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
    const stock = this.getStockPorTalla(this.selectedSize) || 0;
    return stock > 0 ? `${stock} disponibles` : 'Sin stock';
  }

  get isProductLoaded(): boolean {
    return this.currentProduct !== null;
  }

  getCategoryName(): string {
    if (!this.currentProduct?.categoria) return 'Productos';
    if (typeof this.currentProduct.categoria === 'string') return this.currentProduct.categoria;
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

  hasDescription(): boolean {
    return !!(this.currentProduct?.descripcion && this.currentProduct.descripcion.trim().length > 0);
  }


  get stockTotal(): number {
    return this.currentProduct?.tallas?.reduce((acc, t) => acc + (t.stock || 0), 0) || 0;
  }

  get tallasDisponibles(): string[] {
    return this.currentProduct?.tallas?.map(t => t.talla) || [];
  }

  getStockPorTalla(talla: string): number {
    return this.currentProduct?.tallas?.find(t => t.talla === talla)?.stock || 0;
  }

  hasStockTotal(): boolean {
    return this.stockTotal > 0;
  }

  hasColor(): boolean {
    return !!(this.currentProduct?.color && this.currentProduct.color.trim().length > 0);
  }

  hasTallas(): boolean {
    return !!(this.currentProduct?.tallas && this.currentProduct.tallas.length > 0);
  }

  get isButtonEnabled(): boolean {
    const hasSize = !!this.selectedSize;
    const hasStock = this.stockTotal > 0;
    return hasSize && hasStock;
  }

  get hasStock(): boolean {
    if (!this.currentProduct || !this.selectedSize) return false;
    const stock = this.getStockPorTalla(this.selectedSize);
    return stock > 0;
  }
}
