import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { key } from '../../../key';
import { GoogleGeminiProService } from './google-gemini-pro.service';

@Component({
  selector: 'app-gemini',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './gemini-ia.component.html',
  styleUrl: './gemini-ia.component.css'
})

export class GeminiIAComponent {
  title = 'ng-gemini-test';
  @ViewChild('scrollframe') scrollframe?: ElementRef;
  scroll() {
    const maxScroll = this.scrollframe?.nativeElement.scrollHeight;
    this.scrollframe?.nativeElement.scrollTo({ top: maxScroll, behavior: 'smooth' });
  }

  result = '';
  prompt = '';
  writing = false;

  questions: Array<{ prompt: string; result: string }> = [];

  constructor(private googleGeminiPro: GoogleGeminiProService) {
    this.googleGeminiPro.initialize(key);
  }

  async generate() {
    if (!this.prompt.trim()) return; // Evitar enviar si el campo está vacío
    this.writing = true; // Activar el estado de escritura
    const result = await this.googleGeminiPro.generateText(this.prompt);
    this.questions.push({ prompt: this.prompt, result: '' });
    this.write(result, 0);
    this.prompt = ''; // Limpiar el campo de entrada aquí también
  }

  write(result: string, index: number) {
    this.questions[this.questions.length - 1].result = result.slice(0, index);
    
    // Mientras haya texto que seguir mostrando, sigue escribiendo
    if (index < result.length) {
      setTimeout(() => {
        this.scroll();
        this.write(result, index + 1);
      }, this.randomVelocity());
    } else {
      // Cuando se termina de escribir la respuesta, deja de estar "escribiendo"
      this.writing = false; 
      // Asegúrate de limpiar el prompt si es necesario
      this.prompt = '';
    }
}


  randomVelocity(): number {
    const velocity = Math.floor(Math.random() * 25 + 1);
    return velocity;
  }
}