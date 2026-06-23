import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EmployeeDashboardComponent } from './pages/employee-dashboard/employee-dashboard.component';
import { ManagerDashboardComponent } from './pages/manager-dashboard/manager-dashboard.component';
import { DemandeFormComponent } from './pages/demande-form/demande-form.component';
import { MesDemandesComponent } from './pages/mes-demandes/mes-demandes.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PointageComponent } from './pages/pointage/pointage.component';
import { SalaireComponent } from './pages/salaire/salaire.component';
import { DashboardRhComponent } from './pages/dashboard-rh/dashboard-rh.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'employee',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard-rh',
    component: DashboardRhComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'MANAGER' },
  },
  {
    path: 'salaire',
    component: SalaireComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'pointage',
    component: PointageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'manager',
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'MANAGER' },
  },
  {
    path: 'demande-form',
    component: DemandeFormComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'mes-demandes',
    component: MesDemandesComponent,
    canActivate: [AuthGuard],
  },
  // Ajouter à la fin du tableau routes
  { path: '**', redirectTo: '/login' },
];
