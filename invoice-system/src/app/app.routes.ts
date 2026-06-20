import { Routes } from '@angular/router';
import { EmployeeLayoutComponent } from './layout/employee-layout/employee-layout.component';
import { InvoiceUploadComponent } from './features/invoice-upload/invoice-upload.component';

export const routes: Routes = [
{
    path: 'employee',
    component: EmployeeLayoutComponent, 
    children: [
        {
            path: 'dashboard', 
            loadComponent: () => import('./features/employee-dashboard/employee-dashboard.component')
                                    .then(c => c.EmployeeDashboardComponent) 
        },
        {
    path:"invoice-upload",
    component:InvoiceUploadComponent
        }
    ]
    
},
];
