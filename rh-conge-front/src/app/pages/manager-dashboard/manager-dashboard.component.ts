import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CongeService, DemandeConge } from '../../services/conge.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark rounded">
        <div class="container-fluid">
          <span class="navbar-brand">Gestion des Congés - Manager</span>
          <div class="d-flex">
            <span class="navbar-text me-3"
              >Bonjour {{ user?.prenom }} {{ user?.nom }}</span
            >
            <button class="btn btn-outline-light btn-sm" (click)="logout()">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Demandes en attente d'approbation</h5>
            </div>
            <div class="card-body">
              <div
                *ngIf="demandes.length === 0"
                class="text-center text-muted py-4"
              >
                Aucune demande en attente
              </div>
              <div *ngFor="let demande of demandes" class="border-bottom py-3">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <strong
                      >{{ demande.utilisateurPrenom }}
                      {{ demande.utilisateurNom }}</strong
                    >
                    <br />
                    <span class="badge bg-info">{{ demande.typeConge }}</span>
                    <span class="ms-2"
                      >{{ demande.dateDebut }} → {{ demande.dateFin }}</span
                    >
                    <br />
                    <small class="text-muted">{{ demande.commentaire }}</small>
                  </div>
                  <div class="col-md-6 text-end">
                    <button
                      class="btn btn-success btn-sm me-2"
                      (click)="approuver(demande.id!)"
                    >
                      ✅ Approuver
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      (click)="refuser(demande.id!)"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-secondary text-white">
              <h5 class="mb-0">Toutes les demandes</h5>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let demande of toutesDemandes">
                    <td>
                      {{ demande.utilisateurPrenom }}
                      {{ demande.utilisateurNom }}
                    </td>
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
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ManagerDashboardComponent implements OnInit {
  user: any;
  demandes: DemandeConge[] = [];
  toutesDemandes: DemandeConge[] = [];

  constructor(
    private authService: AuthService,
    private congeService: CongeService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.loadData();
  }

  loadData() {
    this.congeService.getDemandesATraiter().subscribe({
      next: (data) => (this.demandes = data),
      error: (err) => console.error('Erreur', err),
    });

    // Pour les besoins de la démo, on charge aussi toutes les demandes
    // Ici tu pourrais ajouter un endpoint /api/conges/toutes
  }

  approuver(demandeId: number) {
    this.traiterDemande(demandeId, 'APPROUVE');
  }

  refuser(demandeId: number) {
    this.traiterDemande(demandeId, 'REFUSE');
  }

  traiterDemande(demandeId: number, statut: string) {
    this.congeService
      .traiterDemande(demandeId, this.user.id, statut)
      .subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => console.error('Erreur', err),
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
