import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/public/product-detail/product-detail';
import { ContactComponent } from './components/public/contact/contact';
import { Home } from './components/public/home/home';
import { Dashboard } from './admin/dashboard/dashboard';
import { AdminLayout } from './admin/layout/admin-layout/admin-layout';
import { Usuarios } from './admin/usuarios/usuarios';
import { Productos } from './admin/productos/productos';
import { Pedidos } from './admin/pedidos/pedidos';
import { Cupones } from './admin/cupones/cupones';
import { PublicLayout } from './components/layout/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'product', component: ProductDetailComponent },
      { path: 'contact', component: ContactComponent },
    ]
  },
  // Admin routes 
  {
    path: 'admin', component: AdminLayout,
    children: [
      { path: '', component: Dashboard },
      { path: 'users', component: Usuarios },
      { path: 'products', component: Productos },
      { path: 'orders', component: Pedidos },
      { path: 'coupons', component: Cupones }
    ]
  }
];
