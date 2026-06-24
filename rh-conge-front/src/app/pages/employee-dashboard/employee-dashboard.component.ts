import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CongeService, DemandeConge } from '../../services/conge.service';
import {
  PointageService,
  Pointage,
  TYPE_PRESENCE_OPTIONS,
} from '../../services/pointage.service';
import { UserService, User } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { SalaireService, Salaire } from '../../services/salaire.service';

interface UserGrade {
  nom: string;
  icone: string;
  couleur: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <!-- ========== HEADER PROFIL ========== -->
      <div class="profile-header animate__animated animate__fadeInDown">
        <div class="profile-banner">
          <div class="profile-content">
            <div class="profile-avatar animate__animated animate__zoomIn" [style.background]="gradeInfo.couleur">
              <span class="avatar-initials">{{ user?.prenom?.[0] }}{{ user?.nom?.[0] }}</span>
            </div>
            <div class="profile-info">
              <h1 class="profile-name animate__animated animate__fadeInUp">
                {{ user?.prenom }} {{ user?.nom }}
              </h1>
              <div class="profile-meta">
                <span class="badge-category animate__animated animate__fadeInUp" 
                      style="animation-delay: 0.2s">
                  <i class="fas fa-user-check"></i>
                  Employé
                </span>
                <span class="badge-grade animate__animated animate__fadeInUp" 
                      [style]="'background: ' + gradeInfo.couleur"
                      style="animation-delay: 0.3s">
                  <i class="fas" [ngClass]="gradeInfo.icone"></i>
                  {{ gradeInfo.nom }}
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
            <div class="stat-value">{{ joursTravailles }}</div>
            <div class="stat-label">Jours travaillés</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="Math.min((joursTravailles / 22) * 100, 100)"
                   [style.background]="gradeInfo.couleur"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.5s">
            <div class="stat-value">{{ totalHeures | number: '1.0-0' }}h</div>
            <div class="stat-label">Heures travaillées</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="Math.min((totalHeures / 160) * 100, 100)"
                   style="background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.6s">
            <div class="stat-value">{{ user?.soldeConge || 0 }}</div>
            <div class="stat-label">Jours de congé</div>
            <div class="progress" style="height: 4px">
              <div class="progress-bar" 
                   [style.width.%]="Math.min(((user?.soldeConge || 0) / 30) * 100, 100)"
                   style="background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"></div>
            </div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.7s">
            <div class="stat-value">{{ demandes.length }}</div>
            <div class="stat-label">Demandes en cours</div>
            <div class="perf-indicator" 
                 [ngClass]="{'perf-pending': hasDemandesEnAttente()}"></div>
          </div>
          <div class="stat-card-mini animate__animated animate__fadeInUp" style="animation-delay: 0.8s">
            <div class="stat-value">{{ tauxHoraire != null ? (tauxHoraire | number: '1.2-2') + ' €/h' : '-' }}</div>
            <div class="stat-label">Coût / heure</div>
          </div>
        </div>
      </div>

      <!-- ========== MAIN CONTENT ========== -->
      <div class="container-fluid mt-5 px-4">
        <!-- Section Pointage -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card animate__animated animate__fadeInUp" style="animation-delay: 0.8s">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="fas fa-clock me-2 text-primary"></i>Pointage d'aujourd'hui
                </h5>
                <span class="badge" [ngClass]="{
                  'bg-success': pointageAujourdhui && pointageAujourdhui.heureArrivee,
                  'bg-danger': !pointageAujourdhui || !pointageAujourdhui.heureArrivee
                }">
                  {{ pointageAujourdhui && pointageAujourdhui.heureArrivee ? '✅ Pointé' : '⏳ Non pointé' }}
                </span>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-4">
                    <label class="form-label fw-semibold">Type de présence</label>
                    <select class="form-select" [(ngModel)]="typePresenceSelectionne"
                            [disabled]="!!pointageAujourdhui?.heureArrivee">
                      <option *ngFor="let option of typePresenceOptions" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4" *ngIf="typePresenceSelectionne !== 'PRESENTIEL'">
                    <label class="form-label fw-semibold">Justification</label>
                    <input type="text" class="form-control" [(ngModel)]="justification"
                           placeholder="Raison..." [disabled]="!!pointageAujourdhui?.heureArrivee" />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-3">
                    <div class="time-card animate__animated animate__fadeInUp" style="animation-delay: 0.85s">
                      <div class="time-label">Arrivée</div>
                      <div class="time-value">{{ pointageAujourdhui?.heureArrivee || '-' }}</div>
                      <button class="btn btn-success btn-sm mt-2 w-100" (click)="pointerArrivee()"
                              [disabled]="!!pointageAujourdhui?.heureArrivee">
                        <i class="fas fa-sign-in-alt me-1"></i>
                        {{ pointageAujourdhui?.heureArrivee ? '✅ Pointé' : 'Pointer' }}
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="time-card animate__animated animate__fadeInUp" style="animation-delay: 0.9s">
                      <div class="time-label">Départ</div>
                      <div class="time-value">{{ pointageAujourdhui?.heureDepart || '-' }}</div>
                                  <button class="btn btn-danger btn-sm mt-2 w-100" (click)="pointerDepart()"
                                    [disabled]="!pointageAujourdhui || !pointageAujourdhui.heureArrivee || !!pointageAujourdhui.heureDepart">
                        <i class="fas fa-sign-out-alt me-1"></i>
                        {{ pointageAujourdhui?.heureDepart ? '✅ Pointé' : 'Pointer' }}
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="time-card animate__animated animate__fadeInUp" style="animation-delay: 0.95s">
                      <div class="time-label">Type</div>
                      <div class="time-value" style="font-size: 0.9rem">
                        {{ getTypeLabel(pointageAujourdhui?.type) || '-' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="time-card animate__animated animate__fadeInUp" style="animation-delay: 1s">
                      <div class="time-label">Heures</div>
                      <div class="time-value">{{ pointageAujourdhui?.heuresTravaillees || 0 | number: '1.1-1' }}h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 1.05s">
              <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
              <div class="stat-number">{{ pointages.length }}</div>
              <div class="stat-label">Total pointages</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" 
                 style="animation-delay: 1.1s; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-number">{{ tauxPresence }}%</div>
              <div class="stat-label">Taux présence</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" 
                 style="animation-delay: 1.15s; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
              <div class="stat-number">{{ demandes.length }}</div>
              <div class="stat-label">Demandes</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card animate__animated animate__fadeInUp" 
                 style="animation-delay: 1.2s; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <div class="stat-icon"><i class="fas fa-star"></i></div>
              <div class="stat-number">{{ gradeInfo.nom }}</div>
              <div class="stat-label">Votre grade</div>
            </div>
          </div>
        </div>

        <!-- Mes Demandes de Congé -->
        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 1.25s">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="fas fa-list me-2 text-primary"></i>Mes demandes de congé
            </h5>
            <button class="btn btn-primary btn-sm" routerLink="/demande-form">
              <i class="fas fa-plus me-1"></i> Nouvelle demande
            </button>
          </div>
          <div class="card-body">
            <div *ngIf="demandes.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-inbox fa-2x d-block mb-2"></i>
              <p>Aucune demande de congé</p>
            </div>
            <div *ngFor="let demande of demandes; let i = index" 
                 class="demande-item animate__animated animate__fadeInUp"
                 [style.animation-delay]="(1.3 + i * 0.05) + 's'">
              <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                  <span class="badge" [ngClass]="{
                    'bg-warning': demande.statut === 'EN_ATTENTE',
                    'bg-success': demande.statut === 'APPROUVE',
                    'bg-danger': demande.statut === 'REFUSE'
                  }">
                    {{ demande.statut }}
                  </span>
                  <span class="ms-2 fw-semibold">{{ demande.typeConge }}</span>
                  <span class="ms-2 text-muted">
                    {{ demande.dateDebut }} → {{ demande.dateFin }}
                  </span>
                  <br />
                  <small class="text-muted" *ngIf="demande.commentaire">
                    <i class="fas fa-comment me-1"></i>{{ demande.commentaire }}
                  </small>
                </div>
                <div *ngIf="demande.statut === 'EN_ATTENTE'">
                  <button class="btn btn-sm btn-outline-danger" (click)="annulerDemande(demande.id!)">
                    <i class="fas fa-times"></i> Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historique Pointage -->
        <div class="card mt-4 animate__animated animate__fadeInUp" style="animation-delay: 1.35s">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-history me-2 text-primary"></i>Historique des pointages
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-modern mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Type</th>
                    <th>Heures</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of pointages | slice: 0 : 10"
                      class="animate__animated animate__fadeInUp"
                      [style.animation-delay]="(1.4 + (pointages.indexOf(p) * 0.03)) + 's'">
                    <td>{{ p.datePointage | date: 'dd/MM/yyyy' }}</td>
                    <td>{{ p.heureArrivee || '-' }}</td>
                    <td>{{ p.heureDepart || '-' }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-success': p.type === 'PRESENTIEL',
                        'bg-info': p.type === 'TELE_TRAVAIL',
                        'bg-warning': p.type === 'CONGE' || p.type === 'RTT',
                        'bg-danger': p.type === 'ABSENCE' || p.type === 'MALADIE',
                        'bg-primary': p.type === 'FORMATION'
                      }">
                        {{ getTypeLabel(p.type) }}
                      </span>
                    </td>
                    <td>{{ p.heuresTravaillees | number: '1.1-1' }}h</td>
                    <td>
                      <i class="fas" [ngClass]="{
                        'fa-check text-success': p.present,
                        'fa-times text-danger': !p.present
                      }"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-muted mt-4 animate__animated animate__fadeInUp" style="animation-delay: 1.5s">
          <small>
            <i class="fas fa-sync-alt fa-fw me-1"></i>
            Dernière mise à jour : {{ now | date: 'dd/MM/yyyy HH:mm' }}
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

    .badge-category {
      background: rgba(16, 185, 129, 0.3) !important;
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

    .perf-pending {
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    }

    .time-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .time-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .time-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .time-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #667eea;
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

    .demande-item {
      border-bottom: 1px solid #e9ecef;
      padding: 15px 0;
    }

    .demande-item:last-child {
      border-bottom: none;
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
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  user: User | null = null;
  pointages: Pointage[] = [];
  pointageAujourdhui: Pointage | null = null;
  demandes: DemandeConge[] = [];
  
  totalHeures = 0;
  heuresSupp = 0;
  joursTravailles = 0;
  tauxPresence = 0;
  now = new Date();
  tauxHoraire: number | undefined = undefined;

  gradeInfo: UserGrade = {
    nom: 'Junior',
    icone: 'fa-user-graduate',
    couleur: '#ffc107'
  };

  typePresenceSelectionne: string = 'PRESENTIEL';
  justification: string = '';
  typePresenceOptions = TYPE_PRESENCE_OPTIONS;
  Math = Math;

  constructor(
    private authService: AuthService,
    private pointageService: PointageService,
    private congeService: CongeService,
    private userService: UserService,
    private salaireService: SalaireService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    const authUser = this.authService.getUser();
    if (authUser) {
      this.user = { ...authUser, role: authUser.role as 'EMPLOYEE' | 'MANAGER' } as User;
      this.loadPointages();
      this.loadDemandes();

      // Afficher immédiatement le taux fixe selon le rôle (valeur par défaut)
      const tauxParRole = this.user.role === 'MANAGER' ? 18.50 : 12.50;
      this.tauxHoraire = tauxParRole;

      // Essayer de récupérer le taux réel depuis l'API (sinon la valeur fixe reste)
      const mois = new Date().getMonth() + 1;
      const annee = new Date().getFullYear();

      this.salaireService.getSalaireByMonth(this.user!.id!, mois, annee).subscribe({
        next: (salaire: Salaire) => {
          this.tauxHoraire = salaire?.tauxHoraire ?? tauxParRole;
        },
        error: () => {
          // Salaire pas encore calculé → on le calcule en arrière-plan
          this.salaireService.calculerSalaire(this.user!.id!, mois, annee).subscribe({
            next: (salaire: Salaire) => {
              this.tauxHoraire = salaire?.tauxHoraire ?? tauxParRole;
            },
            error: () => {
              // API indisponible → valeur fixe selon le rôle
              this.tauxHoraire = tauxParRole;
            },
          });
        },
      });
    }
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return '-';
    const option = this.typePresenceOptions.find((o) => o.value === type);
    return option ? option.label : type;
  }

  loadPointages() {
    this.pointageService.getPointagesByUser(this.user!.id!).subscribe({
      next: (data) => {
        this.pointages = data;
        this.calculerHeures();
        this.trouverPointageAujourdhui();
        this.calculerGrade();
      },
      error: () =>
        this.toastr.error('Erreur de chargement des pointages', 'Erreur'),
    });
  }

  trouverPointageAujourdhui() {
    const aujourdhui = new Date().toISOString().split('T')[0];
    this.pointageAujourdhui =
      this.pointages.find((p) => p.datePointage === aujourdhui) || null;
  }

  calculerHeures() {
    const maintenant = new Date();
    const moisActuel = maintenant.getMonth() + 1;
    const anneeActuelle = maintenant.getFullYear();

    const pointagesMois = this.pointages.filter((p) => {
      const date = new Date(p.datePointage);
      return date.getMonth() + 1 === moisActuel && date.getFullYear() === anneeActuelle;
    });

    this.totalHeures = this.pointages.reduce(
      (sum, p) => sum + (p.heuresTravaillees || 0),
      0,
    );
    
    const totalHeuresMois = pointagesMois.reduce(
      (sum, p) => sum + (p.heuresTravaillees || 0),
      0,
    );

    this.joursTravailles = this.pointages.filter((p) => p.present).length;
    
    const joursPointagesMois = pointagesMois.filter((p) => p.present).length;
    this.tauxPresence = pointagesMois.length > 0 
      ? Math.round((joursPointagesMois / pointagesMois.length) * 100)
      : 0;

    this.heuresSupp = this.pointages.reduce(
      (sum, p) => sum + (p.heuresSupplementaires || 0),
      0,
    );
  }

  calculerGrade() {
    const anneesExperience = this.user?.dateEmbauche
      ? Math.floor(
          (new Date().getTime() - new Date(this.user.dateEmbauche).getTime()) /
            (1000 * 60 * 60 * 24 * 365),
        )
      : 0;

    if (anneesExperience >= 8 && this.totalHeures >= 1200) {
      this.gradeInfo = { nom: 'Expert', icone: 'fa-gem', couleur: '#f093fb' };
    } else if (anneesExperience >= 5 && this.totalHeures >= 960) {
      this.gradeInfo = { nom: 'Confirmé', icone: 'fa-star', couleur: '#4facfe' };
    } else if (anneesExperience >= 2 && this.totalHeures >= 480) {
      this.gradeInfo = { nom: 'Intermédiaire', icone: 'fa-user-check', couleur: '#43e97b' };
    } else {
      this.gradeInfo = { nom: 'Junior', icone: 'fa-user-graduate', couleur: '#ffc107' };
    }
  }

  pointerArrivee() {
    this.pointageService
      .enregistrerArrivee(this.user!.id!, this.typePresenceSelectionne, undefined)
      .subscribe({
        next: () => {
          this.toastr.success('Arrivée enregistrée', '✅ Succès');
          this.loadPointages();
        },
        error: (err) => {
          this.toastr.error(
            err.error || 'Erreur lors du pointage',
            '❌ Erreur',
          );
        },
      });
  }

  pointerDepart() {
    this.pointageService.enregistrerDepart(this.user!.id!, undefined).subscribe({
      next: () => {
        this.toastr.success('Départ enregistré', '✅ Succès');
        this.loadPointages();
      },
      error: (err) => {
        this.toastr.error(err.error || 'Erreur lors du pointage', '❌ Erreur');
      },
    });
  }

  loadDemandes() {
    this.congeService.getMesDemandes(this.user!.id!).subscribe({
      next: (data) => {
        this.demandes = data;
      },
      error: () =>
        this.toastr.error('Erreur de chargement des demandes', 'Erreur'),
    });
  }

  annulerDemande(demandeId: number) {
    this.toastr.warning('Fonctionnalité à implémenter', 'Annulation');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasDemandesEnAttente(): boolean {
    return this.demandes.some((d) => d.statut === 'EN_ATTENTE');
  }
}
