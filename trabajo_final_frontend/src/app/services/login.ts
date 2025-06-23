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

  public login(username: string, password: string): Observable<any> {
    let body = JSON.stringify({ username: username, password: password });
    console.log(body);
    return this._http.post(this.hostBase + 'login', body, this.httpOption);
  }

  public loginGoogle(token: string): Observable<any> {
    return this._http.post<any>(this.hostBase + 'login/google', { token });
  }

  public createCount(newUser: Usuario): Observable<any> {
    let body = JSON.stringify({
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
      nombres: newUser.nombres,
      apellido: newUser.apellido,
      rol: newUser.rol,
    });
    console.log(body);
    return this._http.post(this.hostBase, body, this.httpOption);
  }

  public logout() {
    //borrar las variables almacenadas mediante el storage
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('rol');
    sessionStorage.removeItem('usuarioId');
  }

  public usuarioLoggedIn() {
    var resultado = false;
    var usuario = sessionStorage.getItem('usuario');
    if (usuario != null) {
      resultado = true;
    }
    return resultado;
  }

  public usuarioLogged() {
    var usuario = sessionStorage.getItem('usuario');
    return usuario;
  }

  public idLogged() {
    var id = sessionStorage.getItem('usuarioId');
    return id;
  }
}
