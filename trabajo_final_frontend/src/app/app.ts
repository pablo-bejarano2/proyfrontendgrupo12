import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login';
import { RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule, CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [LoginService], //servicio de login
})
export class App {

}
