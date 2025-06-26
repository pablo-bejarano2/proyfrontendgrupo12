import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';
import { Formulario } from './components/public/formulario/formulario';
import { CuentaUsuario } from './components/public/cuenta-usuario/cuenta-usuario';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'form', component: Formulario },
  { path: 'cuenta', component: CuentaUsuario },
  { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
