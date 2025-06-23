import { Component } from '@angular/core';
import {
  TitleCasePipe
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  Accordion,
  AccordionItemDirective
} from '../../shared/accordion/accordion';
import * as bootstrap from 'bootstrap';

export interface Product {
  id: number;
  name: string;
  price: number;
  brand: string;
  images: string[];
  sizes: string[];
  colors: string[];
  hover: boolean;
  category?: string; // Si tienes categoría
}
export const Products = [
  {
    id: 1,
    name: 'Producto 1',
    price: 19999.99,
    brand: 'Producto 1',
    images: [
      'assets/buzo-blanco-espalda.webp',
      'assets/buzo-blanco-frente.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'withe'],
    hover: false
  },
  {
    id: 2,
    name: 'Producto 2',
    price: 19999.99,
    brand: 'Producto 2',
    images: [
      'assets/buzo-blanco-espalda.webp',
      'assets/buzo-blanco-frente.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'withe'],
    hover: false
  },
  {
    id: 3,
    name: 'Producto 1',
    brand: 'Producto 1',
    price: 19999.99,
    images: [
      'assets/buzo-blanco-espalda.webp',
      'assets/buzo-blanco-frente.webp'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black', 'withe'],
    hover: false
  },
]


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
export class ProductList {
  products: Product[] = Products;
    allProducts: Product[] = Products;
    colors: string[] = [];
    categories: string[] = [];
    selectedColors: { [color: string]: boolean } = {};
    priceRange: { min: number; max: number } = { min: 0, max: 0 };
    selectedCategory: string = '';
    currentPage = 1;
    hoveredIndex: number | null = null;
    totalProducts: number = 0;
  ngOnInit() {
      this.loadProducts();
      this.colors = this.getAllColors();
      this.categories = this.getAllCategories();
      this.selectedColors = {};
      this.priceRange = { min: 0, max: 0 };
      this.selectedCategory = '';
      this.currentPage = 1;
      this.hoveredIndex = -1;
    }

    loadProducts() {
      this.products = [...this.allProducts];
      this.totalProducts = this.products.length;
    }

    onFilterChange() {
      let filtered = [...this.allProducts];

      // Filtrar por color
      const activeColors = Object.keys(this.selectedColors).filter(c => this.selectedColors[c]);
      if (activeColors.length) {
        filtered = filtered.filter(p => p.colors.some(color => activeColors.includes(color)));
      }

      // Filtrar por precio
      if (this.priceRange.min) {
        filtered = filtered.filter(p => p.price >= this.priceRange.min);
      }
      if (this.priceRange.max) {
        filtered = filtered.filter(p => p.price <= this.priceRange.max);
      }

      // Filtrar por categoría
      if (this.selectedCategory) {
        filtered = filtered.filter(p => p.category === this.selectedCategory);
      }

      this.products = filtered;
      this.totalProducts = filtered.length;
      this.currentPage = 1;
    }

    onSortChange(event: any) {
      const value = event.target.value;
      if (value === 'name') {
        this.products.sort((a, b) => a.name.localeCompare(b.name));
      } else if (value === 'price-low') {
        this.products.sort((a, b) => a.price - b.price);
      } else if (value === 'price-high') {
        this.products.sort((a, b) => b.price - a.price);
      }
    }

    setHover(index: number, isHover: boolean) {
      this.hoveredIndex = isHover ? index : -1;
    }

    trackByProduct(product: Product) {
      return product.id;
    }

    getAllColors(): string[] {
      const colorSet = new Set<string>();
      this.allProducts.forEach(p => p.colors.forEach(c => colorSet.add(c)));
      return Array.from(colorSet);
    }

    getAllCategories(): string[] {
      const categorySet = new Set<string>();
      this.allProducts.forEach(p => p.category && categorySet.add(p.category));
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

}
