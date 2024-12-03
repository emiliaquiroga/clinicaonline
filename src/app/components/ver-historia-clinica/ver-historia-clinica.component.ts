import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { HistoriaclinicaService } from '../../services/historiaclinica.service';
import { StorageService } from '../../services/storage.service';
import { DynamicPropertyPipe } from '../../pipes/dynamic-property.pipe';
import { CommonModule } from '@angular/common';


interface DatosDinamicos {
  [key: string]: any;
}

interface HistoriaClinica {
  especialistaDni: string;
  fecha: string;
  peso: number;
  altura: number;
  temperatura: number;
  presion: string;
  datosDinamicos: Array<{ clave: string, valor: any }>;
}
interface Usuario {
  type: 'especialista' | 'paciente' | 'admin';
  dni: string;
  name: string;
  lastname: string;
}


@Component({
  selector: 'app-ver-historia-clinica',
  standalone: true,
  imports: [RouterLink, DynamicPropertyPipe, CommonModule],
  templateUrl: './ver-historia-clinica.component.html',
  styleUrl: './ver-historia-clinica.component.css'
})
export class VerHistoriaClinicaComponent {
  email: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription = new Subscription();

  user: any;

  private subscriptions: Subscription[] = [];

  cerrandoSesion: boolean = false;

  pacienteDni!: any;

  historiaClinica: HistoriaClinica[] = [];

  usuarios: any[] = [];

  datosDinamicos: Array<{ clave: string, valor: any }> = [];

  constructor(private firestore: FirestoreService, private activatedRoute: ActivatedRoute, private auth:AuthService, private storage: StorageService, private router: Router, private hc: HistoriaclinicaService) {}

  ngOnInit() {
    this.pacienteDni = this.activatedRoute.snapshot.paramMap.get('paciente');

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

        this.storage.obtenerFotosDelUsuario(this.user.type, this.user.dni.toString()).then((data) => {
          this.user.foto1 = data[0].url;
        });

        if(this.user.type == "paciente") {
          if(this.user.dni != this.pacienteDni) {
            this.router.navigate(['perfil', this.user.dni]);
          }
        }
      })
    )

    this.subscriptions.push(
      this.firestore.traer(`historia_clinica/${this.pacienteDni}/datos`).subscribe((data) => {
        if(data != null && data != undefined) {
          this.historiaClinica = data;
          console.log("Historia Clínica completa:", JSON.stringify(this.historiaClinica, null, 2));
          
          // Verifica la estructura de datosDinamicos para cada item
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

  private findUsuario(dni: string, types: string[]): Usuario | undefined {
    return this.usuarios.find(
      (element) => types.includes(element.type) && element.dni === dni
    );
  }
  
  getNombreDelEspecialista(dni: string): string {
    const especialista = this.findUsuario(dni, ['especialista']);
    return especialista ? `${especialista.name} ${especialista.lastname}` : 'Especialista no encontrado';
  }
  
  getNombreDelPaciente(dni: string): string {
    const paciente = this.findUsuario(dni, ['paciente', 'admin']);
    return paciente ? `${paciente.name} ${paciente.lastname}` : 'Paciente o administrador no encontrado';
  }
  

  getObjectKeys(obj: DatosDinamicos): string[] {
    return obj ? Object.keys(obj) : [];
  }
  

  irAPerfil() {
    this.router.navigate(['perfil', this.user.dni]);
  }
  
  toggleCerrandoSesion() {
    this.cerrandoSesion = !this.cerrandoSesion;
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigateByUrl("login");
  }

  ver(item: any) {
    console.log('Datos dinámicos del item:',  item);
  }

}
