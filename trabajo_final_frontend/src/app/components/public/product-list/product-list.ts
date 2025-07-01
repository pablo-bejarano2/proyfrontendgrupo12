import { Component, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accordion, AccordionItemDirective } from '../../shared/accordion/accordion';
import * as bootstrap from 'bootstrap';
import { ProductoService } from '../../../services/producto';
import { Producto, Categoria } from '../../../models/producto';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [
    FormsModule,
    TitleCasePipe,
    Accordion,
    AccordionItemDirective,
    CommonModule,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  // Productos originales y filtrados
  allProducts: Producto[] = [];
  products: Producto[] = [];

  // Filtros
  colors: string[] = [];
  categories: string[] = [];
  selectedColors: { [color: string]: boolean } = {};
  priceRange: { min: number; max: number } = { min: 0, max: 0 };
  selectedCategory: string = '';
  currentPage = 1;
  hoveredIndex: number | null = null;
  totalProducts: number = 0;
  searchTerm: string = '';

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(): void {
    // Primero escuchamos los parámetros de la ruta (/products/:categoryName)
    this.route.params.subscribe(params => {
      this.resetFilters();

      if (params['categoryName']) {
        this.selectedCategory = params['categoryName'];
      }

      this.loadProducts();
    });

    // También escuchamos los parámetros de consulta para mantener compatibilidad
    this.route.queryParams.subscribe(params => {
      if (params['category'] && !this.selectedCategory) {
        this.selectedCategory = params['category'];
        this.loadProducts();
      }
    });
  }

  // Resetear filtros
  resetFilters() {
    this.selectedColors = {};
    this.selectedCategory = '';
    this.priceRange = { min: 0, max: 0 };
    this.searchTerm = '';
  }

  loadProducts() {
    if (this.selectedCategory) {
      // Si hay una categoría seleccionada, cargar productos por categoría
      this.productoService.obtenerProductosPorCategoria(this.selectedCategory).subscribe(
        (productos) => {
          this.allProducts = productos;
          this.products = [...productos];
          this.totalProducts = this.products.length;

          // Inicializar filtros con datos de estos productos
          this.colors = this.getAllColors();
          this.categories = this.getAllCategories();
          this.priceRange.max = Math.max(...productos.map(p => p.precio), 0);
        },
        (error) => {
          console.error('Error al obtener productos por categoría:', error);
        }
      );
    } else {
      // Cargar todos los productos
      this.productoService.obtenerProductos().subscribe(
        (productos) => {
          this.allProducts = productos;
          this.products = [...productos];
          this.totalProducts = this.products.length;

          this.colors = this.getAllColors();
          this.categories = this.getAllCategories();
          this.priceRange.max = Math.max(...productos.map(p => p.precio), 0);
        },
        (error) => {
          console.error('Error al obtener productos:', error);
        }
      );
    }
  }

  onSortChange(event: any) {
    const value = event.target.value;
    if (value === 'name') {
      this.products.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (value === 'price-low') {
      this.products.sort((a, b) => a.precio - b.precio);
    } else if (value === 'price-high') {
      this.products.sort((a, b) => b.precio - a.precio);
    }
  }

  setHover(index: number, isHover: boolean) {
    this.hoveredIndex = isHover ? index : -1;
  }

  trackByProduct(product: Producto) {
    return product._id;
  }

  getAllColors(): string[] {
    const colorSet = new Set<string>();
    this.allProducts.forEach(p => colorSet.add(p.color));
    return Array.from(colorSet);
  }

  getAllCategories(): string[] {
    const categorySet = new Set<string>();
    this.allProducts.forEach(p => {
      // Verificar si es un objeto Categoria o un string
      if (p.categoria && typeof p.categoria === 'object' && (p.categoria as Categoria).nombre) {
        categorySet.add((p.categoria as Categoria).nombre);
      }
    });
    return Array.from(categorySet);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // Lógica para cambiar la página
  }

  openFilterModal() {
    const modal = new bootstrap.Modal(document.getElementById('filterModal')!);
    modal.show();
  }

  onFilterChange() {
    let filtered = [...this.allProducts];

    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtrar por color
    const activeColors = Object.keys(this.selectedColors).filter(c => this.selectedColors[c]);
    if (activeColors.length) {
      filtered = filtered.filter(p => activeColors.includes(p.color));
    }

    // Filtrar por precio
    if (this.priceRange.min) {
      filtered = filtered.filter(p => p.precio >= this.priceRange.min);
    }
    if (this.priceRange.max) {
      filtered = filtered.filter(p => p.precio <= this.priceRange.max);
    }

    // Filtrar por categoría (ya no es necesario si venimos de una ruta con categoría)
    if (this.selectedCategory && !this.route.snapshot.params['categoryName']) {
      filtered = filtered.filter(p => {
        if (p.categoria && typeof p.categoria === 'object') {
          return (p.categoria as Categoria).nombre === this.selectedCategory;
        }
        return false;
      });
    }

    this.products = filtered;
    this.totalProducts = filtered.length;
    this.currentPage = 1;
  }

  goToProductDetail(productId: string): void {
    if (productId) {
      this.router.navigate(['/product-detail', productId]);
    }
  }
}
