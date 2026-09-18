import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../core/services/user.service';
import { UpdateUserRequest } from '../../../core/model/UpdateUserRequest.model';

@Component({
  selector: 'app-admin-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    ButtonModule
  ],
  templateUrl: './admin-user-edit-dialog.component.html',
  styleUrl: './admin-user-edit-dialog.component.scss'
})
export class AdminUserEditDialogComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() user: any = null;
  @Output() userSaved = new EventEmitter<void>();

  isSubmitting = false;
  errorMessage = '';

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.errorMessage = '';
      this.editForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role,
        dateOfBirth: this.user.dateOfBirth ? new Date(this.user.dateOfBirth) : null
      });
    }
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  save() {
    if (this.editForm.invalid || !this.user?.id) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: UpdateUserRequest = {
      ...this.editForm.value,
      dateOfBirth: this.formatDate(this.editForm.value.dateOfBirth)
    };

    this.userService.updateUser(this.user.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.userSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Nie udało się zaktualizować danych.';
      }
    });
  }

  formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); 
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; 
}
}