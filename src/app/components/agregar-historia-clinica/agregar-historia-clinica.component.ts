import { Component } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { HistoriaclinicaService } from '../../services/historiaclinica.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-historia-clinica',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './agregar-historia-clinica.component.html',
  styleUrl: './agregar-historia-clinica.component.css'
})
export class AgregarHistoriaClinicaComponent {
  email: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();

  user: any;

  private subscriptions: Subscription[] = [];

  cerrandoSesion: boolean = false;

  pacienteDni!: any;
  especialistaDni!: any;
  fecha!: any;

  fechaFormateada!: string;

  usuarios: any[] = [];

  historiaClinica: any[] = [];

  altura!: number;
  temperatura!: number;
  peso!: number;
  presion!: string;
  key1: string = "";
  valor1: string = "";
  key2: string = "";
  valor2: string = "";
  key3: string = "";
  valor3: string = "";

  constructor(private firestore: FirestoreService, private activatedRoute: ActivatedRoute, private auth:AuthService, private router: Router, private hc: HistoriaclinicaService) {}

  agregarAHistoriaClinica() {
    let datosDinamicos: Array<{ clave: string, valor: any }> = [];

    if(this.key3 != "" && this.valor3 != "") {
      datosDinamicos.push({ clave: this.key1, valor: this.valor1 });
      datosDinamicos.push({ clave: this.key2, valor: this.valor2 });
      datosDinamicos.push({ clave: this.key3, valor: this.valor3 });
    } else if(this.key2 != "" && this.valor2 != "") {
      datosDinamicos.push({ clave: this.key1, valor: this.valor1 });
      datosDinamicos.push({ clave: this.key2, valor: this.valor2 });
    } else if(this.key1 != "" && this.valor1 != "") {
      datosDinamicos.push({ clave: this.key1, valor: this.valor1 });
    }

    console.log("ARRAY DINAMICO: ", datosDinamicos);

    if(this.altura, this.peso, this.temperatura, this.presion) {
      this.hc.guardarHistoriaClinica(this.pacienteDni, this.especialistaDni, this.fechaFormateada, this.altura, this.peso, this.temperatura, this.presion, datosDinamicos).then(() => {
        Swal.fire({
          title: 'Guardado con exito!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigateByUrl("home");
        });
      });
    }
  }

  ngOnInit() {
    this.pacienteDni = this.activatedRoute.snapshot.paramMap.get('paciente');
    this.especialistaDni = this.activatedRoute.snapshot.paramMap.get('especialista');
    this.fecha = this.activatedRoute.snapshot.paramMap.get('fecha');

    let dia = this.fecha.split("_")[0];
    let mes = this.fecha.split("_")[1];
    let anio = this.fecha.split("_")[2];
    this.fechaFormateada = dia + "/" + mes + "/" + anio;
    console.log("fecha:", this.fechaFormateada)

    this.userSubscription = this.auth.userActual$.subscribe(
      (user) => {
        this.isAuthenticated = !!user;
        this.email = user?.email || '';
      }
    );

    this.subscriptions.push(
      this.firestore.traer('usuarios').subscribe((data) => {
        this.usuarios = data;
  
        for (let i = 0; i < this.usuarios.length; i++) {
          if (this.usuarios[i].email === this.email) {
            this.user = this.usuarios[i];
            break;
          }
        }
      })
    )
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
