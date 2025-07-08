import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AuthService {

    getToken(): string | null{
        return sessionStorage.getItem('token');
    }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

userRole(): string {
  const token = this.getToken();
  if (!token) {
    return '';
  }
  const payload = token.split('.')[1];
  try {
    const decoded = JSON.parse(atob(payload));
    return decoded.rol || '';
  } catch (e) {
    return '';
  }
}
}