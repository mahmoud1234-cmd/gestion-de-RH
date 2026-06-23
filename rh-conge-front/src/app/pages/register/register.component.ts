import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header text-center">
              <h3>Créer un compte</h3>
            </div>
            <div class="card-body">
              <form #registerForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nom</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="user.nom"
                      name="nom"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Prénom</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="user.prenom"
                      name="prenom"
                      required
                    />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="user.email"
                    name="email"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="user.password"
                    name="password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-success w-100"
                  [disabled]="registerForm.invalid"
                >
                  S'inscrire
                </button>
              </form>
              <div class="mt-3 text-center">
                <a routerLink="/login">Déjà un compte ? Se connecter</a>
              </div>
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
export class RegisterComponent {
  user: any = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error || "Erreur lors de l'inscription";
      },
    });
  }
}
