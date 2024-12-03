import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  name: string = '';
  lastname: string = '';
  edad!: number;
  dni!: number;
  
  especialidad: string[] = [];
  obrasocial: string = '';
  email: string = '';
  password: string = '';
  otraEspecialidad: string = '';
  foto1: any = null;
  foto2: any = null;
  especialidadElegida: string[] = [];
  nombreFoto1: string = '';
  nombreFoto2: string = '';

  userType: string = '';

  usuario: any;

  todosLosCamposCompletos: boolean = false;

  spinner: boolean = false;

  random1!: number;
  ranodm2!: number;
  resultado!: number;
  captchaCorrecto: boolean = false;
  mensaje: string = "Resuelve el siguente ejercicio para demostrar que eres humano:";

  constructor( private auth: AuthService, private router: Router, private firestore: FirestoreService, private storage: StorageService ) {}

  agregarEspecialidad(especialidad:string):void{
    if(especialidad && !this.especialidad.includes(especialidad)){
      this.especialidad.push(especialidad);
    }
  }
  register() {
    this.spinner = true;

    if(this.userType == 'especialista') {
    } else {
      if(this.name != '' && this.lastname != '' && this.edad && this.dni && this.email != '' && this.password != '' && this.foto1 && this.foto2 && this.obrasocial != ''){
        this.todosLosCamposCompletos = true;

        this.usuario = {
          type: this.userType,
          name: this.name,
          lastname: this.lastname,
          edad: this.edad,
          dni: this.dni,
          email: this.email,
          obrasocial: this.obrasocial,
          foto1: "",
          foto2: "",
        }

        this.storage.subirFoto(this.foto1, 'pacientes', this.dni, this.nombreFoto1);
        this.storage.subirFoto(this.foto2, 'pacientes', this.dni, this.nombreFoto2);
      }
    }

    if(this.todosLosCamposCompletos) {
      if(this.captchaCorrecto) {
        this.auth.register(this.email, this.password)?.then(
          (data) => {
            this.firestore.guardar("usuarios", this.usuario).then(() => {
              this.name = '';
              this.lastname = '';
              this.edad = 0;
              this.dni = 0;
              this.especialidad = [];
              this.obrasocial = '';
              this.email = '';
              this.password = '';
              this.otraEspecialidad = '';
              this.foto1 = null;
              this.foto2 = null;
              this.especialidadElegida = [];
              this.nombreFoto1 = '';
              this.nombreFoto2 = '';
            });
          }
        ).catch(
          (err) => {
            this.spinner = false;
            let mensaje;
    
            console.log(err);
            switch(err.code)
            {
              case 'auth/email-already-in-use':
                mensaje = 'El correo electrónico ya está registrado.';
                break;
              case 'auth/invalid-email':
                mensaje = 'El correo electrónico no es válido.';
                break;
              case 'auth/weak-password':
                mensaje = 'La contraseña es demasiado débil.';
                break;
              case 'auth/operation-not-allowed':
                mensaje = 'Esta operación no está permitida.';
                break;
              case 'auth/too-many-requests':
                mensaje = 'Demasiados intentos, intente nuevamente más tarde.';
                break;
              default:
                mensaje = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
            }
    
            Swal.fire({
              title: "Error",
              text: mensaje,
              icon: "error",
              heightAuto: false,
            });
          }
        );
      } else {
        Swal.fire({
          title: "Error",
          text: "Debes completar el CAPTCHA antes de registrarte.",
          icon: "error",
          heightAuto: false,
        });
      }
    } else {
      Swal.fire({
        title: "Error",
        text: "Por favor, complete todos los campos.",
        icon: "error",
        heightAuto: false,
      });
    }
    this.spinner = false;
  } 

  onFileSelected(event: any, nombreFoto: string) {
    let archivoSeleccionado: File = event.target.files[0];
    if(nombreFoto == 'foto1') {
      this.foto1 = archivoSeleccionado;
      this.nombreFoto1 = nombreFoto;
    } else {
      this.foto2 = archivoSeleccionado;
      this.nombreFoto2 = nombreFoto;
    } 
  }

  captchaEnviado() {
    if(this.random1 + this.ranodm2 == this.resultado) {
      this.captchaCorrecto = true;
    } else {
      this.mensaje = "ERROR!";
      this.resultado = 0;
      setTimeout(() => {
        this.mensaje = "Resuelve el siguente ejercicio para demostrar que eres humano:";
        this.obtenerRandoms();
      }, 3000);
    }
  }

  obtenerRandoms() {
    this.random1 = Math.floor(Math.random() * 10) + 1;
    this.ranodm2 = Math.floor(Math.random() * 10) + 1;
  }

  ngOnInit() {
    this.userType = '';
    this.obtenerRandoms();
  }
}
