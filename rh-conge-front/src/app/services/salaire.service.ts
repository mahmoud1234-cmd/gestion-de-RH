import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface LigneSalaire {
  id?: number;
  libelle: string;
  type: 'GAIN' | 'DEDUCTION' | 'COTISATION' | 'IMPOT';
  montant: number;
}

export interface Salaire {
  id?: number;
  utilisateurId: number;
  utilisateurNom: string;
  utilisateurPrenom: string;
  utilisateurRole: string;
  mois: number;
  annee: number;

  // Heures
  heuresNormales: number;
  heuresSupplementaires: number;
  heuresDimanche: number;
  heuresAbsences: number;

  // Taux
  tauxHoraire: number;
  tauxHoraireSupp: number;
  tauxHoraireDimanche: number;

  // Salaires
  salaireBase: number;
  salaireSupplementaire: number;
  salaireDimanche: number;

  // Primes
  primeAnciennete: number;
  primeResponsabilite: number;
  primePerformance: number;

  // Totaux
  salaireBrut: number;
  cotisationsSociales: number;
  impots: number;
  salaireNet: number;

  dateCalcul: Date;
  estPaye: boolean;

  lignes: LigneSalaire[];
}

@Injectable({ providedIn: 'root' })
export class SalaireService {
  private apiUrl = API_CONFIG.SALAIRE;

  constructor(private http: HttpClient) {}

  calculerSalaire(
    utilisateurId: number,
    mois: number,
    annee: number,
  ): Observable<Salaire> {
    return this.http.post<Salaire>(
      `${this.apiUrl}/calculer/${utilisateurId}?mois=${mois}&annee=${annee}`,
      {},
    );
  }

  getSalairesByUser(utilisateurId: number): Observable<Salaire[]> {
    return this.http.get<Salaire[]>(`${this.apiUrl}/user/${utilisateurId}`);
  }

  getSalaireByMonth(
    utilisateurId: number,
    mois: number,
    annee: number,
  ): Observable<Salaire> {
    return this.http.get<Salaire>(
      `${this.apiUrl}/user/${utilisateurId}/month?mois=${mois}&annee=${annee}`,
    );
  }
}
