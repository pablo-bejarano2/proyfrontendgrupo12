import {
  FormControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

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

  static validarEmail(c: FormControl): ValidationErrors | null {
    let email: string = String(c.value);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email) ? null : { emailInvalido: true };
  }

  // Ejemplo de validador
  static passwordsIguales(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}
