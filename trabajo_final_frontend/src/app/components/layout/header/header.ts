import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  emailGoogle: string = '';
  imagenGoogle: string = '';
  nombreGoogle: string = '';

  constructor(public loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.emailGoogle = sessionStorage.getItem('emailGoogle') || '';
    this.imagenGoogle = sessionStorage.getItem('imagenGoogle') || '';
    this.nombreGoogle = sessionStorage.getItem('userGoogle') || '';
  }

  logout() {
    console.log('Antes de logout: ' + sessionStorage.getItem('userGoogle'));
    if (this.userGoogleLogged()) {
      sessionStorage.clear();
    }
    this.loginService.logout();
    this.router.navigate(['/home']);
    console.log('Después de logout: ' + sessionStorage.getItem('userGoogle'));
  }

  userGoogleLogged(): boolean {
    console.log('User logged: ' + !!sessionStorage.getItem('emailGoogle'));
    return !!sessionStorage.getItem('userGoogle');
  }
}
