import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class HistoriaclinicaService {

  constructor(private firestore: FirestoreService) { }

  
  guardarHistoriaClinica(paciente: string, especialista: string, fecha: string, altura: number, peso: number, temperatura: number, presion: string, datosDinamicos: Array<{ clave: string, valor: any }>) {
    const datosDinamicosObj = datosDinamicos.reduce((acc:any, dato) => {
      acc[dato.clave] = dato.valor;
      console.log("ACC: ", acc);
      return acc;
    }, {});

    let obj = {
      especialistaDni: especialista,
      fecha: fecha,
      altura: altura,
      peso: peso,
      temperatura: temperatura,
      presion: presion,
      datosDinamicos: datosDinamicosObj,
    }
    
    return this.firestore.guardar(`historia_clinica/${paciente}/datos`, obj); 
  }
}
