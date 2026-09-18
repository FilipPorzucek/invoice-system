import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserRequest } from '../model/createUserRequest.model';
import { UpdateUserRequest } from '../model/UpdateUserRequest.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:8081/api/admin/users'; 

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(userData: CreateUserRequest): Observable<void>{
    return this.http.post<void>(this.apiUrl, userData);
  }

  updateUser(userId: number, userData: UpdateUserRequest): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${userId}`, userData);
}


}