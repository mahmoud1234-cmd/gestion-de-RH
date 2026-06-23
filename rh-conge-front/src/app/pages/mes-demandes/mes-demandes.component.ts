import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CongeService, DemandeConge } from '../../services/conge.service';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>Mes demandes de congé</h3>
        <div>
          <button class="btn btn-primary me-2" routerLink="/demande-form">
            + Nouvelle
          </button>
          <button class="btn btn-secondary" routerLink="/employee">
            Retour
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div
            *ngIf="demandes.length === 0"
            class="text-center text-muted py-4"
          >
            Aucune demande de congé trouvée
          </div>
          <table class="table" *ngIf="demandes.length > 0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Statut</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let demande of demandes">
                <td>{{ demande.typeConge }}</td>
                <td>{{ demande.dateDebut }} → {{ demande.dateFin }}</td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'bg-warning': demande.statut === 'EN_ATTENTE',
                      'bg-success': demande.statut === 'APPROUVE',
                      'bg-danger': demande.statut === 'REFUSE',
                    }"
                  >
                    {{ demande.statut }}
                  </span>
                </td>
                <td>{{ demande.commentaire || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class MesDemandesComponent implements OnInit {
  demandes: DemandeConge[] = [];

  constructor(
    private authService: AuthService,
    private congeService: CongeService,
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.congeService.getMesDemandes(user.id).subscribe({
        next: (data) => (this.demandes = data),
        error: (err) => console.error('Erreur', err),
      });
    }
  }
}
