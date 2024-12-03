import { Component, OnDestroy, OnInit, NgModule } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom, take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { TurnosService } from '../../services/turnos.service';
import { NgModel, FormsModule } from '@angular/forms';
import { ConfirmLeaveDirective } from '../../directivas/confirm-leave.directive';
import { CopiarAlPortapapelesDirective } from '../../directivas/copiar-al-portapapeles.directive';
import { ToolTipDirective } from '../../directivas/tool-tip.directive';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ConfirmLeaveDirective, CopiarAlPortapapelesDirective, ToolTipDirective, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy{
  email: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();

  user: any;

  usuarios: any[] = [];
  observable: Subscription = new Subscription();

  private subscriptions: Subscription[] = [];

  pantalla: string = 'misturnos';

  especialidades: string[] = [];
  especialistas: any[] = [];
  especialidadElegida: string = '';
  especialistaElegido: any = null;

  turnosOcupados: any[] = [];
  turnosDisponibles: any[] = [];

  diasDisponibles: any[] = [];
  horariosDisponibles: any[] = [];

  diaElegidoTurno: any = null;
  horarioElegidoTurno: any = null;

  todosLosTurnos: any[] = [];
  turnosDelPaciente: any[] = [];
  turnosDelEspecialista: any[] = [];

  cerrandoSesion: boolean = false;

  textoBuscado: string = '';
  debeMostrar!: boolean;

  cancelandoTurno: boolean = false;
  razonDeCancelacion: string = '';
  turnoACancelar: any;

  calificandoTurno: boolean = false;
  calificacion: number = -1;
  resenaDelPaciente: string = '';
  turnoACalificar: any;

  rechazandoTurno: boolean = false;
  turnoARechazar: any;
  razonDeRechazo: string = "";

  aceptandoTurno: boolean = false;

  finalizandoTurno: boolean = false;
  turnoAFinalizar: any;
  resenaDelEspecialista: string = '';

  pacienteViendoResena: boolean = false;
  turnoAVerResena: any;

  especialistaViendoResena: boolean = false;

  especialistaViendoCancelacion: boolean = false;
  turnoAVerCancelacion: any;

  pacienteViendoEncuesta: boolean = false;

  pacienteViendoMotivoRechazo: boolean = false;
  turnoAVerRechazo: any;

  pacienteViendoMotivoCancelacion: boolean = false;

  spinner: boolean = false;

  pacientesDelEspecialista: any[] = [];

  pacientes: any[] = [];
  turnosPorPaciente: { [dni: string]: any[] } = {};
  diasYHorariosDisponibles: any[] = [];
  diasYHorarios: any[] = [];




  constructor(private router: Router, private auth: AuthService, private firestore: FirestoreService, private storage: StorageService, private turnos: TurnosService) {}

  getImageUrl(img: string) {
    return "assets/especialidades/" + img + ".png";
  } 

  getEspecialistasDeUnaEspecialidad(especialidad: string) {
    let especialistas: any[] = [];

    this.usuarios.forEach(element => {
      if(element.type == 'especialista' && element.especialidad.toLowerCase() == especialidad.toLowerCase()) {
        especialistas.push(element);
      }
    })

    return especialistas;
  }

  getPacientesDeUnEspecialista(especialista: string) {
    let pacientes: any[] = [];

    this.todosLosTurnos.forEach(element => {
      let pacienteDelTurno;

      for(let i=0; i<this.usuarios.length; i++) {
        if((this.usuarios[i].type == "paciente" || this.usuarios[i].type == "admin") && this.usuarios[i].dni == element.paciente) {
          pacienteDelTurno = this.usuarios[i];
          break;
        }
      }

      if(pacienteDelTurno) {
        if(element.especialista == especialista && !pacientes.includes(pacienteDelTurno)) {
          pacientes.push(pacienteDelTurno);
        }
      }
    })

    return pacientes;
  }

  onOptionChange(event: any) {
    this.especialistaElegido = event.target.value;
    this.diaElegidoTurno = null;
    this.horarioElegidoTurno = null;
    this.diasDisponibles = this.getProximos15Dias();
  }

  getProximos15Dias(): string[] {
    const dias = [];
    const hoy = new Date();
    let contadorDias = 0;  // Contador para los días hábiles

    for (let i = 0; contadorDias < 15; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);

      // Si el día no es domingo (0 es domingo)
      if (dia.getDay() !== 0) {
        const dd = String(dia.getDate()).padStart(2, '0');
        const mm = String(dia.getMonth() + 1).padStart(2, '0'); // Enero es 0!
        const yyyy = dia.getFullYear();

        const fechaFormateada = `${dd}/${mm}/${yyyy}`;
        dias.push(fechaFormateada);
        contadorDias++;  // Solo incrementar el contador si es un día hábil
      }
    }

    return dias;
}

  getHorariosDisponibles(dia: Date): string[] {
  const horarios: string[] = [];
  const diaSemana = dia.getDay();
  let horaInicio: number, horaFin: number;

  // Lunes a viernes
  if (diaSemana >= 0 && diaSemana <= 4) {
    horaInicio = 8;
    horaFin = 19;
  }
  // Sábados
  else if (diaSemana === 5) {
    horaInicio = 8;
    horaFin = 14;
  }
  // Domingos no disponibles
  else {
    return horarios;
  }

  for (let hora = horaInicio; hora < horaFin; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    horarios.push(`${hora.toString().padStart(2, '0')}:30`);
  }

  return horarios;
}

  getDiasYHorariosDisponibles(): any[] {
    const diasYHorarios: any[] = [];
    const hoy = new Date();
    let contadorDias = 0; // Contador para los días hábiles

    for (let i = 0; contadorDias < 15; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);

      // Si el día no es domingo (0 es domingo)
      if (dia.getDay() !== 0) {
        const dd = String(dia.getDate()).padStart(2, '0');
        const mm = String(dia.getMonth() + 1).padStart(2, '0'); // Enero es 0!
        const yyyy = dia.getFullYear();
        const fechaFormateada = `${dd}/${mm}/${yyyy}`;
        
        const horarios = this.getHorariosDisponibles(dia); // Obtener horarios disponibles para el día
        diasYHorarios.push({ fecha: fechaFormateada, horarios });
        contadorDias++; // Solo incrementar el contador si es un día hábil
      }
    }

    return diasYHorarios;
  }


  async getTurnosDeUnDia(dniEspecialista: string, dia: string): Promise<any> {
    let turnos: any[] = [];
    const data = await firstValueFrom(this.firestore.traer(`turnos`));
    data.forEach(element => {
      if (element.especialista == dniEspecialista && element.dia == dia) {
        turnos.push(element);
      }
    });
    return turnos;
  }

  manejarClickDiaDeTurno(dniEspecialista: string, dia: any) {
    this.turnosOcupados = [];
    this.horarioElegidoTurno = null;
    let turnosDelDia: any[] = []

    this.diaElegidoTurno = dia;

    //LOGICA PARA TRAER TURNOS DE UN DIA
    this.firestore.traer(`turnos`).subscribe((data) => {

      //CORREJIR QUE COMPARE NO SOLO X DIA SINO TAMBIEN X ESPECIALISTA

      data.forEach(element => {
        if(element.dia == dia && element.especialista == dniEspecialista) {
          turnosDelDia.push(element)
        }
      })

      if(turnosDelDia != undefined) {
        turnosDelDia.forEach(element => {
          if(element.especialista == dniEspecialista && element.dia == this.diaElegidoTurno) {
            if(element.estadoDelTurno != 'cancelado' && element.estadoDelTurno != 'rechazado') {
              this.turnosOcupados.push(element.hora)
            }
          }
        })
      }
      const [dd, mm, yyyy] = dia.split('/');
      const diaDate = new Date(`${yyyy}-${mm}-${dd}`); // Convertir a objeto Date
      this.horariosDisponibles = this.getHorariosDisponibles(diaDate);
    })
  }

  mostrarConfirmacionTurno: boolean = false;

  manejarClickTurno(fecha: string, horario: string): void {
    this.diaElegidoTurno = fecha;
    this.horarioElegidoTurno = horario;
    this.mostrarConfirmacionTurno = true;
    this.scrollToElement('confirmarturno'); 
  }
  
  guardarUnTurno() {
    this.turnos.guardarTurno(this.especialidadElegida, this.especialistaElegido.dni, this.user.dni, this.diaElegidoTurno, this.horarioElegidoTurno);

    Swal.fire({
      title: "Turno Agendado",
      text: `Tu turno del dia ${this.diaElegidoTurno} a las ${this.horarioElegidoTurno} se ha agendado exitosamente. Te esperamos`,
      icon: "success",
      timer: 4000,
      showConfirmButton: false,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });

    this.especialidadElegida = '';
    this.horarioElegidoTurno = '';
    this.diaElegidoTurno = '';
    this.pantalla = "misturnos";
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

  getEspecialidadDeUnEspecialista(dni: string): string[] {
    let especialidades: string[] = [];

    this.usuarios.forEach(element => {
      if (element.type == 'especialista' && element.dni == dni) {
        if (Array.isArray(element.especialidad)) {
          especialidades = [...especialidades, ...element.especialidad];
        } else {
          especialidades.push(element.especialidad);
        }
      }
    });

    return especialidades;
  }

  scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  turnoYaPaso(turno: any): boolean {
    // Dividir la fecha y la hora en componentes individuales
    const [dd, mm, yyyy] = turno.dia.split('/');
    const [hh, min] = turno.hora.split(':');
  
    // Crear un objeto Date con los componentes de la fecha y hora dados
    const givenDateTime = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  
    // Obtener la fecha y hora actuales
    const now = new Date();
  
    // Comparar las dos fechas
    const yaPaso = givenDateTime < now;

    if(yaPaso && turno.estadoDelTurno == "") {
      turno.estadoDelTurno = 'caducado';
      this.firestore.actualizar('turnos', turno);
    }

    return yaPaso;
  }

  clickCancelarButton(turno: any) {
    this.turnoACancelar = turno;
    this.cancelandoTurno = true;
  }

  pacienteCancelaTurno(confirma: boolean) {
    this.cancelandoTurno = false;
  
    if (confirma) {
      this.spinner = true;
      try { 
        this.turnosDelPaciente.forEach(element => {
          if (element.dia == this.turnoACancelar.dia && element.hora == this.turnoACancelar.hora && element.especialista == this.turnoACancelar.especialista) {
            element.estadoDelTurno = 'cancelado';
            element.razonCancelacion = this.razonDeCancelacion;
    
            this.firestore.actualizar('turnos', element).then(() => {
              console.log("Se ha CANCELADO correctamente.");
            }).catch((err) => {
              console.log("ERROR cancelando.", err);
            }).finally(() => {
              this.spinner = false;
            });
          }
        });
      } catch (error) {
        console.error('Error cancelando el turno: ', error);
      }
    } else {
      this.razonDeCancelacion = '';
      this.turnoACancelar = null;
    }
  }
  
  async especialistaCancelaTurno(confirma: boolean) {
    this.cancelandoTurno = false;
  
    if (confirma) {
      try { 
        this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
          data.forEach(element => {
            if (element.dia == this.turnoACancelar.dia && element.hora == this.turnoACancelar.hora && element.paciente == this.turnoACancelar.paciente) {
              element.estadoDelTurno = 'cancelado';
              element.razonCancelacion = this.razonDeCancelacion;
      
              this.firestore.actualizar('turnos', element);
            }
          });
        });
      } catch (error) {
        console.error('Error cancelando el turno: ', error);
      }
    } else {
      this.razonDeCancelacion = '';
      this.turnoACancelar = null;
    }
  }

  clickCalificarButton(turno: any) {
    this.turnoACalificar = turno;
    this.calificandoTurno = true;
  }

  pacienteCalificaTurno(puntuacion: number) {
    this.calificandoTurno = false;
  
    this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
      data.forEach(element => {
        if (element.dia == this.turnoACalificar.dia && element.hora == this.turnoACalificar.hora && element.especialista == this.turnoACalificar.especialista) {
          alert("HOLA")
          element.calificacion = puntuacion;
          element.resenaDelPaciente = this.resenaDelPaciente;
  
          this.firestore.actualizar('turnos', element).then(() => {
            this.resenaDelPaciente = '';
          });
        }
      });
    });
  }

  clickRechazarButton(turno: any) {
    this.turnoARechazar = turno;
    this.rechazandoTurno = true;
  }

  especialistaRechazaTurno(confirma: boolean) {
    this.rechazandoTurno = false;
  
    if (confirma) {
      try { 
        this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
          data.forEach(element => {
            if (element.dia == this.turnoARechazar.dia && element.hora == this.turnoARechazar.hora && element.paciente == this.turnoARechazar.paciente) {
              element.estadoDelTurno = 'rechazado';
      
              this.firestore.actualizar('turnos', element);
            }
          });
        });
      } catch (error) {
        console.error('Error cancelando el turno: ', error);
      }
    } else {
      this.razonDeCancelacion = '';
      this.turnoARechazar = null;
    }
  }

  especialistaAceptaTurno(turno: any) {
    turno.estadoDelTurno = 'aceptado';
    this.firestore.actualizar('turnos', turno);
  }

  clickRealizadoButton(turno: any) {
    this.finalizandoTurno = true;
    this.turnoAFinalizar = turno;
  }

  especialistaFinalizaTurno(confirma: boolean) {
    this.finalizandoTurno = false;
  
    if (confirma) {
      try { 
        this.firestore.traer('turnos').pipe(take(1)).subscribe((data) => {
          data.forEach(element => {
            if (element.dia == this.turnoAFinalizar.dia && element.hora == this.turnoAFinalizar.hora && element.paciente == this.turnoAFinalizar.paciente) {
              element.estadoDelTurno = 'realizado';
              element.resenaDelEspecialista = this.resenaDelEspecialista;
      
              this.firestore.actualizar('turnos', element).then(() => {
                this.resenaDelEspecialista = '';

                let dia = element.dia.split("/")[0];
                let mes = element.dia.split("/")[1];
                let anio = element.dia.split("/")[2];
                let fecha = dia + "_" + mes + "_" + anio
                
                this.router.navigate(['agregar_hc', element.paciente, element.especialista, fecha]);
              });
            }
          });
        });
      } catch (error) {
        console.error('Error cancelando el turno: ', error);
      }
    } else {
      this.resenaDelEspecialista = '';
      this.turnoAFinalizar = null;
    }
  }

  pacienteVerResena(turno: any) {
    this.pacienteViendoResena = true;
    this.turnoAVerResena = turno;
  }

  especialistaVerResena(turno: any) {
    this.especialistaViendoResena = true;
    this.turnoAVerResena = turno;
  }

  especialistaVerMotivoCancelacion(turno: any) {
    this.turnoAVerCancelacion = null;
    this.especialistaViendoCancelacion = true;
    this.turnoAVerCancelacion = turno;
  }

  pacienteVerMotivoRechazo(turno: any) {
    this.pacienteViendoMotivoRechazo = true;
    this.turnoAVerRechazo = turno;
  }

  pacienteVerMotivoCancelacion(turno: any) {
    console.log(turno.razonCancelacion)
    this.pacienteViendoMotivoCancelacion = true;
    this.turnoAVerCancelacion = turno;
  }

  cargarPacientes() {
    this.pacientesDelEspecialista.forEach(paciente => {
      this.cargarUltimosTurnos(paciente.dni);
    });
  }

  cargarEspecialistas(): void {
    this.firestore.traer('usuarios', 'name', 'asc').subscribe({
      next: (data) => {
        // Filtrar solo los usuarios que sean especialistas y que estén aceptados por el admin
        this.especialistas = data.filter(usuario => 
          usuario.type === 'especialista' && usuario.aceptadoPorAdmin
        );
        console.log('Especialistas cargados:', this.especialistas);
      },
      error: (err) => {
        console.error('Error al cargar especialistas:', err);
      }
    });
  }
  
  seleccionarEspecialista(especialista: any): void {
    this.especialistaElegido = especialista;
  }

  cargarUltimosTurnos(dniPaciente: string) {
    this.turnosPorPaciente[dniPaciente] = []; // Inicializar el array vacío
  
    this.getUltimos3Turnos(dniPaciente).then(turnos => {
      this.turnosPorPaciente[dniPaciente] = turnos;
    }).catch(error => {
      console.error('Error al cargar los turnos:', error);
      this.turnosPorPaciente[dniPaciente] = []; // En caso de error, asegúrate de que haya un array vacío
    });
  }

  getUltimos3Turnos(dniPaciente: string): Promise<any[]> {
    return firstValueFrom(this.firestore.traer(`turnos`)).then((data) => {
      const turnosDelPaciente: any[] = [];

      data.forEach(turno => {
        if (turno.paciente === dniPaciente && turno.estadoDelTurno == "realizado") {
          turnosDelPaciente.push(turno);
        }
      });

      turnosDelPaciente.sort((a, b) => {
        const [diaA, mesA, anioA] = a.dia.split('/');
        const [horaA, minA] = a.hora.split(':');
        const fechaHoraA = new Date(Number(anioA), Number(mesA) - 1, Number(diaA), Number(horaA), Number(minA));

        const [diaB, mesB, anioB] = b.dia.split('/');
        const [horaB, minB] = b.hora.split(':');
        const fechaHoraB = new Date(Number(anioB), Number(mesB) - 1, Number(diaB), Number(horaB), Number(minB));

        return fechaHoraB.getTime() - fechaHoraA.getTime();
      });

      console.log("turnos del paciente ", turnosDelPaciente)
      return turnosDelPaciente.slice(0, 3);
    });
  }


  irAHistoriaClinico(dni: string) {
    this.router.navigate(['ver_hc', dni]);
  }

  irAPerfil() {
    this.router.navigate(['perfil', this.user.dni]);
  }

  ver(texto: string) {
    console.log(texto);
  }

  volver(): void {
    if (this.especialidadElegida) {
      this.especialidadElegida = '';
    } else if (this.especialistaElegido) {
      this.especialistaElegido = null;
    } 
  }

  ngOnInit(): void {
    this.especialidadElegida = '';
    this.especialistaElegido = null;
    this.diaElegidoTurno = null;
    this.horarioElegidoTurno = null;
    this.cargarEspecialistas();
    this.diasYHorarios = this.getDiasYHorariosDisponibles();

    this.subscriptions.push(
      this.auth.userActual$.subscribe(
        (user) => {
          this.isAuthenticated = !!user;
          this.email = user?.email || '';
        }
      )
    );

    this.subscriptions.push(
      this.firestore.traer("usuarios").subscribe((usuariosData: any) => {
        this.usuarios = [];
        this.usuarios = usuariosData;

        for (let i = 0; i < this.usuarios.length; i++) {
          if (this.usuarios[i].email === this.email) {
            this.user = this.usuarios[i];
            break;
          }
        }
        

        this.storage.obtenerFotosDelUsuario(this.user.type, this.user.dni.toString()).then((data) => {
          this.user.foto1 = data[0].url;
        });

        this.usuarios.forEach(elemento => {
          if (elemento.type == 'especialista') {
            if (!this.especialidades.includes(elemento.especialidad)) {
              this.especialidades.push(elemento.especialidad);
            }
          }

          this.storage.obtenerFotosDelUsuario(elemento.type, elemento.dni.toString()).then((data) => {
            elemento.foto1 = data[0].url;
          })


          
        });
      })
    );

    this.subscriptions.push(
      this.firestore.traer('turnos').subscribe((turnosData) => {
          this.todosLosTurnos = [];
          this.turnosDelPaciente = [];
          this.turnosDelEspecialista = [];
          this.pacientesDelEspecialista = [];

          this.todosLosTurnos = turnosData;

          this.todosLosTurnos.forEach(element => {
            if(this.user.type == 'paciente' || this.user.type == "admin") {
              if(element.paciente == this.user.dni) {
                this.turnosDelPaciente.push(element);
              }
            } else {
              if(element.especialista == this.user.dni) {
                this.turnosDelEspecialista.push(element);
              }
            }
          });

          if(this.user.type == "especialista") {
            this.pacientesDelEspecialista = this.getPacientesDeUnEspecialista(this.user.dni);
          }

          this.cargarPacientes()
      })
    )

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleCerrandoSesion() {
    this.cerrandoSesion = !this.cerrandoSesion;
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigateByUrl("login");
  }
}
