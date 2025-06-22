import { FormControl, ValidationErrors } from '@angular/forms';

export class MisValidadores {
  static validarPrimerLetra(c: FormControl): ValidationErrors | null {
    let nombre: string = String(c.value);

    if (nombre == null) {
      return null;
    }

    if (nombre.charAt(0) != nombre.charAt(0).toUpperCase()) {
      return { sinPrimerLetraMayuscula: true };
    }

    return null;
  }

  static validarPassword(c: FormControl): ValidationErrors | null {
    let password: string = String(c.value);

    if (!password) {
      return null;
    }

    //Verificar los errores del password
    const errores: ValidationErrors = {
      ...(!/[A-Z]/.test(password) && { sinMayuscula: true }),
      ...(!/[a-z]/.test(password) && { sinMinuscula: true }),
      ...(!/[0-9]/.test(password) && { sinNumero: true }),
      ...(!/[^A-Za-z0-9]/.test(password) && { sinEspecial: true }),
    };

    //Si hay errores los devuelve, sino devuelve null
    return Object.keys(errores).length ? errores : null;
  }
}
