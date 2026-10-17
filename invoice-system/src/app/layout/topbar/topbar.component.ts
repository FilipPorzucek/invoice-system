import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DialogModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  dialogVisible = false;

  getUserDisplayName(): string {
    if (this.isLoggedIn()) {
      const user = this.getUser();
      return user?.name ? `${user.name} (${user.role})` : 'Zalogowany użytkownik'; 
    }
    return 'Gość';
  }

  openDialog() {
    this.dialogVisible = true;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  getUser() {
    return this.authService.getUser();
  }

  logout() {
    this.authService.logout();
    this.dialogVisible = false;
    this.router.navigate(['/login']);
  }

  navigateToLogin() {
    this.dialogVisible = false;
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.dialogVisible = false;
    this.router.navigate(['/register']);
  }

  getInitials(): string {
    const user = this.getUser();
    const first = user?.firstName?.charAt(0) ?? user?.name?.charAt(0) ?? '';
    const last = user?.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  }

  getRoleName(): string {
    const roles: Record<string, string> = {
      'EMPLOYEE': 'Pracownik',
      'ACCOUNTANT': 'Księgowa',
      'MANAGER': 'Menadżer',
      'ADMIN': 'Administrator'
    };
    const role = this.getUser()?.role;
    return role ? roles[role] || role : '';
  }

  getDashboardRoute(): string {
  const role = this.getUser()?.role;
  if (role === 'ACCOUNTANT') return '/accountant/dashboard';
  if (role === 'MANAGER') return '/manager/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/employee/dashboard';
}

  goToCreateUser() {
    this.router.navigate(['/admin/users/create']);
  }
  goToOcrSettings() {
    this.router.navigate(['/admin/ocr']);
  }
}