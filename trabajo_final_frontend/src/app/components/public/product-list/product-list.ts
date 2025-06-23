import { Component, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accordion, AccordionItemDirective } from '../../shared/accordion/accordion';
import * as bootstrap from 'bootstrap';
import { ProductoService, Producto } from '../../../services/producto';

@Component({
  selector: 'app-product-list',
  imports: [
    FormsModule,
    TitleCasePipe,
    Accordion,
    AccordionItemDirective
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

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productoService.obtenerProductos().subscribe(
      (productos) => {
        this.allProducts = productos;
        this.products = [...productos];
        this.totalProducts = this.products.length;

        // Extraer colores únicos
        this.colors = this.getAllColors();

        // Extraer categorías únicas
        this.categories = this.getAllCategories();

        // Inicializar filtros
        this.selectedColors = {};
        this.priceRange = {
          min: 0,
          max: Math.max(...productos.map(p => p.precio), 0)
        };
      },
      (error) => {
        console.error('Error al obtener productos:', error);
      }
    );
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
      if (p.categoria && p.categoria.nombre) {
        categorySet.add(p.categoria.nombre);
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

    // Filtrar por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(p =>
        p.categoria && p.categoria.nombre === this.selectedCategory
      );
    }

    this.products = filtered;
    this.totalProducts = filtered.length;
    this.currentPage = 1;
  }
}
