import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CongeService } from '../../services/conge.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4>Nouvelle demande de congé</h4>
            </div>
            <div class="card-body">
              <form #demandeForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Type de congé</label>
                  <select
                    class="form-select"
                    [(ngModel)]="demande.typeConge"
                    name="typeConge"
                    required
                  >
                    <option value="PAYE">Congé payé</option>
                    <option value="SANS_SOLDE">Congé sans solde</option>
                    <option value="MALADIE">Congé maladie</option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date début</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="demande.dateDebut"
                      name="dateDebut"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date fin</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="demande.dateFin"
                      name="dateFin"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Commentaire</label>
                  <textarea
                    class="form-control"
                    [(ngModel)]="demande.commentaire"
                    name="commentaire"
                    rows="3"
                  ></textarea>
                </div>

                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    routerLink="/employee"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="demandeForm.invalid"
                  >
                    Envoyer la demande
                  </button>
                </div>
              </form>

              <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                {{ errorMessage }}
              </div>
              <div *ngIf="successMessage" class="alert alert-success mt-3">
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DemandeFormComponent {
  demande: any = {
    typeConge: 'PAYE',
    dateDebut: '',
    dateFin: '',
    commentaire: '',
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private congeService: CongeService,
    private router: Router,
  ) {}

  onSubmit() {
    const user = this.authService.getUser();
    if (!user) return;

    this.congeService.demanderConge(user.id, this.demande).subscribe({
      next: () => {
        this.successMessage = 'Demande envoyée avec succès !';
        setTimeout(() => this.router.navigate(['/employee']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la demande';
      },
    });
  }
}
