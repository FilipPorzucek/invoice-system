import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/model/login-request.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,           
    ReactiveFormsModule,    
    InputTextModule,       
    PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData: LoginRequest = this.loginForm.value;
    
    this.authService.login(loginData).subscribe({
      next: (user) => {
        console.log('Zalogowano pomyślnie:', user);

        const role = user.role; 

        if (role === 'EMPLOYEE') {
          this.router.navigate(['/employee/invoice-upload']);
        } else if (role === 'ACCOUNTANT') {
          this.router.navigate(['/accountant/dashboard']);
        } else if (role === 'MANAGER') {
          this.router.navigate(['/manager/dashboard']);
        } else {
          this.router.navigate(['/']); 
        }
      },
      error: (err) => {
        console.error('Błąd podczas logowania:', err);
      }
    });
  }
}
