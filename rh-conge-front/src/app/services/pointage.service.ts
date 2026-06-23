import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Pointage {
  id?: number;
  utilisateurId: number;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  datePointage: string;
  heureArrivee?: string;
  heureDepart?: string;
  type:
    | 'PRESENTIEL'
    | 'TELE_TRAVAIL'
    | 'CONGE'
    | 'ABSENCE'
    | 'FORMATION'
    | 'MISSION'
    | 'RTT'
    | 'MALADIE'
    | 'CONGES_PAYES'
    | 'CONGES_SANS_SOLDE';
  justification?: string;
  present: boolean;
  heuresTravaillees?: number;
  heuresSupplementaires?: number;
  estJustifie?: boolean;
}

// ✅ Options pour le select
export const TYPE_PRESENCE_OPTIONS = [
  { value: 'PRESENTIEL', label: '🏢 Présentiel' },
  { value: 'TELE_TRAVAIL', label: '🏠 Télétravail' },
  { value: 'CONGE', label: '🌴 Congé' },
  { value: 'ABSENCE', label: '❌ Absence' },
  { value: 'FORMATION', label: '📚 Formation' },
  { value: 'MISSION', label: '🚀 Mission' },
  { value: 'RTT', label: '⏰ RTT' },
  { value: 'MALADIE', label: '🏥 Maladie' },
  { value: 'CONGES_PAYES', label: '💶 Congés Payés' },
  { value: 'CONGES_SANS_SOLDE', label: '💷 Congés Sans Solde' },
];

@Injectable({ providedIn: 'root' })
export class PointageService {
  private apiUrl = API_CONFIG.POINTAGE;

  constructor(private http: HttpClient) {}

  // ✅ MODIFIÉ : Ajout du paramètre type
  enregistrerArrivee(
    utilisateurId: number,
    type: string = 'PRESENTIEL', // ✅ Par défaut Présentiel
    heure?: string,
  ): Observable<Pointage> {
    const url = heure
      ? `${this.apiUrl}/arrivee/${utilisateurId}?type=${type}&heure=${heure}`
      : `${this.apiUrl}/arrivee/${utilisateurId}?type=${type}`;
    return this.http.post<Pointage>(url, {});
  }

  enregistrerDepart(
    utilisateurId: number,
    heure?: string,
  ): Observable<Pointage> {
    const url = heure
      ? `${this.apiUrl}/depart/${utilisateurId}?heure=${heure}`
      : `${this.apiUrl}/depart/${utilisateurId}`;
    return this.http.put<Pointage>(url, {});
  }

  getPointagesByUser(utilisateurId: number): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(`${this.apiUrl}/user/${utilisateurId}`);
  }

  getPointagesByUserAndDateRange(
    utilisateurId: number,
    debut: string,
    fin: string,
  ): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(
      `${this.apiUrl}/user/${utilisateurId}/period?debut=${debut}&fin=${fin}`,
    );
  }

  getPointagesByDate(date: string): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(`${this.apiUrl}/date?date=${date}`);
  }

  // ✅ MODIFIÉ : Ajout du type et justification
  updateTypePresence(
    pointageId: number,
    type: string,
    justification?: string,
  ): Observable<Pointage> {
    const url = justification
      ? `${this.apiUrl}/${pointageId}/type?type=${type}&justification=${justification}`
      : `${this.apiUrl}/${pointageId}/type?type=${type}`;
    return this.http.put<Pointage>(url, {});
  }

  getHeuresTravailleesMois(
    utilisateurId: number,
    mois: number,
    annee: number,
  ): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/user/${utilisateurId}/heures-mois?mois=${mois}&annee=${annee}`,
    );
  }
}
