import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta según tu proyecto

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(@Inject(AuthService) private auth: AuthService, private router: Router) {}

canActivate(): boolean {
  const role = this.auth.userRole();
  if (!this.auth.isLoggedIn() || role !== 'administrador') {
    this.router.navigate(['/**']);
    return false;
  }
  return true;
}
}