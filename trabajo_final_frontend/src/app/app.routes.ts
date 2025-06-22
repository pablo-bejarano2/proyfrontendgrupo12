import { Routes } from '@angular/router';
import { Home } from './components/public/home/home';
import { Formulario } from './components/formulario/formulario';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'form', component: Formulario },
  { path: '**', pathMatch: 'full', redirectTo: 'home' },
];
