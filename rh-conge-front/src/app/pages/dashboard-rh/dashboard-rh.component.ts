import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { PointageService, Pointage } from '../../services/pointage.service';
import { SalaireService } from '../../services/salaire.service';
import { ToastrService } from 'ngx-toastr';

interface UserStats {
  user: User;
  role: string;
  grade: string;
  gradeIcon: string;
  gradeColor: string;
  anneesExperience: number;
  totalHeuresMois: number;
  totalHeuresAnnee: number;
  tauxHoraire?: number;
  joursTravailles: number;
  tauxPresence: number;
  projets: number;
  performance: string;
  performanceColor: string;
}

@Component({
  selector: 'app-dashboard-rh',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- ========== HEADER PROFIL ========== -->
      <div class="profile-header animate__animated animate__fadeInDown" *ngIf="currentUserStats">
        <div class="profile-banner">
          <div class="profile-content">
            <div class="profile-avatar animate__animated animate__zoomIn" [style.background]="currentUserStats.gradeColor">
              <span class="avatar-initials">{{ currentUser?.prenom?.[0] }}{{ currentUser?.nom?.[0] }}</span>
            </div>
            <div class="profile-info">
              <h1 class="profile-name animate__animated animate__fadeInUp">
                {{ currentUser?.prenom }} {{ currentUser?.nom }}
              </h1>
              <div class="profile-meta">
                <span class="badge-category animate__animated animate__fadeInUp" 
                      [ngClass]="{
                        'category-employee': currentUser?.role === 'EMPLOYEE',
                        'category-manager': currentUser?.role === 'MANAGER'
                      }"
                      style="animation-delay: 0.2s">
                  <i class="fas" 
                     [ngClass]="currentUser?.role === 'MANAGER' ? 'fa-user-tie' : 'fa-user'"></i>
                  {{ currentUser?.role === 'MANAGER' ? 'Gestionnaire' : 'Employé' }}
                </span>
                <span class="badge-grade animate__animated animate__fadeInUp" 
                      [style]="'background: ' + (currentUserStats.gradeColor || '#667eea')"
                      style="animation-delay: 0.3s">
                  <i class="fas" [ngClass]="currentUserStats.gradeIcon"></i>
                  {{ currentUserStats.grade }}
                </span>
              </div>
            </div>
            <div class="profile-actions">
              <button class="btn btn-light btn-sm" (click)="logout()">
                <i class="fas fa-sign-out-alt me-1"></i> Déconnexion
              </button>
            </div>
          </div>
        </div>

        <!-- Profil Stats Cards -->
        <div class="profile-stats-grid">
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
            <div class="stat-value">{{ currentUserStats.anneesExperience }}</div>
            <div class="stat-label">Ans d'expérience</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="Math.min(currentUserStats.anneesExperience * 10, 100)"
                   [style.background]="currentUserStats.gradeColor"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.5s">
            <div class="stat-value">{{ currentUserStats.totalHeuresMois | number: '1.0-0' }}h</div>
            <div class="stat-label">Heures ce mois</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="Math.min((currentUserStats.totalHeuresMois / 160) * 100, 100)"
                   style="background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.6s">
            <div class="stat-value">{{ currentUserStats.tauxPresence }}%</div>
            <div class="stat-label">Taux présence</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="currentUserStats.tauxPresence"
                   [ngClass]="{
                     'bg-success': currentUserStats.tauxPresence >= 80,
                     'bg-warning': currentUserStats.tauxPresence >= 60,
                     'bg-danger': currentUserStats.tauxPresence < 60
                   }"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.7s">
            <div class="stat-value">{{ currentUserStats.performance }}</div>
            <div class="stat-label">Performance</div>
            <div class="perf-indicator" 
                 [ngClass]="{
                   'perf-excellent': currentUserStats.performance === 'Excellent',
                   'perf-bon': currentUserStats.performance === 'Bon',
                   'perf-moyen': currentUserStats.performance === 'Moyen',
                   'perf-faible': currentUserStats.performance === 'À améliorer'
                 }"></div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.8s">
            <div class="stat-value">{{ currentUserStats.tauxHoraire != null ? (currentUserStats.tauxHoraire | number: '1.2-2') + ' €/h' : '-' }}</div>
            <div class="stat-label">Coût / heure</div>
          </div>
        </div>
      </div>

      <!-- ========== MAIN CONTENT ========== -->
      <div class="container-fluid mt-5 px-4">
        <!-- En-tête section équipe -->
        <div class="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeInUp" style="animation-delay: 0.8s">
          <div>
            <h2 class="fw-bold mb-1">
              <i class="fas fa-chart-pie me-2 text-primary"></i>
              Vue d'ensemble de l'équipe
            </h2>
            <p class="text-muted mb-0">Performances et statistiques en temps réel</p>
          </div>
          <div>
            <span class="badge bg-primary p-2">
              <i class="fas fa-calendar-alt me-1"></i>
              {{ moisActuel | uppercase }} {{ anneeActuelle }}
            </span>
          </div>
        </div>

        <!-- Statistiques globales -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 0.9s">
              <div class="stat-icon"><i class="fas fa-users"></i></div>
              <div class="stat-number">{{ stats.totalEmployes }}</div>
              <div class="stat-label">Total Employés</div>
              <div class="stat-detail">
                <span class="text-success">{{ stats.employes }} 👤</span>
                <span class="text-warning ms-2">{{ stats.managers }} ⭐</span>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 1s; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <div class="stat-icon"><i class="fas fa-clock"></i></div>
              <div class="stat-number">{{ stats.totalHeures | number: '1.0-0' }}</div>
              <div class="stat-label">Heures travaillées</div>
              <div class="stat-detail">Ce mois-ci</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 1.1s; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-number">{{ stats.tauxPresence }}%</div>
              <div class="stat-label">Taux de présence</div>
              <div class="stat-detail">{{ stats.joursTravailles }} jours</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 1.2s; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <div class="stat-icon"><i class="fas fa-trophy"></i></div>
              <div class="stat-number">{{ stats.topPerformers }}</div>
              <div class="stat-label">Top Performers</div>
              <div class="stat-detail">⭐ Grade A</div>
            </div>
          </div>
        </div>

        <!-- Liste des employés avec statistiques -->
        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 1.3s">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-user-friends me-2 text-primary"></i>
              Équipe - Performances et Heures de Travail
            </h5>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" [class.active]="filtre === 'tous'" (click)="filtrer('tous')">
                Tous
              </button>
              <button class="btn btn-outline-success" [class.active]="filtre === 'employe'" (click)="filtrer('employe')">
                Employés
              </button>
              <button class="btn btn-outline-warning" [class.active]="filtre === 'manager'" (click)="filtrer('manager')">
                Managers
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-modern mb-0">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Rôle</th>
                    <th>Grade</th>
                    <th>Expérience</th>
                    <th>Heures Mois</th>
                    <th>Heures Année</th>
                    <th>Taux Présence</th>
                    <th>Performance</th>
                    <th>Projets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let stat of utilisateursFiltres; let i = index" 
                      class="animate__animated animate__fadeInUp"
                      [style.animation-delay]="i * 0.05 + 's'">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar" [style.background]="stat.gradeColor">
                          {{ stat.user.prenom[0] }}{{ stat.user.nom[0] }}
                        </div>
                        <div class="ms-2">
                          <div class="fw-semibold">{{ stat.user.prenom }} {{ stat.user.nom }}</div>
                          <small class="text-muted">{{ stat.user.email }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': stat.role === 'EMPLOYEE',
                        'bg-warning': stat.role === 'MANAGER'
                      }">
                        <i class="fas" [ngClass]="{
                          'fa-user': stat.role === 'EMPLOYEE',
                          'fa-user-tie': stat.role === 'MANAGER'
                        }"></i>
                        {{ stat.role === 'MANAGER' ? 'Gestionnaire' : 'Employé' }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [style.background]="stat.gradeColor" style="font-size:0.85rem;">
                        <i class="fas {{ stat.gradeIcon }} me-1"></i>
                        {{ stat.grade }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height:6px;width:60px;">
                          <div class="progress-bar" [style.width.%]="Math.min(stat.anneesExperience * 5, 100)" 
                               [style.background]="stat.gradeColor"></div>
                        </div>
                        <span>{{ stat.anneesExperience }} ans</span>
                      </div>
                    </td>
                    <td>
                      <strong>{{ stat.totalHeuresMois | number: '1.1-1' }}</strong>
                      <small class="text-muted d-block">h</small>
                    </td>
                    <td>
                      <strong class="text-primary">{{ stat.totalHeuresAnnee | number: '1.0-0' }}</strong>
                      <small class="text-muted d-block">h</small>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height:6px;width:60px;">
                          <div class="progress-bar" [style.width.%]="stat.tauxPresence"
                               [ngClass]="{
                                 'bg-success': stat.tauxPresence >= 80,
                                 'bg-warning': stat.tauxPresence >= 60,
                                 'bg-danger': stat.tauxPresence < 60
                               }"></div>
                        </div>
                        <span>{{ stat.tauxPresence }}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': stat.performance === 'Excellent',
                        'bg-info': stat.performance === 'Bon',
                        'bg-warning': stat.performance === 'Moyen',
                        'bg-danger': stat.performance === 'À améliorer'
                      }">
                        {{ stat.performance }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-primary" *ngIf="stat.projets > 0">
                        <i class="fas fa-project-diagram me-1"></i>
                        {{ stat.projets }}
                      </span>
                      <span class="text-muted" *ngIf="stat.projets === 0">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-muted mt-4 animate__animated animate__fadeInUp" style="animation-delay: 1.4s">
          <small>
            <i class="fas fa-sync-alt fa-fw me-1"></i>
            Dernière mise à jour : {{ dateMaj | date: 'dd/MM/yyyy HH:mm' }}
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding-bottom: 40px;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      position: relative;
      overflow: hidden;
    }

    .profile-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      z-index: 0;
    }

    .profile-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      z-index: 0;
    }

    .profile-banner {
      position: relative;
      z-index: 1;
    }

    .profile-content {
      display: flex;
      align-items: center;
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 36px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      flex-shrink: 0;
    }

    .avatar-initials {
      text-transform: uppercase;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      color: white;
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .profile-meta {
      display: flex;
      gap: 15px;
      margin-top: 15px;
    }

    .badge-category,
    .badge-grade {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .category-employee {
      background: rgba(16, 185, 129, 0.3) !important;
    }

    .category-manager {
      background: rgba(251, 146, 60, 0.3) !important;
    }

    .profile-actions {
      flex-shrink: 0;
    }

    .profile-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 30px auto 0;
      padding: 0 20px;
    }

    .stat-card-mini {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .stat-card-mini:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 10px;
    }

    .perf-indicator {
      height: 6px;
      border-radius: 3px;
      margin-top: 10px;
    }

    .perf-excellent {
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    }

    .perf-bon {
      background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .perf-moyen {
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    }

    .perf-faible {
      background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
    }

    .stat-card {
      padding: 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
    }

    .stat-card .stat-icon {
      font-size: 2.5rem;
      opacity: 0.2;
      position: absolute;
      right: 15px;
      top: 15px;
    }

    .stat-card .stat-number {
      font-size: 2.2rem;
      font-weight: 700;
    }

    .stat-card .stat-label {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .stat-card .stat-detail {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-top: 4px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .table-modern {
      background: white;
    }

    .table-modern thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .table-modern th {
      padding: 12px 16px;
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .table-modern td {
      padding: 12px 16px;
      vertical-align: middle;
      border-bottom: 1px solid #f0f0f0;
    }

    .table-modern tbody tr {
      transition: background 0.3s ease;
    }

    .table-modern tbody tr:hover {
      background: rgba(102, 126, 234, 0.05);
    }

    .progress {
      border-radius: 10px;
      background: #e9ecef;
    }

    .progress-bar {
      border-radius: 10px;
      transition: width 1s ease;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
    }

    .btn-group .btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
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

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate__animated {
      animation-duration: 0.6s;
      animation-fill-mode: both;
    }

    .animate__fadeInUp {
      animation-name: fadeInUp;
    }

    .animate__fadeInDown {
      animation-name: fadeInDown;
    }

    .animate__zoomIn {
      animation-name: zoomIn;
      animation-duration: 0.7s;
    }

    .card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      background: white;
      border-bottom: 2px solid #f0f0f0;
      padding: 20px;
    }
  `]
})
export class DashboardRhComponent implements OnInit {
  utilisateurs: UserStats[] = [];
  utilisateursFiltres: UserStats[] = [];
  filtre: string = 'tous';
  currentUser: User | null = null;
  currentUserStats: UserStats | null = null;
  stats = {
    totalEmployes: 0,
    employes: 0,
    managers: 0,
    totalHeures: 0,
    tauxPresence: 0,
    joursTravailles: 0,
    topPerformers: 0,
  };
  moisActuel: string = '';
  anneeActuelle: number = new Date().getFullYear();
  dateMaj: Date = new Date();
  Math = Math;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private pointageService: PointageService,
    private salaireService: SalaireService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.moisActuel = new Date().toLocaleString('fr-FR', { month: 'long' });
    const user = this.authService.getUser();
    if (user) {
      this.currentUser = { ...user, role: user.role as 'EMPLOYEE' | 'MANAGER' } as User;
    }
    this.chargerDonnees();
  }

  chargerDonnees() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const mois = new Date().getMonth() + 1;
        const annee = new Date().getFullYear();

        users.forEach((user) => {
          this.pointageService.getPointagesByUser(user.id!).subscribe({
            next: (pointages) => {
              const stats = this.calculerStats(user, pointages, mois, annee);

              // Taux horaire fixe selon le rôle — pas d'appel API salaire inutile
              stats.tauxHoraire = user.role === 'MANAGER' ? 18.50 : 12.50;
              this.utilisateurs.push(stats);

              if (this.currentUser && this.currentUser.id === user.id) {
                this.currentUserStats = stats;
              }

              this.utilisateursFiltres = [...this.utilisateurs];
              this.calculerStatsGlobales();
            },
            error: () => {
              const stats = this.calculerStatsVides(user);
              stats.tauxHoraire = 0;
              this.utilisateurs.push(stats);

              if (this.currentUser && this.currentUser.id === user.id) {
                this.currentUserStats = stats;
              }

              this.utilisateursFiltres = [...this.utilisateurs];
              this.calculerStatsGlobales();
            },
          });
        });
      },
      error: () => {
        this.toastr.error('Erreur de chargement des données', '❌ Erreur');
      },
    });
  }

  calculerStats(
    user: User,
    pointages: Pointage[],
    mois: number,
    annee: number,
  ): UserStats {
    // Calcul des heures du mois
    const pointagesMois = pointages.filter((p) => {
      const date = new Date(p.datePointage);
      return date.getMonth() + 1 === mois && date.getFullYear() === annee;
    });

    const totalHeuresMois = pointagesMois.reduce(
      (sum, p) => sum + (p.heuresTravaillees || 0),
      0,
    );
    const joursTravailles = pointagesMois.filter((p) => p.present).length;
    const tauxPresence =
      pointagesMois.length > 0
        ? Math.round((joursTravailles / pointagesMois.length) * 100)
        : 0;

    // Calcul de l'expérience
    const anneesExperience = user.dateEmbauche
      ? Math.floor(
          (new Date().getTime() - new Date(user.dateEmbauche).getTime()) /
            (1000 * 60 * 60 * 24 * 365),
        )
      : 0;

    // Calcul du grade
    const grade = this.calculerGrade(user, anneesExperience, totalHeuresMois);

    // Calcul de la performance
    const performance = this.calculerPerformance(tauxPresence, totalHeuresMois);

    // Projets (pour managers)
    const projets =
      user.role === 'MANAGER' ? Math.floor(Math.random() * 5) + 1 : 0;

    return {
      user,
      role: user.role || 'EMPLOYEE',
      grade: grade.nom,
      gradeIcon: grade.icone,
      gradeColor: grade.couleur,
      anneesExperience,
      totalHeuresMois,
      totalHeuresAnnee: pointages.reduce(
        (sum, p) => sum + (p.heuresTravaillees || 0),
        0,
      ),
      joursTravailles,
      tauxPresence,
      projets,
      performance: performance.nom,
      performanceColor: performance.couleur,
    };
  }

  calculerStatsVides(user: User): UserStats {
    return {
      user,
      role: user.role || 'EMPLOYEE',
      grade: 'Junior',
      gradeIcon: 'fa-star',
      gradeColor: '#6c757d',
      anneesExperience: 0,
      totalHeuresMois: 0,
      totalHeuresAnnee: 0,
      joursTravailles: 0,
      tauxPresence: 0,
      projets: user.role === 'MANAGER' ? 0 : 0,
      performance: 'Non évalué',
      performanceColor: '#6c757d',
    };
  }

  calculerGrade(
    user: User,
    annees: number,
    heures: number,
  ): { nom: string; icone: string; couleur: string } {
    if (user.role === 'MANAGER') {
      if (annees >= 10 && heures >= 160) {
        return { nom: 'Directeur', icone: 'fa-crown', couleur: '#f093fb' };
      } else if (annees >= 5 && heures >= 140) {
        return { nom: 'Senior Manager', icone: 'fa-star', couleur: '#4facfe' };
      } else if (annees >= 2) {
        return { nom: 'Manager', icone: 'fa-user-tie', couleur: '#43e97b' };
      } else {
        return {
          nom: 'Junior Manager',
          icone: 'fa-user-graduate',
          couleur: '#ffc107',
        };
      }
    } else {
      if (annees >= 8 && heures >= 150) {
        return { nom: 'Expert', icone: 'fa-gem', couleur: '#f093fb' };
      } else if (annees >= 5 && heures >= 120) {
        return { nom: 'Confirmé', icone: 'fa-star', couleur: '#4facfe' };
      } else if (annees >= 2) {
        return {
          nom: 'Intermédiaire',
          icone: 'fa-user-check',
          couleur: '#43e97b',
        };
      } else {
        return { nom: 'Junior', icone: 'fa-user-graduate', couleur: '#ffc107' };
      }
    }
  }

  calculerPerformance(
    tauxPresence: number,
    heures: number,
  ): { nom: string; couleur: string } {
    if (tauxPresence >= 90 && heures >= 140) {
      return { nom: 'Excellent', couleur: '#28a745' };
    } else if (tauxPresence >= 75 && heures >= 100) {
      return { nom: 'Bon', couleur: '#17a2b8' };
    } else if (tauxPresence >= 60) {
      return { nom: 'Moyen', couleur: '#ffc107' };
    } else {
      return { nom: 'À améliorer', couleur: '#dc3545' };
    }
  }

  calculerStatsGlobales() {
    this.stats.totalEmployes = this.utilisateurs.length;
    this.stats.employes = this.utilisateurs.filter(
      (u) => u.role === 'EMPLOYEE',
    ).length;
    this.stats.managers = this.utilisateurs.filter(
      (u) => u.role === 'MANAGER',
    ).length;
    this.stats.totalHeures = this.utilisateurs.reduce(
      (sum, u) => sum + u.totalHeuresMois,
      0,
    );
    this.stats.tauxPresence = Math.round(
      this.utilisateurs.reduce((sum, u) => sum + u.tauxPresence, 0) /
        (this.utilisateurs.length || 1),
    );
    this.stats.joursTravailles = this.utilisateurs.reduce(
      (sum, u) => sum + u.joursTravailles,
      0,
    );
    this.stats.topPerformers = this.utilisateurs.filter(
      (u) => u.performance === 'Excellent',
    ).length;
  }

  filtrer(type: string) {
    this.filtre = type;
    if (type === 'tous') {
      this.utilisateursFiltres = [...this.utilisateurs];
    } else if (type === 'employe') {
      this.utilisateursFiltres = this.utilisateurs.filter(
        (u) => u.role === 'EMPLOYEE',
      );
    } else if (type === 'manager') {
      this.utilisateursFiltres = this.utilisateurs.filter(
        (u) => u.role === 'MANAGER',
      );
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
