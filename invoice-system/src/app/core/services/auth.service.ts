import { inject, Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { LoginRequest } from '../model/login-request.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private loggedIn = false;
  private user: User | null = null;
  private storageKey = 'authData';
  
  private apiUrl = "http://localhost:8080/api/auth";

  constructor() {
    this.loadSessionData();
  }

  private loadSessionData(): void {
    const data = sessionStorage.getItem(this.storageKey);
    if (data) {
      this.user = JSON.parse(data);
      this.loggedIn = true;
      console.log('✅ Sesja przywrócona. User:', this.user);
    }
  }

  login(data: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.loggedIn = true;
        this.user = response; 
        sessionStorage.setItem(this.storageKey, JSON.stringify(response));
      })
    );
  }

  logout(): void {
    this.loggedIn = false;
    this.user = null;
    sessionStorage.removeItem(this.storageKey);
  }

  getToken(): string | null {
    if (!this.user) {
      this.loadSessionData();
    }
    return this.user?.access_token ?? null;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUser(): User | null {
    return this.user;
  }
}