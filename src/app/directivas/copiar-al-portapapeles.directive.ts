import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import Swal from 'sweetalert2';

@Directive({
  selector: '[appCopiarAlPortapapeles]',
  standalone: true
})
export class CopiarAlPortapapelesDirective {
  @Input('appCopiarAlPortapapeles') text: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('click') onClick() {
    const textArea = document.createElement('textarea');
    textArea.value = this.text || this.el.nativeElement.innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    Swal.fire({
      text: "Copiado al portapapeles.",
      timer: 1000,
    });
  }
}
