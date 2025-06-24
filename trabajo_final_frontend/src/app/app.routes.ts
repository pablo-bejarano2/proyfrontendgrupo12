import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/public/product-detail/product-detail';
import { ContactComponent } from './components/public/contact/contact';
import { Home } from './components/public/home/home';
import { ProductList} from './components/public/product-list/product-list';

export const routes: Routes = [
  {path: '', component: Home},
  { path: 'product/:name', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'products', component: ProductList },
  { path: 'products/:categoryName', component: ProductList },
];
