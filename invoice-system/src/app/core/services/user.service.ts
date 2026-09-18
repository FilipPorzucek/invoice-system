import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  
  // Zakładam standardowy port Twojego backendu, dostosuj jeśli masz inny
  private apiUrl = 'http://localhost:8081/api/admin/users'; 

  // Pobieranie listy wszystkich użytkowników do tabeli
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // TODO: Miejsce na przyszłe endpointy, które za chwilę zrobimy
  /*
  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, userData);
  }

  changePassword(userId: number, newPassword: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/password`, newPassword);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }
  */
}