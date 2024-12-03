import { Component, NgModule, OnInit } from '@angular/core';
import { Subscription, pipe, take } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {
  dni!: any;
  email: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();

  private subscriptions: Subscription[] = [];

  user: any;

  cerrandoSesion: boolean = false;

  usuarios: any[] = [];
  historiaClinica: any[] = [];

  especialidades: string[] = [];
  especialidadElegida: string = "";

  private clinicLogo = '/assets/clinica.png';

  constructor( private auth: AuthService, private firestore: FirestoreService, private router: Router, private activatedRoute: ActivatedRoute, private storage: StorageService ) {}

  irAHistoriaClinico() {
    this.router.navigate(['ver_hc', this.user.dni]);
  }

  generatePDF() {
    const doc = new jsPDF();
  
    // Agregar logo
    const logo = new Image();
    logo.src = this.clinicLogo;
  
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 10, 25, 25);
    }
  
    // Título e información de la historia clínica
    doc.setFontSize(18);
    doc.text('Historia Clínica', 50, 18);
    doc.setFontSize(12);
    doc.text(`Paciente: ${this.getNombreDelPaciente(this.user.dni)}`, 50, 25);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 50, 32);
  
    // Inicializar la posición Y
    let yPos = 50;

    // Agregar datos de la historia clínica
    this.historiaClinica.forEach((item, index) => {      
      doc.setFontSize(14);
      doc.text(`Registro ${this.historiaClinica.length - index}`, 10, yPos);
      yPos += 10;
  
      doc.setFontSize(12);
      doc.text(`Especialista: ${this.getNombreDelEspecialista(item.especialistaDni)}`, 10, yPos);
      yPos += 7;
      doc.text(`Fecha: ${item.fecha}`, 10, yPos);
      yPos += 7;
      doc.text(`Peso: ${item.peso}`, 10, yPos);
      yPos += 7;
      doc.text(`Altura: ${item.altura}`, 10, yPos);
      yPos += 7;
      doc.text(`Temperatura: ${item.temperatura}`, 10, yPos);
      yPos += 7;
      doc.text(`Presión: ${item.presion}`, 10, yPos);
      yPos += 10;
  
      if (item.datosDinamicos && Object.keys(item.datosDinamicos).length > 0) {
        Object.entries(item.datosDinamicos).forEach(([clave, valor]) => {
          doc.text(`${clave}: ${valor}`, 10, yPos);
          yPos += 7;
        });
      }

      doc.line(10, yPos, 200, yPos);
      yPos += 10; 
  
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  
    let nombreArchivo = "Historia_Clinica_" + this.dni + ".pdf" 
    doc.save(nombreArchivo);
  }

  downloadUserPDF(especialidad: string) {
    let turnosDelUsuario: any[] = [];

    this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
      data.forEach(element => {
        if(element.paciente == this.user.dni) {
          turnosDelUsuario.push(element);
        }
      })


      const doc = new jsPDF();
    

      doc.setFontSize(16);
      doc.text('Datos del Paciente', 20, 20);
      doc.setFontSize(12);
      let yPos = 40;
      const lineHeight = 10;
    
      doc.text(`Nombre: ${this.user.name}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Apellido: ${this.user.lastname}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Edad: ${this.user.edad}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`DNI: ${this.user.dni}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Email: ${this.user.email}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Obra Social: ${this.user.obrasocial || 'No especificada'}`, 20, yPos);
      yPos += lineHeight * 2;

      doc.setFontSize(14);
      doc.text('Turnos del Paciente', 20, yPos);
      yPos += lineHeight * 1.5;

      if (turnosDelUsuario.length > 0) {
        turnosDelUsuario.forEach((turno, index) => {
          if(turno.estadoDelTurno == "realizado" && turno.especialidad.toLowerCase() == especialidad.toLowerCase()) {
            doc.setFontSize(12);
            doc.text(`Fecha: ${turno.dia}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Hora: ${turno.hora}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Especialidad: ${especialidad}`, 20, yPos);
            yPos += lineHeight;
            doc.text(`Especialista: ${this.getNombreDelEspecialista(turno.especialista)}`, 20, yPos);
            yPos += lineHeight;

            doc.line(20, yPos, 190, yPos);
            yPos += lineHeight;

            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No hay turnos registrados para este usuario en la especialidad elegida.', 20, yPos);
      }
    

      doc.save(`paciente_${this.user.dni}_turnos_${especialidad}.pdf`);
    })
  }

  ngOnInit() {
    let todosLosTurnos: any;

    this.dni = this.activatedRoute.snapshot.paramMap.get('dni');

    this.userSubscription = this.auth.userActual$.subscribe(
      (user) => {
        this.isAuthenticated = !!user;
        this.email = user?.email || '';
      }
    );

    this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
      todosLosTurnos = data;
    })

    this.subscriptions.push(
      this.firestore.traer('usuarios').subscribe((data) => {
        this.usuarios = data;
        let usuarios = data;
  
        for (let i = 0; i < usuarios.length; i++) {
          if (usuarios[i].email === this.email) {
            this.user = usuarios[i];
            break;
          }
        }

        if(this.user.dni != this.dni) {
          this.router.navigate(['perfil', this.user.dni]);
        }

        this.storage.obtenerFotosDelUsuario(this.user.type, this.user.dni.toString()).then((data) => {
          this.user.foto1 = data[0].url;
        });

        todosLosTurnos.forEach((element: any) => {
          if(element.paciente == this.user.dni && element.estadoDelTurno == 'realizado') {
            if(!this.especialidades.includes(element.especialidad)) {
              this.especialidades.push(element.especialidad);
            }
          }
        })

        console.log("ESPECIALIDABDABD", this.especialidades)
      })
    );

    this.subscriptions.push(
      this.firestore.traer(`historia_clinica/${this.dni}/datos`).subscribe((data) => {
        if(data != null && data != undefined) {
          this.historiaClinica = data;
          this.historiaClinica.forEach((item, index) => {
            console.log(`Datos dinámicos del item ${index}:`, item.datosDinamicos);
          });
        } else {
          console.log("DATA DE HISTORIA CLINICA = NULL");
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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

  getNombreDelPaciente(dni: string) {
    let nombre = '';
    this.usuarios.forEach(element => {
      if((element.type == 'paciente' || element.type == 'admin') && element.dni == dni) {
        nombre = element.name + " " + element.lastname;
      }
    })

    return nombre;
  }

  toggleCerrandoSesion() {
    this.cerrandoSesion = !this.cerrandoSesion;
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigateByUrl("login");
  }
}
