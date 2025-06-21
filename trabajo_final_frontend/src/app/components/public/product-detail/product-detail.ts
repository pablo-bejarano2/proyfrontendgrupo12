import {
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';

@Component ({
  selector: 'app-product-detail',
  templateUrl: './product-detail.html',
  standalone: true,
  imports: [
    CommonModule
  ],
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent {
  sizes = ['S', 'M', 'L', 'XL'];
  selectedSize = 'M';

  thumbnails = [
    {
      src: 'assets/buzo-blanco-espalda.webp',
      alt: 'Product thumbnail 1'
    },
    {
      src: 'assets/buzo-blanco-frente.webp',
      alt: 'Product thumbnail 2'
    }
  ];

  activeThumbnailIndex = 0;
  mainImages = [
    'assets/buzo-blanco-espalda.webp',
    'assets/buzo-blanco-frente.webp'
  ];
  products = [
    {
      id: 1,
      name: 'Producto 1',
      price: 89.99,
      images: 'assets/buzo-blanco-espalda.webp',
      sizes: ['S', 'M', 'L', 'XL'],
      hover: false
    },
    {
      id: 2,
      name: 'Producto 2',
      price: 89.99,
      images: 'assets/buzo-blanco-espalda.webp',
      sizes: ['S', 'M', 'L', 'XL'],
      hover: false
    },
    {
      id: 3,
      name: 'Producto 1',
      price: 89.99,
      images: 'assets/buzo-blanco-espalda.webp',
      sizes: ['S', 'M', 'L', 'XL'],
      hover: false
    },
  ]
  hoveredIndex: number | null = null;

  setHover(index: number, isHovered: boolean) {
    this.hoveredIndex = isHovered ? index : null;
  }

  wishlistActive = false;

  // Estados de animación
  @ViewChild ('mainImageContainer') mainImageContainer!: ElementRef;
  @ViewChild ('mainProductImage') mainProductImage!: ElementRef<HTMLImageElement>;
  @ViewChild ('productDetailsSection') productDetailsSection!: ElementRef;

  imagesInView = false;
  detailsInView = false;

  @HostListener ('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition ();
  }

  private checkScrollPosition() {
    // Verificar visibilidad de las imágenes
    if (this.mainImageContainer) {
      const imagesRect = this.mainImageContainer.nativeElement.getBoundingClientRect ();
      const imagesVisible = imagesRect.top < window.innerHeight * 0.8 && imagesRect.bottom > 0;

      if (imagesVisible && !this.imagesInView) {
        this.imagesInView = true;

        // Activar detalles después de las imágenes
        setTimeout (() => {
          this.detailsInView = true;
        }, 600); // Delay para que aparezcan después de las imágenes
      }
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectThumbnail(index: number) {
    this.activeThumbnailIndex = index;

    // Pequeño delay para permitir que el DOM se actualice
    setTimeout (() => {
      // Desplazar a la imagen principal
      if (this.mainImageContainer) {
        this.mainImageContainer.nativeElement.scrollIntoView ({
          behavior: 'smooth',
          block: 'center'
        });
      }

      // Activar animación en los detalles del producto
      this.detailsInView = true;
    }, 100);
  }

  toggleWishlist() {
    this.wishlistActive = !this.wishlistActive;
  }

  addToBag() {
    console.log (`Added size ${this.selectedSize} to bag`);
    // Implementar lógica para agregar al carrito
  }
}
