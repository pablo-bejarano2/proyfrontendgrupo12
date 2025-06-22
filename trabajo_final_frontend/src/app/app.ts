import { Component } from '@angular/core';
import { Header } from './components/layout/header/header';
import { Home } from './components/public/home/home';
import { Footer } from './components/layout/footer/footer';
import {
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, Home, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'trabajo_final_frontend';
}
