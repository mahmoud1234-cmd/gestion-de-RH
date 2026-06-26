import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg border-0 rounded-4">
            <div
              class="card-header text-center bg-primary text-white rounded-top-4 py-3"
            >
              <h3 class="mb-0">
                <i class="fas fa-user-plus me-2"></i>Créer un compte
              </h3>
            </div>
            <div class="card-body p-4">
              <form #registerForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Nom</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="user.nom"
                      name="nom"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-semibold">Prénom</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="user.prenom"
                      name="prenom"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="user.email"
                    name="email"
                    placeholder="exemple@rh.com"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="user.password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <!-- ✅ Sélection du rôle -->
                <div class="mb-3">
                  <label class="form-label fw-semibold">
                    <i class="fas fa-user-tag me-1"></i>Rôle
                  </label>
                  <select
                    class="form-select"
                    [(ngModel)]="user.role"
                    name="role"
                    required
                  >
                    <option value="EMPLOYEE">👤 Employé</option>
                    <option value="MANAGER">⭐ Manager</option>
                  </select>
                  <small class="text-muted" *ngIf="user.role === 'MANAGER'">
                    <i class="fas fa-info-circle me-1"></i>
                    Les demandes de compte Manager doivent être approuvées par
                    un administrateur.
                  </small>
                </div>

                <button
                  type="submit"
                  class="btn btn-success w-100 py-2"
                  [disabled]="registerForm.invalid || loading"
                >
                  <i class="fas fa-spinner fa-spin me-2" *ngIf="loading"></i>
                  {{ loading ? 'Inscription...' : 'S'inscrire' }}
                </button>
              </form>

              <div class="mt-3 text-center">
                <a routerLink="/login" class="text-decoration-none">
                  <i class="fas fa-arrow-left me-1"></i>Déjà un compte ? Se
                  connecter
                </a>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ errorMessage }}
              </div>

              <div *ngIf="successMessage" class="alert alert-success mt-3">
                <i class="fas fa-check-circle me-2"></i>
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        animation: fadeInUp 0.5s ease-out;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .form-control,
      .form-select {
        border-radius: 8px;
        border: 2px solid #e9ecef;
        padding: 10px 14px;
        transition: all 0.3s ease;
      }
      .form-control:focus,
      .form-select:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
      }
      .btn-success {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        border: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn-success:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(67, 233, 123, 0.3);
      }
    `,
  ],
})
export class RegisterComponent {
  user: any = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'EMPLOYEE', // ✅ Par défaut : Employé
  };
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response: any) => {
        this.loading = false;

        // ✅ Message différent selon le rôle
        if (this.user.role === 'MANAGER') {
          this.successMessage =
            '✅ Votre demande de compte Manager a été envoyée ! ' +
            "Un administrateur va l'examiner. Vous serez notifié par email.";
          this.toastr.info(
            "Demande de compte Manager en attente d'approbation",
            '📋 En attente',
          );
        } else {
          this.successMessage = '✅ Compte créé avec succès ! Redirection...';
          this.toastr.success('Bienvenue !', 'Compte créé');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error || "Erreur lors de l'inscription";
        this.toastr.error(this.errorMessage, '❌ Erreur');
      },
    });
  }
}
