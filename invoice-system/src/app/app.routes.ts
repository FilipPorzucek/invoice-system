import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './layout/employee-layout/employee-layout.component';
import { InvoiceUploadComponent } from './features/invoice-upload/invoice-upload.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthComponent } from './features/auth/auth.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    component: AuthComponent, 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/employee-dashboard/employee-dashboard.component').then(c => c.EmployeeDashboardComponent) },
      { path: 'invoice-upload', component: InvoiceUploadComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];