import { 
  Component
 } from '@angular/core';

import {
  CommonModule
 } from '@angular/common';  
import emailjs, {
   EmailJSResponseStatus 
  } from 'emailjs-com';

@Component({
  selector: 'app-contact',
  imports: [ CommonModule],
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent {
  public sendEmail(e: Event) {
    e.preventDefault();
    
    emailjs.sendForm(
      'service_l5nandf',     // Reemplaza con tu ID
      'template_z48exti',    // Reemplaza con tu ID
      e.target as HTMLFormElement,
      'v67k_12fRwSVLAQYJ'      // Reemplaza con tu Public Key
    )
    .then((result: EmailJSResponseStatus) => {
      alert('Mensaje enviado con éxito');
    }, (error) => {
      alert('Hubo un error: ' + JSON.stringify(error));
    });
  }
  
}
