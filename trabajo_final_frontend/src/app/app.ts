import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/layout/header/header';
import { Footer } from './components/layout/footer/footer';
import { LoginService } from './services/login';
import { RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule, Header, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [LoginService], //servicio de login
})
export class App {
  esFormulario = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.esFormulario = event.urlAfterRedirects.startsWith('/form');
      }
    });
  }
}
