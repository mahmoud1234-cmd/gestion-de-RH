import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface DemandeConge {
  id?: number;
  utilisateurId: number;
  dateDebut: string;
  dateFin: string;
  typeConge: 'PAYE' | 'SANS_SOLDE' | 'MALADIE';
  statut?: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';
  commentaire?: string;
  dateDemande?: string;
  dateTraitement?: string;
  managerId?: number;
  managerNom?: string;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
}

@Injectable({ providedIn: 'root' })
export class CongeService {
  private apiUrl = API_CONFIG.CONGES;

  constructor(private http: HttpClient) {}

  demanderConge(utilisateurId: number, demande: any): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(
      `${this.apiUrl}/demander/${utilisateurId}`,
      demande,
    );
  }

  getMesDemandes(utilisateurId: number): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(
      `${this.apiUrl}/mes-demandes/${utilisateurId}`,
    );
  }

  getDemandesATraiter(): Observable<DemandeConge[]> {
    return this.http.get<DemandeConge[]>(`${this.apiUrl}/a-traiter`);
  }

  traiterDemande(
    demandeId: number,
    managerId: number,
    statut: string,
  ): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(
      `${this.apiUrl}/traiter/${demandeId}?managerId=${managerId}&statut=${statut}`,
      {},
    );
  }
}
