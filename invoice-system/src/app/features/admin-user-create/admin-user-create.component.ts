import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './admin-user-create.component.html',
  styleUrl: './admin-user-create.component.scss'
})
export class AdminUserCreateComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  roles = [
    { label: 'Pracownik (EMPLOYEE)', value: 'EMPLOYEE' },
    { label: 'Księgowa (ACCOUNTANT)', value: 'ACCOUNTANT' },
    { label: 'Manager (MANAGER)', value: 'MANAGER' },
    { label: 'Administrator (ADMIN)', value: 'ADMIN' }
  ];

  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['EMPLOYEE', Validators.required],
    dateOfBirth: [null]
  });

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.userForm.value,
      dateOfBirth: this.userForm.value.dateOfBirth
        ? new Date(this.userForm.value.dateOfBirth).toISOString().split('T')[0]
        : null
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Wystąpił błąd podczas tworzenia użytkownika.';
      }
    });
  }
}