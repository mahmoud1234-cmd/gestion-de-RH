import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CongeService } from '../../services/conge.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-custom sticky-top">
      <div class="container-fluid">
        <!-- Brand -->
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-calendar-check me-2"></i>
          <span class="fw-bold">RH Gestion</span>
        </a>

        <!-- Toggle mobile -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Contenu -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0" *ngIf="isLoggedIn()">
            <!-- Dashboard -->
            <li class="nav-item" *ngIf="!isManager()">
              <a
                class="nav-link"
                routerLink="/employee"
                routerLinkActive="active"
              >
                <i class="fas fa-home me-1"></i> Dashboard
              </a>
            </li>

            <!-- Dashboard RH (Manager) -->
            <li class="nav-item" *ngIf="isManager()">
              <a
                class="nav-link"
                routerLink="/dashboard-rh"
                routerLinkActive="active"
              >
                <i class="fas fa-chart-pie me-1"></i> Dashboard RH
              </a>
            </li>

            <!-- Manager Dashboard (Manager) -->
            <li class="nav-item" *ngIf="isManager()">
              <a
                class="nav-link"
                routerLink="/manager"
                routerLinkActive="active"
              >
                <i class="fas fa-tasks me-1"></i> Demandes
                <span
                  class="badge bg-danger ms-1"
                  *ngIf="nbDemandesEnAttente > 0"
                >
                  {{ nbDemandesEnAttente }}
                </span>
              </a>
            </li>

            <!-- Pointage -->
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/pointage"
                routerLinkActive="active"
              >
                <i class="fas fa-clock me-1"></i> Pointage
              </a>
            </li>

            <!-- Congés -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="fas fa-umbrella-beach me-1"></i> Congés
              </a>
              <ul class="dropdown-menu dropdown-menu-dark">
                <li>
                  <a class="dropdown-item" routerLink="/demande-form">
                    <i class="fas fa-plus me-2"></i> Nouvelle demande
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/mes-demandes">
                    <i class="fas fa-list me-2"></i> Mes demandes
                  </a>
                </li>
              </ul>
            </li>

            <!-- Salaire -->
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/salaire"
                routerLinkActive="active"
              >
                <i class="fas fa-euro-sign me-1"></i> Salaire
              </a>
            </li>

            <!-- Administration (Manager) -->
            <li class="nav-item dropdown" *ngIf="isManager()">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="fas fa-users-cog me-1"></i> Administration
              </a>
              <ul class="dropdown-menu dropdown-menu-dark">
                <li>
                  <a class="dropdown-item" routerLink="/dashboard-rh">
                    <i class="fas fa-chart-pie me-2"></i> Dashboard RH
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/manager">
                    <i class="fas fa-clock me-2"></i> Demandes à traiter
                    <span
                      class="badge bg-danger ms-2"
                      *ngIf="nbDemandesEnAttente > 0"
                    >
                      {{ nbDemandesEnAttente }}
                    </span>
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" routerLink="/employes">
                    <i class="fas fa-users me-2"></i> Tous les employés
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          <!-- Droite -->
          <ul class="navbar-nav ms-auto">
            <!-- Info utilisateur -->
            <li class="nav-item" *ngIf="isLoggedIn()">
              <span class="nav-link">
                <i class="fas fa-user-circle me-1"></i>
                {{ user?.prenom }} {{ user?.nom }}
                <span
                  class="badge ms-1"
                  [ngClass]="{
                    'bg-success': user?.role === 'EMPLOYEE',
                    'bg-warning': user?.role === 'MANAGER',
                  }"
                >
                  {{ user?.role }}
                </span>
              </span>
            </li>

            <!-- Déconnexion -->
            <li class="nav-item" *ngIf="isLoggedIn()">
              <a
                class="nav-link btn btn-outline-light btn-sm px-3"
                (click)="logout()"
              >
                <i class="fas fa-sign-out-alt me-1"></i> Déconnexion
              </a>
            </li>

            <!-- Connexion -->
            <li class="nav-item" *ngIf="!isLoggedIn()">
              <a
                class="nav-link btn btn-outline-light btn-sm px-3"
                routerLink="/login"
              >
                <i class="fas fa-sign-in-alt me-1"></i> Connexion
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 12px 24px;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        border-radius: 0 0 16px 16px;
      }

      .navbar-custom .navbar-brand {
        color: white;
        font-weight: 700;
        font-size: 1.3rem;
      }

      .navbar-custom .navbar-brand:hover {
        color: rgba(255, 255, 255, 0.8);
      }

      .navbar-custom .nav-link {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .navbar-custom .nav-link:hover {
        color: white;
        background: rgba(255, 255, 255, 0.15);
      }

      .navbar-custom .nav-link.active {
        color: white;
        background: rgba(255, 255, 255, 0.25);
      }

      .navbar-custom .dropdown-menu {
        background: linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%);
        border: none;
        border-radius: 12px;
        padding: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        margin-top: 8px;
      }

      .navbar-custom .dropdown-item {
        color: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        padding: 8px 16px;
        transition: all 0.3s ease;
      }

      .navbar-custom .dropdown-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .navbar-custom .dropdown-item i {
        width: 20px;
        text-align: center;
      }

      .navbar-custom .dropdown-divider {
        border-color: rgba(255, 255, 255, 0.1);
      }

      .navbar-custom .navbar-toggler {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .navbar-custom .navbar-toggler-icon {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255,255,255,0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
      }

      .badge.bg-danger {
        background: linear-gradient(
          135deg,
          #f093fb 0%,
          #f5576c 100%
        ) !important;
        font-size: 0.6rem;
        padding: 3px 7px;
      }

      .btn-outline-light {
        border-color: rgba(255, 255, 255, 0.4);
        color: white;
      }

      .btn-outline-light:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: white;
        color: white;
      }

      @media (max-width: 991.98px) {
        .navbar-custom {
          border-radius: 0;
        }

        .navbar-custom .nav-link {
          padding: 10px 16px;
        }

        .navbar-custom .dropdown-menu {
          background: transparent;
          box-shadow: none;
          padding-left: 20px;
        }

        .navbar-custom .dropdown-item {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  user: any;
  nbDemandesEnAttente = 0;
  toastr: any;

  constructor(
    private authService: AuthService,
    private congeService: CongeService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (this.isManager()) {
      this.loadDemandesEnAttente();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isManager(): boolean {
    return this.authService.isManager();
  }

  loadDemandesEnAttente() {
    this.congeService.getDemandesATraiter().subscribe({
      next: (data) => {
        this.nbDemandesEnAttente = data.length;
      },
      error: () => console.error('Erreur chargement demandes'),
    });
  }

  logout() {
    this.authService.logout();
    this.toastr.success('À bientôt !', 'Déconnexion');
    this.router.navigate(['/login']);
  }
}
