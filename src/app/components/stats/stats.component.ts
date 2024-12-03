import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { FormsModule } from '@angular/forms';
import { ToolTipDirective } from '../../directivas/tool-tip.directive';
import { GetNombreDelEspecialistaPipe } from '../../pipes/get-nombre-del-especialista.pipe';
import { PrimeraLetraAMayusPipe } from '../../pipes/primera-letra-amayus.pipe';
import { TurnosFinalizadosMedicoComponent } from '../graficos/turnos-finalizados-medico/turnos-finalizados-medico.component';
import { TurnosPorDiaComponent } from '../graficos/turnos-por-dia/turnos-por-dia.component';
import { TurnosPorEspecialidadComponent } from '../graficos/turnos-por-especialidad/turnos-por-especialidad.component';
import { TurnosSolicitadosMedicoComponent } from '../graficos/turnos-solicitados-medico/turnos-solicitados-medico.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [FormsModule, RouterLink, PrimeraLetraAMayusPipe, TurnosPorEspecialidadComponent, TurnosPorDiaComponent, TurnosSolicitadosMedicoComponent, TurnosFinalizadosMedicoComponent, GetNombreDelEspecialistaPipe, ToolTipDirective ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  email: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();
  private subscriptions: Subscription[] = [];
  user: any;

  cerrandoSesion: boolean = false;

  usuarios: any[] = [];

  pantalla: string = "ingresos";

  todosLosTurnos: any[] = [];
  
  ingresoLogs: any[] = [];
  turnosPorEspecialidad: any[] = [];

  turnosPorDia: any[] = [];
  diaComienzo!: string;
  mesComienzo!: string;
  anioComienzo!: string;
  diaFinal!: string;
  mesFinal!: string;
  anioFinal!: string;
  verGrafico: boolean = false;

  turnosPorMedico: any[] = [];

  turnosFinalizadosPorMedico: any[] = [];

  constructor(private firestore: FirestoreService, private auth: AuthService, private router: Router, private storage: StorageService) {}

  traerIngresoLogs() {
    this.subscriptions.push(
      this.firestore.traer('ingresos').subscribe((data) => {
        this.ingresoLogs = data;
        this.ingresoLogs.sort((a, b) => {
          const dateTimeA = this.convertirAFechaYHoraComparable(a.fecha, a.hora);
          const dateTimeB = this.convertirAFechaYHoraComparable(b.fecha, b.hora);
          return dateTimeB - dateTimeA; // Orden descendente
        });
      })
    );
  }

  obtenerTurnosPorEspecialidad() {
    let contadorEspecialidades: any = {};

    // Recorremos los turnos y contamos por especialidad
    this.todosLosTurnos.forEach(turno => {
      if (contadorEspecialidades[turno.especialidad]) {
        contadorEspecialidades[turno.especialidad]++;
      } else {
        contadorEspecialidades[turno.especialidad] = 1;
      }
    });
  
    // Convertir el objeto contadorEspecialidades a un array para guardar en turnosPorEspecialidad
    this.turnosPorEspecialidad = Object.keys(contadorEspecialidades).map(especialidad => ({
      especialidad,
      cantidad: contadorEspecialidades[especialidad]
    }));

    console.log("TURNOS POR ESPECIALIDAD: ",this.turnosPorEspecialidad);
  }

  obtenerTurnosPorDia() {
    let contadorDias: any = {};
  
    // Recorremos los turnos y contamos por día
    this.todosLosTurnos.forEach(turno => {
      if (contadorDias[turno.dia]) {
        contadorDias[turno.dia]++;
      } else {
        contadorDias[turno.dia] = 1;
      }
    });
  
    // Convertir el objeto contadorDias a un array para guardar en turnosPorDia
    this.turnosPorDia = Object.keys(contadorDias).map(dia => ({
      dia,
      cantidad: contadorDias[dia]
    }));
  
    console.log("TURNOS POR DIA: ", this.turnosPorDia);
  }

  obtenerTurnosPorMedicoEnLapsoDeTiempo() {

    if(this.diaComienzo && this.mesComienzo && this.anioComienzo && this.diaFinal && this.mesFinal && this.anioFinal) {
      let fechaInicio = this.diaComienzo + "-" + this.mesComienzo + "-" + this.anioComienzo;
      let fechaFin = this.diaFinal + "-" + this.mesFinal + "-" + this.anioFinal;
  
      let contadorMedicos: any = {};
      
      // Convertir fechas de formato DD-MM-YYYY a objetos Date
      const [diaInicio, mesInicio, anioInicio] = fechaInicio.split('-').map(Number);
      const [diaFin, mesFin, anioFin] = fechaFin.split('-').map(Number);
      const inicio = new Date(anioInicio, mesInicio - 1, diaInicio).getTime();
      const fin = new Date(anioFin, mesFin - 1, diaFin).getTime();
    
      // Recorremos los turnos y contamos por médico dentro del rango de fechas
      this.todosLosTurnos.forEach(turno => {
        const [diaTurno, mesTurno, anioTurno] = turno.dia.split('/').map(Number);
        const fechaTurno = new Date(anioTurno, mesTurno - 1, diaTurno).getTime();
        
        if (fechaTurno >= inicio && fechaTurno <= fin) {
          if (contadorMedicos[turno.especialista]) {
            contadorMedicos[turno.especialista]++;
          } else {
            contadorMedicos[turno.especialista] = 1;
          }
        }
      });
    
      // Convertir el objeto contadorMedicos a un array para guardar en turnosPorMedico
      this.turnosPorMedico = Object.keys(contadorMedicos).map(especialista => ({
        especialista: this.getNombreDelEspecialista(especialista),
        cantidad: contadorMedicos[especialista]
      }));
    
      console.log("TURNOS POR MEDICO EN LAPSO DE TIEMPO: ", this.turnosPorMedico);
    } else {
      console.log("ENtro al else")
    }
  }

  obtenerTurnosFinalizadosPorMedicoEnLapsoDeTiempo() {
    if (this.diaComienzo && this.mesComienzo && this.anioComienzo && this.diaFinal && this.mesFinal && this.anioFinal) {
      let fechaInicio = this.diaComienzo + "-" + this.mesComienzo + "-" + this.anioComienzo;
      let fechaFin = this.diaFinal + "-" + this.mesFinal + "-" + this.anioFinal;
  
      let contadorMedicos: any = {};
  
      // Convertir fechas de formato DD-MM-YYYY a objetos Date
      const [diaInicio, mesInicio, anioInicio] = fechaInicio.split('-').map(Number);
      const [diaFin, mesFin, anioFin] = fechaFin.split('-').map(Number);
      const inicio = new Date(anioInicio, mesInicio - 1, diaInicio).getTime();
      const fin = new Date(anioFin, mesFin - 1, diaFin).getTime();
  
      // Recorremos los turnos y contamos los finalizados por médico dentro del rango de fechas
      this.todosLosTurnos.forEach(turno => {
        const [diaTurno, mesTurno, anioTurno] = turno.dia.split('/').map(Number);
        const fechaTurno = new Date(anioTurno, mesTurno - 1, diaTurno).getTime();
  
        if (fechaTurno >= inicio && fechaTurno <= fin && turno.estadoDelTurno === 'realizado') {
          if (contadorMedicos[turno.especialista]) {
            contadorMedicos[turno.especialista]++;
          } else {
            contadorMedicos[turno.especialista] = 1;
          }
        }
      });
  
      // Convertir el objeto contadorMedicos a un array para guardar en turnosFinalizadosPorMedico
      this.turnosFinalizadosPorMedico = Object.keys(contadorMedicos).map(especialista => ({
        especialista: this.getNombreDelEspecialista(especialista),
        cantidad: contadorMedicos[especialista]
      }));
  
      console.log("TURNOS FINALIZADOS POR MEDICO EN LAPSO DE TIEMPO: ", this.turnosFinalizadosPorMedico);
    }

  }

    // Función para exportar datos a Excel
    exportarDatosAExcel(data: any[], fileName: string): void {
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, fileName + '.xlsx');
    }
  
    // Ejemplo de uso: exportar los ingresoLogs a Excel
    exportarIngresoLogs(): void {
      this.exportarDatosAExcel(this.ingresoLogs, 'ingreso_logs');
    }
  
    // Ejemplo de uso: exportar los turnosPorEspecialidad a Excel
    exportarTurnosPorEspecialidad(): void {
      this.exportarDatosAExcel(this.turnosPorEspecialidad, 'turnos_por_especialidad');
    }
  
    // Ejemplo de uso: exportar los turnosPorDia a Excel
    exportarTurnosPorDia(): void {
      this.exportarDatosAExcel(this.turnosPorDia, 'turnos_por_dia');
    }
  
    // Ejemplo de uso: exportar los turnosPorMedico a Excel
    exportarTurnosPorMedico(): void {
      this.exportarDatosAExcel(this.turnosPorMedico, 'turnos_por_medico');
    }
  
    // Ejemplo de uso: exportar los turnosFinalizadosPorMedico a Excel
    exportarTurnosFinalizadosPorMedico(): void {
      this.exportarDatosAExcel(this.turnosFinalizadosPorMedico, 'turnos_finalizados_por_medico');
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

  ngOnInit(): void {
    this.subscriptions.push(
      this.auth.userActual$.subscribe(
        (user) => {
          this.isAuthenticated = !!user;
          this.email = user?.email || '';
        }
      )
    );

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

        this.storage.obtenerFotosDelUsuario(this.user.type, this.user.dni.toString()).then((data) => {
          this.user.foto1 = data[0].url;
        });
      })
    );

    this.subscriptions.push(
      this.firestore.traer('turnos').subscribe((data) => {
        this.todosLosTurnos = data;

        this.obtenerTurnosPorEspecialidad();
        this.obtenerTurnosPorDia();
      })
    )

    this.traerIngresoLogs();

  }

  convertirAFechaYHoraComparable(fecha: string, hora: string): number {
    const [day, month, year] = fecha.split('/');
    const [hours, minutes, seconds] = hora.split(':');
    return new Date(
      Number(year), 
      Number(month) - 1, 
      Number(day), 
      Number(hours), 
      Number(minutes),
      Number(seconds)
    ).getTime();
  }

  toggleCerrandoSesion() {
    this.cerrandoSesion = !this.cerrandoSesion;
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigateByUrl("login");
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
