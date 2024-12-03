import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userType: string = 'paciente';
  email: string = '';
  password: string = '';

  usuarios: any[] = [];
  observable: Subscription = new Subscription();
  userImages: { [dni: number]: string } = {};

  fastLoginUsers = [
    { email: 'maxiti2133@kimasoft.com', password: 'Harry123', dni: 1234566, tipo: "administradores"},
    { email: 'xogoce1075@kazvi.com', password: 'Nico123', dni: 45463436, tipo: "especialistas"},
    { email: 'lamal69711@kazvi.com', password: 'Felix123', dni:41876589, tipo: "especialistas"},
    { email: 'hiraciy342@kazvi.com', password: 'Ramen123', dni: 12345678, tipo: "pacientes"},
    { email: 'gecom40009@kimasoft.com', password: 'Louis123', dni:24121991, tipo: "pacientes" },
    { email: 'mewek78732@merotx.com', password: 'Niall123', dni: 13081995, tipo: "pacientes"},
  ];


  constructor(
    private auth: AuthService,
    private firestore: FirestoreService,
    private router: Router,
    private storageService: StorageService
  ) {}

  login() {
    this.auth.login(this.email, this.password)?.then(
      (data) => {
        if(data) {
          console.log(data);
          if(data != "noVerificado") {
            if(this.comprobarEspecialistaAceptado(this.email)) {
              this.router.navigateByUrl('home');

              this.guardarIngresoAlSistema();

              Swal.fire({
                title: 'Bienvenido!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: 'Tu cuenta se encuentra en proceso de verificación.',
                text: "Un administrador debe aprobar tu cuenta antes de que puedas ingresar.",
                icon: 'warning',
                heightAuto: false,
              });
            }
          } else {
            Swal.fire({
              title: 'Error de verificación',
              text: "Debes verificar tu email antes de poder ingresar a tu cuenta.",
              icon: 'error',
              heightAuto: false,
            });
          }
        } else {
          throw new Error('Usuario no encontrado.');
        }
      })
      .catch((err) => {
        let mensaje: string;

        console.log(err);
        switch (err.code) {
          case 'auth/invalid-email':
            mensaje = 'Correo inválido.';
            break;
          case 'auth/user-disabled':
            mensaje = 'Este usuario ha sido deshabilitado.';
            break;
          case 'auth/user-not-found':
            mensaje = 'No se encontró ningún usuario con este correo.';
            break;
          case 'auth/wrong-password':
            mensaje = 'Contraseña incorrecta.';
            break;
          case 'auth/invalid-credential':
            mensaje = 'Credenciales de autenticación inválidas.';
            break;
          case 'auth/too-many-requests':
            mensaje = 'Demasiados intentos, intente nuevamente más tarde.';
            break;
          default:
            mensaje =
              err + ' Por favor, inténtalo de nuevo.';
        }

        Swal.fire({
          title: 'Error',
          text: mensaje,
          icon: 'error',
          heightAuto: false,
        });
      });
  }

  fastLogin(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  comprobarEspecialistaAceptado(emailIngresado: string) {
    let aceptado = false;

    for (let i = 0; i < this.usuarios.length; i++) {
      if(this.usuarios[i].email == emailIngresado) {
        if(this.usuarios[i].type == 'especialista') {
          if(this.usuarios[i].aceptadoPorAdmin) {
            aceptado = true;
            break;
          }
        } else {
          aceptado = true;
          break;
        }
      }
    }

    return aceptado;
  }

  guardarIngresoAlSistema() {
    let usuario: any;

    for (let i = 0; i < this.usuarios.length; i++) {
      if (this.usuarios[i].email === this.email) {
        usuario = this.usuarios[i];
        break;
      }
    }

    const date = new Date();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const fechaFormateada = `${day}/${month}/${year}`;
    const horaFormateada = `${hours}:${minutes}:${seconds}`;

    let obj = {
      nombre: usuario.name + " " + usuario.lastname,
      dni: usuario.dni,
      type: usuario.type,
      mail: usuario.email,
      fecha: fechaFormateada,
      hora: horaFormateada,
    }

    this.firestore.guardar('ingresos', obj).then(() => {
      console.log("Log de ingreso guardado correctamente.");
    }).catch(() => {
      console.log("ERROR guardando el log de ingreso.");
    });
  }

  async ngOnInit() {
    this.observable = this.firestore.traer("usuarios").subscribe((usuariosData: any) => {
      this.usuarios = usuariosData;
    });

    for (const user of this.fastLoginUsers) {
      try {
        const fotos = await this.storageService.obtenerFotosDelUsuario(user.tipo, user.dni.toString());
        const foto1 = fotos.find(f => f.url.includes('foto1')); // Buscar la foto llamada 'foto1'
        this.userImages[user.dni] = foto1 ? foto1.url : '/src/assets/users/especialista.png'; // Asignar imagen predeterminada si no existe foto1
      } catch (error) {
        console.error(`Error al obtener las fotos para el usuario con DNI ${user.dni}:`, error);
        this.userImages[user.dni] = '/src/assets/users/especialista.png'; // Imagen predeterminada en caso de error
      }
    }
  }


}
