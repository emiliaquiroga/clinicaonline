import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css'
})
export class BienvenidaComponent {
  menuAbierto: boolean = false;

  abrirCerrarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
