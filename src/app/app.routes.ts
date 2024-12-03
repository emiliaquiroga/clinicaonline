import { animation } from '@angular/animations';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "bienvenida",
        loadComponent: () => import('./components/bienvenida/bienvenida.component').then(
            (m) => m.BienvenidaComponent,
        ),
        data: { animation: 'fade' }
    },
    {
        path: "login",
        loadComponent: () => import('./components/login/login.component').then(
            (m) => m.LoginComponent,
        ),
        data: {animation: 'slideInReverse'}
    },
    {
        path: "registro",
        loadComponent: () => import('./components/registro/registro.component').then(
            (m) => m.RegistroComponent,
        ),
        data: { animation: 'slide' }
    },
    {
        path: "usuarios",
        loadComponent: () => import('./components/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent,
        ),
        data: { animation: 'slideIn' }
    },
    {
        path: "home",
        loadComponent: () => import('./components/home/home.component').then(
            (m) => m.HomeComponent,
        ),
        data: { animation: 'slideInReverse' }
    },
    {
        path: "perfil/:dni",
        loadComponent: () => import('./components/perfil/perfil.component').then(
            (m) => m.PerfilComponent,
        ),
        data: { animation: 'fade' }
    },
    {
        path: "agregar_hc/:paciente/:especialista/:fecha",
        loadComponent: () => import('./components/agregar-historia-clinica/agregar-historia-clinica.component').then(
            (m) => m.AgregarHistoriaClinicaComponent,
        ),
        data: { animation: 'rotate' }
    },
    {
        path: "ver_hc/:paciente",
        loadComponent: () => import('./components/ver-historia-clinica/ver-historia-clinica.component').then(
            (m) => m.VerHistoriaClinicaComponent,
        ),
        data: { animation: 'slideIn' }
    },
    {
        path: "stats",
        loadComponent: () => import('./components/stats/stats.component').then(
            (m) => m.StatsComponent,
        ),
        data: { animation: 'zoom' }
    },

    {
        path: "",
        redirectTo: "bienvenida",
        pathMatch: "full",
    }
];
