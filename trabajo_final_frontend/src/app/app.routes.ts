import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/public/product-detail/product-detail';
import { ContactComponent } from './components/public/contact/contact';

export const routes: Routes = [
  { path: 'product', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
];
