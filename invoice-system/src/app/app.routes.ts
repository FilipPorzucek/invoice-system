import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './layout/employee-layout/employee-layout.component';
import { InvoiceUploadComponent } from './features/invoice-upload/invoice-upload.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthComponent } from './features/auth/auth.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { AccountantLayoutComponent } from './layout/accountant-layout/accountant-layout.component';
import { AccountantInvoiceViewComponent } from './features/accountant-invoice-view/accountant-invoice-view.component';
import { EmployeeInvoiceViewComponent } from './features/employee-invoice-view/employee-invoice-view.component';
import { ManagerLayoutComponent } from './layout/manager-layout/manager-layout.component';
import { ManagerInvoiceViewComponent } from './features/manager-invoice-view/manager-invoice-view.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/employee-dashboard/employee-dashboard.component').then(c => c.EmployeeDashboardComponent) },
      { path: 'invoice-upload', component: InvoiceUploadComponent },
      { path: 'invoice/:id', component: EmployeeInvoiceViewComponent }
    ]
  },

  {
    path: 'accountant',
    component: AccountantLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', loadComponent: () => import('./features/accountant-dasboard/accountant-dasboard.component').then(c => c.AccountantDasboardComponent) },
      { path: 'invoice/:id', component: AccountantInvoiceViewComponent }
    ]
  },

  {
    path: 'manager',
    canActivate: [authGuard],
    component: ManagerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/manager-dashboard/manager-dashboard.component').then(c => c.ManagerDashboardComponent) },
      { path: 'invoice/:id', component: ManagerInvoiceViewComponent }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent) },
      { path: 'users/create', loadComponent: () => import('./features/admin-user-create/admin-user-create.component').then(c => c.AdminUserCreateComponent) }
    ]
  },
  

  { path: '**', redirectTo: 'login' }
];