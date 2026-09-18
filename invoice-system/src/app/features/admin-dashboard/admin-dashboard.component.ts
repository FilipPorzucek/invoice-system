import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AdminUserEditDialogComponent } from '../dialogs/admin-user-edit-dialog/admin-user-edit-dialog.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    AdminUserEditDialogComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  users: any[] = [];
  isLoading = true;

  editDialogVisible = false;
  selectedUser: any = null;

  roles = [
    { label: 'Pracownik (EMPLOYEE)', value: 'EMPLOYEE' },
    { label: 'Księgowa (ACCOUNTANT)', value: 'ACCOUNTANT' },
    { label: 'Manager (MANAGER)', value: 'MANAGER' },
    { label: 'Administrator (ADMIN)', value: 'ADMIN' }
  ];

  editForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    dateOfBirth: [null]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania użytkowników:', err);
        this.isLoading = false;
      }
    });
  }

  goToCreateUser() {
    this.router.navigate(['/admin/users/create']);
  }

  openEditDialog(user: any) {
    this.selectedUser = user;
    this.editDialogVisible = true;
  }
}