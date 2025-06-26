import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
  providers: [LoginService], //servicio de login

})
export class PublicLayout {
  esFormulario = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.esFormulario = event.urlAfterRedirects.startsWith('/form');
      }
    });
  }
}
