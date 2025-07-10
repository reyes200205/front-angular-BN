import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { GuestGuard } from './core/guards/guest.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { authenticatedComponent } from './pages/layout/authenticated/authenticated.component';
import { HomeComponent } from './dashboard/home/home.component';
import { SalaEsperaComponent } from './dashboard/sala-espera/sala-espera.component';
import { PartidaComponent } from './dashboard/partida/partida.component';
import { PartidasIndexComponent } from './dashboard/partidas-index/partidas-index.component';
import { MisPartidasComponent } from './dashboard/mis-partidas/mis-partidas.component';
import { DetallePartidaComponent } from './dashboard/detalle-partida/detalle-partida.component';
import { EstadisticasComponent } from './dashboard/estadisticas/estadisticas.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  
  {
    path: 'app', 
    component: authenticatedComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'sala-espera/:id',
        component: SalaEsperaComponent
      },
      {
        path: 'juego/:id',
        component: PartidaComponent
      },
      {
        path: 'partidas',
        component: PartidasIndexComponent
      },
      {
        path: 'mis-partidas',
        component: MisPartidasComponent
      },
      {
        path: 'partidas/:id',
        component: DetallePartidaComponent
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./dashboard/estadisticas/estadisticas.component').then(
            (m) => m.EstadisticasComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  },
];
