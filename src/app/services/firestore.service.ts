import { Injectable } from '@angular/core';
import { Firestore, OrderByDirection, addDoc, collection, collectionData, deleteDoc, doc, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor( private firestore: Firestore ) { }

  guardar(col: string, obj: any) {
    let coleccion = collection(this.firestore, col);
    return addDoc(coleccion, obj);
  }

  traer(col: string, fieldToOrder?: string, direction: string = "asc", conditions: any[] = []): Observable<any[]> {
    let coleccion = collection(this.firestore, col);
    let q;

    if (fieldToOrder) {
      if (direction === "asc") {
        q = query(coleccion, ...conditions, orderBy(fieldToOrder, "asc"));
      } else {
        q = query(coleccion, ...conditions, orderBy(fieldToOrder, "desc"));
      }
    } else {
      q = query(coleccion, ...conditions);
    }

    return collectionData(q, { idField: "id" }) as Observable<any[]>;
  }

  async actualizar(col: string, obj: any) {
    let docRef = doc(this.firestore, col, obj.id);

    try {
      await updateDoc(docRef, obj);
      return "Actualizado correctamente.";
    } catch (error) {
      return error;
    }
  }

  async eliminar(col:string, id:string) {
    let docRef = doc(this.firestore, col, id);

    try {
      await deleteDoc(docRef);
      return "Eliminado correctamente."
    } catch (error) {
      return error;
    }
  }
  
}
