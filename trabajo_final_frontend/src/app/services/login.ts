import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  hostBase: string;

  httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private _http: HttpClient) {
    this.hostBase = 'http://localhost:3000/api/usuario/';
  }

  //Login Normal
  public login(username: string, password: string): Observable<any> {
    let body = JSON.stringify({ username: username, password: password });
    return this._http.post(this.hostBase + 'login', body, this.httpOption);
  }

  //Login con Google
  public loginGoogle(token: string): Observable<any> {
    return this._http.post<any>(this.hostBase + 'login/google', { token });
  }

  //Crear cuenta de usuario
  public createCount(newUser: Usuario): Observable<any> {
    let body = JSON.stringify({
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
      nombres: newUser.nombres,
      apellido: newUser.apellido,
      rol: newUser.rol,
    });
    return this._http.post(this.hostBase, body, this.httpOption);
  }

  //Actualizar cuenta de usuario
  public updateCount(updatedUser: Usuario): Observable<any> {
    let body = JSON.stringify({
      username: updatedUser.username,
      nombres: updatedUser.nombres,
      apellido: updatedUser.apellido,
    });
    return this._http.put(
      this.hostBase + updatedUser._id,
      body,
      this.httpOption
    );
  }

  public getUsers(): Observable<any> {
    return this._http.get<any>(this.hostBase);
  }

  public getUserById(id: string): Observable<any> {
    return this._http.get<any>(this.hostBase + id);
  }

  public getUsersByUsername(username: string): Observable<any> {
    return this._http.get<any>(this.hostBase + 'filtrado/' + username);
  }

  public deleteUser(id: string): Observable<any> {
    return this._http.delete<any>(this.hostBase + id);
  }

  public getToken(): string | null {
    let token = sessionStorage.getItem('token');
    if (token) {
      return token;
    }

    return null;
  }
}
