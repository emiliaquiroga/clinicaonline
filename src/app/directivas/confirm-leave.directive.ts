import { Directive, HostListener } from '@angular/core';
import Swal from 'sweetalert2';

@Directive({
  selector: '[appConfirmLeave]',
  standalone: true
})
export class ConfirmLeaveDirective {
  @HostListener('click', ['$event'])

  confirmFirst(event: MouseEvent) {
    if (!confirm('¿Estás seguro de que deseas cerrar sesion?')) {
      event.preventDefault();
    }
  }
}
