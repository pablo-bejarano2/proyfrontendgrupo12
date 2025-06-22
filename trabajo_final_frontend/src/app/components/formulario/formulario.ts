import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario implements OnInit {
  accion: string = 'login';
  mostrarPassword: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  cambiarAccion(nuevaAccion: string) {
    this.accion = nuevaAccion;
    console.log(this.accion);
  }

  irHome() {
    console.log('Redirigiendo al inicio...');
    this.router.navigate(['/home']);
  }

  cambioPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}
