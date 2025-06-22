import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../../services/login';
import { ImplicitReceiver } from '@angular/compiler';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  constructor(public loginService: LoginService) {}

  ngOnInit(): void {}

  logout() {
    this.loginService.logout();
  }
}
