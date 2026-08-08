import { Component, inject } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
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
    ToolbarModule, 
    ButtonModule, 
    AvatarModule, 
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
}