import { Routes } from '@angular/router';

import { Home } from './components/public/home/home';
import { Formulario } from './components/public/formulario/formulario';
import { CuentaUsuario } from './components/public/cuenta-usuario/cuenta-usuario';
import { ProductDetailComponent } from './components/public/product-detail/product-detail';
import { ContactComponent } from './components/public/contact/contact';
import { PolicyComponent } from './components/public/policy/policy';
import { Dashboard } from './admin/dashboard/dashboard';
import { AdminLayout } from './admin/layout/admin-layout/admin-layout';
import { Usuarios } from './admin/usuarios/usuarios';
import { Productos } from './admin/productos/productos';
import { Pedidos } from './admin/pedidos/pedidos';
import { Cupones } from './admin/cupones/cupones';
import { PublicLayout } from './components/layout/public-layout/public-layout';
import { ProductList } from './components/public/product-list/product-list';
import { ErrorPage } from './components/public/error-page/error-page';
import {
  CheckoutComponent
} from '@/app/components/public/checkout/checkout';


export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: 'checkout', component: CheckoutComponent },
      { path: 'products', component: ProductList },
      { path: 'products/:categoryName', component: ProductList },
      { path: 'product-detail/:id', component: ProductDetailComponent },
      { path: '', component: Home },
      { path: 'product/:id', component: ProductDetailComponent },
      {
        path: 'product-detail',
        component: ProductDetailComponent
      },

      { path: 'contact', component: ContactComponent },
      { path: 'policy', component: PolicyComponent },
      { path: 'product-list', component: ProductList },
      { path: 'products/:categoryName', component: ProductList },
      { path: 'home', component: Home },
      { path: 'form', component: Formulario },
      { path: 'cuenta', component: CuentaUsuario },
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
  },
  {
    path: '**', component: ErrorPage
  }
];
