import { Pipe, PipeTransform } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { take } from 'rxjs';

@Pipe({
  name: 'getNombreDelEspecialista',
  standalone: true
})
export class GetNombreDelEspecialistaPipe implements PipeTransform {
  usuarios: any[] = [];

  constructor(private firestore: FirestoreService) {}

  transform(dni: string): string {
    let nombre = '';
    this.usuarios.forEach(element => {
      if (element.type == 'especialista' && element.dni == dni) {
        nombre = element.name + " " + element.lastname;
      }
    });

    return nombre;
  }

  ngOnInit(): void {
    this.firestore.traer('usuarios').pipe(take(1)).subscribe((data:any) => {
      this.usuarios = data;
    })
  }

}
