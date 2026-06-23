import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id?: number;
  email: string;
  password?: string;
  nom: string;
  prenom: string;
  role: 'EMPLOYEE' | 'MANAGER';
  soldeConge?: number;
  dateEmbauche?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = API_CONFIG.UTILISATEURS;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}
