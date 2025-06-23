import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/public/product-detail/product-detail';
import { ContactComponent } from './components/public/contact/contact';
import { Home } from './components/public/home/home';

export const routes: Routes = [
  {path: '', component: Home},
  { path: 'product', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
];
