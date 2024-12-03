import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription, take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit{
  email: any = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();

  usuarios: any[] = [];
  observable: Subscription = new Subscription();
  usuariosPaciente: any[] = [];
  usuariosEspecialista: any[] = [];

  fotosPaciente: any[] = [];
  fotosEspecialista: any[] = [];

  verUsuariosTipo: string = 'paciente';

  agregandoUsuario: boolean = false;

  name: string = '';
  lastname: string = '';
  edad!: number;
  dni!: number;
  especialidad: string = '';
  obrasocial: string = '';
  emailAAgregar: string = '';
  password: string = '';
  otraEspecialidad: string = '';
  foto1: any = null;
  foto2: any = null;
  especialidadElegida: string = '';
  nombreFoto1: string = '';
  nombreFoto2: string = '';
  userType: string = 'paciente';
  usuario: any;
  todosLosCamposCompletos: boolean = false;
  
  constructor( private router: Router, private auth: AuthService, private firestore: FirestoreService, private storage: StorageService ) {}

  manejarAccionesEspecialista(especialista: any){
    especialista.aceptadoPorAdmin = !especialista.aceptadoPorAdmin;
    this.firestore.actualizar("usuarios", especialista);
  }

  ver() {
    console.log("aaaaaa")
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

  trackByFn(index: number, item: any): any {
    return item.id || index; 
  }

  register() {
    this.agregandoUsuario = true;

    if(this.userType == 'especialista') {
      if(this.name != '' && this.lastname != '' && this.edad && this.dni && this.email != '' && this.password != '' && this.foto1 && this.especialidad != '' || (this.especialidad == 'otra' && this.otraEspecialidad != '')){
        this.todosLosCamposCompletos = true;
        this.especialidad == "otra" ? this.especialidadElegida = this.otraEspecialidad : this.especialidadElegida = this.especialidad,

        this.usuario = {
          type: this.userType,
          name: this.name,
          lastname: this.lastname,
          edad: this.edad,
          dni: this.dni,
          email: this.email,
          especialidad: this.especialidadElegida,
          aceptadoPorAdmin: false,
        }

        this.storage.subirFoto(this.foto1, 'especialistas', this.dni, this.nombreFoto1);
      }
    } else if(this.userType == 'paciente') {
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
        }

        this.storage.subirFoto(this.foto1, 'pacientes', this.dni, this.nombreFoto1);
        this.storage.subirFoto(this.foto2, 'pacientes', this.dni, this.nombreFoto2);
      }
    } else {
      if(this.name != '' && this.lastname != '' && this.edad && this.dni && this.email != '' && this.password != '' && this.foto1){
        this.todosLosCamposCompletos = true;

        this.usuario = {
          type: this.userType,
          name: this.name,
          lastname: this.lastname,
          edad: this.edad,
          dni: this.dni,
          email: this.email,
        }

        this.storage.subirFoto(this.foto1, 'administradores', this.dni, this.nombreFoto1);
      }
    }

    if(this.todosLosCamposCompletos) {
      this.auth.register(this.email, this.password)?.then(
        (data) => {
          this.firestore.guardar("usuarios", this.usuario).then(() => {
            this.name = '';
            this.lastname = '';
            this.edad = 0;
            this.dni = 0;
            this.especialidad = '';
            this.obrasocial = '';
            this.email = '';
            this.password = '';
            this.otraEspecialidad = '';
            this.foto1 = null;
            this.foto2 = null;
            this.especialidadElegida = '';
            this.nombreFoto1 = '';
            this.nombreFoto2 = '';
          });
        }
      ).catch(
        (err) => {
          this.agregandoUsuario = false;
          let mensaje;
  
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
        text: "Por favor, complete todos los campos.",
        icon: "error",
        heightAuto: false,
      });
    }
    this.agregandoUsuario = false;
  } 

  irAHistoriaClinico(dni: string) {
    this.router.navigate(['ver_hc', dni]);
  }

  downloadUsersExcel(): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.usuarios.map(user => ({
      Tipo: user.type,
      Nombre: user.name,
      Apellido: user.lastname,
      Edad: user.edad,
      DNI: user.dni,
      Email: user.email,
      'Obra Social': user.obrasocial || 'No aplica',
      Especialidad: user.especialidad || 'No aplica',
      'Aceptado por Admin': user.aceptadoPorAdmin !== undefined ? (user.aceptadoPorAdmin ? 'Sí' : 'No') : 'No aplica'
    })));
  
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
  
    // Generar el archivo Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Descargar el archivo
    const fileName: string = 'usuarios.xlsx';
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  }

  downloadUserPDF(usuario: any) {
    let turnosDelUsuario: any[] = [];

    this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
      data.forEach(element => {
        if(element.paciente == usuario.dni) {
          turnosDelUsuario.push(element);
        }
      })

      console.log("TURNOS DEL USUARIO: ", turnosDelUsuario);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Datos del Usuario', 20, 20);
    

      doc.setFontSize(12);
      let yPos = 40;
      const lineHeight = 10;
    
      doc.text(`Nombre: ${usuario.name}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Apellido: ${usuario.lastname}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Edad: ${usuario.edad}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`DNI: ${usuario.dni}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Email: ${usuario.email}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Obra Social: ${usuario.obrasocial || 'No especificada'}`, 20, yPos);
      yPos += lineHeight * 2;

      doc.setFontSize(14);
      doc.text('Turnos del Usuario', 20, yPos);
      yPos += lineHeight * 1.5;

      if (turnosDelUsuario.length > 0) {
        turnosDelUsuario.forEach((turno, index) => {
          if(turno.estadoDelTurno == "realizado") {
            doc.setFontSize(12);
            doc.text(`Fecha: ${turno.dia}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Hora: ${turno.hora}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Especialista: ${this.getNombreDelEspecialista(turno.especialista)}`, 20, yPos);
            yPos += lineHeight;
  
            doc.line(20, yPos, 190, yPos);


            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No hay turnos registrados para este usuario.', 20, yPos);
      }
    

      doc.save(`usuario_${usuario.dni}.pdf`);
    })
  }

  ngOnInit() {
    // Traer info usuario actual
    this.userSubscription = this.auth.userActual$.subscribe(
      (user) => {
        this.isAuthenticated = !!user;
        this.email = user?.email || '';
      }
    );

    // Firestore traer info usuarios 
    this.observable = this.firestore.traer("usuarios").subscribe((usuariosData: any) => {
      this.usuariosPaciente = [];
      this.usuariosEspecialista = [];
      this.usuarios = [];

      this.usuarios = usuariosData;
      let permitido = false;

      this.usuarios.forEach(element => {
        if(element.email == this.email && element.type == 'admin'){
          permitido = true;
        } 

        if(element.type == 'paciente' && !this.usuariosPaciente.some(paciente => paciente.id === element.id)){
          this.storage.obtenerFotosDelUsuario('pacientes', element.dni.toString()).then((data) => {
            element.foto1 = data[0].url;
            // element.foto2 = data[1].url;
            if(!this.usuariosPaciente.includes(element)) {
              this.usuariosPaciente.push(element);
            }
          }) .catch((err) => {
            console.log("HUBO UN ERROR");
          }) 
        } else if(element.type == 'especialista' && !this.usuariosEspecialista.some(especialista => especialista.id === element.id)){
          this.storage.obtenerFotosDelUsuario('especialistas', element.dni.toString()).then((data) => {
            element.foto1 = data[0].url;
            if(!this.usuariosEspecialista.includes(element)) {
              this.usuariosEspecialista.push(element);
            }
          })  
        }
      });

      if(!permitido){
        this.router.navigateByUrl("home");
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.observable.unsubscribe();
  }

  getNombreDelEspecialista(dni: string): string {
    let nombre = '';
    this.usuarios.forEach(element => {
      if(element.type == 'especialista' && element.dni == dni) {
        nombre = element.name + " " + element.lastname;
      }
    })

    return nombre;
  }
}
