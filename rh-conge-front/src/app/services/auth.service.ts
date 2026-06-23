import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  soldeConge: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = API_CONFIG.AUTH;

  constructor(private http: HttpClient) {}

  register(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  isManager(): boolean {
    return this.getUser()?.role === 'MANAGER';
  }
}
