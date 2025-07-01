import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  //Este service intercepta llamadas HTTP y
  //agrega a la petición información del token de sesión almacenado en sessionStorage
  constructor(private loginService: LoginService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('TOKEN: ' + this.loginService.getToken());
    const tokenizeReq = req.clone({
      setHeaders: {
        //Con esto estamos agregando la cabecera “Authorization” a todas las
        //peticiones que salgan desde el cliente
        Authorization: `Bearer ${this.loginService.getToken()}`,
      },
    });
    //Envía la nueva petición al servidor con el token ya incluido
    return next.handle(tokenizeReq);
  }
}
