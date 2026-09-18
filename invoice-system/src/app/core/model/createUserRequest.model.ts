export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'EMPLOYEE' | 'ACCOUNTANT' | 'MANAGER' | 'ADMIN' | string;
  dateOfBirth?: string | null;
}