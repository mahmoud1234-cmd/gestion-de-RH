import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PointageService, Pointage } from '../../services/pointage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <!-- Navbar -->
      <nav
        class="navbar-custom mb-4 d-flex justify-content-between align-items-center"
      >
        <div>
          <i class="fas fa-clock me-2"></i>
          <span class="fw-bold">Gestion des Présences</span>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="navbar-text">
            <i class="fas fa-user me-2"></i>
            {{ user?.prenom }} {{ user?.nom }}
          </span>
          <button class="btn btn-outline-light btn-sm" (click)="logout()">
            <i class="fas fa-sign-out-alt me-1"></i> Déconnexion
          </button>
        </div>
      </nav>

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="stat-card text-center">
            <div class="stat-number">{{ pointages.length }}</div>
            <div class="stat-label">Total pointages</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div
            class="stat-card text-center"
            style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"
          >
            <div class="stat-number">{{ joursTravailles }}</div>
            <div class="stat-label">Jours travaillés</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div
            class="stat-card text-center"
            style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);"
          >
            <div class="stat-number">{{ totalHeures | number: '1.1-1' }}</div>
            <div class="stat-label">Heures travaillées</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div
            class="stat-card text-center"
            style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
          >
            <div class="stat-number">{{ heuresSupp | number: '1.1-1' }}</div>
            <div class="stat-label">Heures supp.</div>
          </div>
        </div>
      </div>

      <!-- Boutons pointage -->
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <button
            class="btn btn-success w-100 py-3"
            (click)="pointerArrivee()"
            [disabled]="arriveeDone"
          >
            <i class="fas fa-sign-in-alt fa-2x d-block"></i>
            {{ arriveeDone ? '✅ Arrivée enregistrée' : '🟢 Pointer arrivée' }}
          </button>
        </div>
        <div class="col-md-6">
          <button
            class="btn btn-danger w-100 py-3"
            (click)="pointerDepart()"
            [disabled]="!arriveeDone || departDone"
          >
            <i class="fas fa-sign-out-alt fa-2x d-block"></i>
            {{ departDone ? '✅ Départ enregistré' : '🔴 Pointer départ' }}
          </button>
        </div>
      </div>

      <!-- Calendrier des présences -->
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="fas fa-calendar-alt me-2 text-primary"></i>
            Calendrier des présences
          </h5>
          <div class="btn-group">
            <button
              class="btn btn-outline-primary btn-sm"
              (click)="previousMonth()"
            >
              ◀
            </button>
            <button class="btn btn-outline-secondary btn-sm">
              {{ moisActuel }}
            </button>
            <button
              class="btn btn-outline-primary btn-sm"
              (click)="nextMonth()"
            >
              ▶
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="calendar-grid">
            <div
              *ngFor="let jour of joursCalendrier"
              class="calendar-day"
              [class.present]="jour.present"
              [class.absent]="jour.absent"
              [class.weekend]="jour.weekend"
              [class.today]="jour.today"
              (click)="voirJour(jour.date)"
            >
              <span class="day-number">{{ jour.numero }}</span>
              <span class="day-type">{{ jour.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-history me-2 text-primary"></i>
            Historique des pointages
          </h5>
        </div>
        <div class="card-body p-0">
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
              <tr *ngFor="let pointage of pointages | slice: 0 : 10">
                <td>{{ pointage.datePointage | date: 'dd/MM/yyyy' }}</td>
                <td>{{ pointage.heureArrivee || '-' }}</td>
                <td>{{ pointage.heureDepart || '-' }}</td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'bg-success': pointage.type === 'PRESENTIEL',
                      'bg-info': pointage.type === 'TELE_TRAVAIL',
                      'bg-warning': pointage.type === 'CONGE',
                      'bg-danger': pointage.type === 'ABSENCE',
                      'bg-primary': pointage.type === 'FORMATION',
                    }"
                  >
                    {{ pointage.type }}
                  </span>
                </td>
                <td>{{ pointage.heuresTravaillees | number: '1.1-1' }}</td>
                <td>
                  <i
                    class="fas"
                    [ngClass]="{
                      'fa-check text-success': pointage.present,
                      'fa-times text-danger': !pointage.present,
                    }"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }
      .calendar-day {
        padding: 12px;
        text-align: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f8f9fa;
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .calendar-day:hover {
        transform: scale(1.05);
      }
      .calendar-day .day-number {
        font-weight: 600;
        font-size: 1.2rem;
      }
      .calendar-day .day-type {
        font-size: 0.6rem;
        opacity: 0.7;
      }
      .calendar-day.present {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
      .calendar-day.absent {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }
      .calendar-day.weekend {
        background: #e9ecef;
        opacity: 0.5;
      }
      .calendar-day.today {
        border: 3px solid #667eea;
      }
      .stat-card {
        padding: 20px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .stat-card .stat-number {
        font-size: 2rem;
        font-weight: 700;
      }
      .stat-card .stat-label {
        font-size: 0.8rem;
        opacity: 0.8;
      }
    `,
  ],
})
export class PointageComponent implements OnInit {
  user: any;
  pointages: Pointage[] = [];
  arriveeDone = false;
  departDone = false;
  moisActuel: string = '';
  joursCalendrier: any[] = [];
  totalHeures = 0;
  heuresSupp = 0;
  dateActuelle = new Date();

  constructor(
    private authService: AuthService,
    private pointageService: PointageService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (this.user) {
      this.chargerPointages();
      this.genererCalendrier();
      this.verifierPointageAujourdhui();
    }
  }

  get joursTravailles(): number {
    return this.pointages.filter((p) => p.present).length;
  }

  chargerPointages() {
    this.pointageService.getPointagesByUser(this.user.id).subscribe({
      next: (data) => {
        this.pointages = data;
        this.calculerHeures();
      },
      error: () => this.toastr.error('Erreur de chargement', 'Erreur'),
    });
  }

  calculerHeures() {
    this.totalHeures = this.pointages.reduce(
      (sum, p) => sum + (p.heuresTravaillees || 0),
      0,
    );
    this.heuresSupp = this.pointages.reduce(
      (sum, p) => sum + (p.heuresSupplementaires || 0),
      0,
    );
  }

  pointerArrivee() {
    this.pointageService.enregistrerArrivee(this.user.id).subscribe({
      next: (pointage) => {
        this.arriveeDone = true;
        this.toastr.success(
          'Arrivée enregistrée à ' + pointage.heureArrivee,
          '✅ Succès',
        );
        this.chargerPointages();
      },
      error: () => this.toastr.error('Erreur lors du pointage', '❌ Erreur'),
    });
  }

  pointerDepart() {
    this.pointageService.enregistrerDepart(this.user.id).subscribe({
      next: (pointage) => {
        this.departDone = true;
        this.toastr.success(
          'Départ enregistré à ' + pointage.heureDepart,
          '✅ Succès',
        );
        this.chargerPointages();
      },
      error: () => this.toastr.error('Erreur lors du pointage', '❌ Erreur'),
    });
  }

  verifierPointageAujourdhui() {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const pointageAujourdhui = this.pointages.find(
      (p) => p.datePointage === aujourdhui,
    );
    if (pointageAujourdhui) {
      this.arriveeDone = !!pointageAujourdhui.heureArrivee;
      this.departDone = !!pointageAujourdhui.heureDepart;
    }
  }

  genererCalendrier() {
    const mois = this.dateActuelle.getMonth();
    const annee = this.dateActuelle.getFullYear();
    this.moisActuel = new Date(annee, mois).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });

    const premierJour = new Date(annee, mois, 1).getDay();
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    this.joursCalendrier = [];
    for (let i = 0; i < premierJour; i++) {
      this.joursCalendrier.push({ empty: true });
    }

    for (let i = 1; i <= nbJours; i++) {
      const date = new Date(annee, mois, i);
      const dateStr = date.toISOString().split('T')[0];
      const pointage = this.pointages.find((p) => p.datePointage === dateStr);
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      const today = dateStr === new Date().toISOString().split('T')[0];

      this.joursCalendrier.push({
        numero: i,
        date: dateStr,
        present: pointage?.present || false,
        absent: pointage && !pointage.present,
        weekend: weekend,
        today: today,
        type: pointage?.type || (weekend ? 'Weekend' : ''),
      });
    }
  }

  voirJour(date: string) {
    const pointage = this.pointages.find((p) => p.datePointage === date);
    if (pointage) {
      this.toastr.info(
        `Arrivée: ${pointage.heureArrivee || '-'} | Départ: ${pointage.heureDepart || '-'} | Type: ${pointage.type}`,
        `📅 ${new Date(date).toLocaleDateString('fr-FR')}`,
      );
    } else {
      this.toastr.info('Aucun pointage pour ce jour', 'ℹ️ Information');
    }
  }

  previousMonth() {
    this.dateActuelle.setMonth(this.dateActuelle.getMonth() - 1);
    this.genererCalendrier();
  }

  nextMonth() {
    this.dateActuelle.setMonth(this.dateActuelle.getMonth() + 1);
    this.genererCalendrier();
  }

  logout() {
    this.authService.logout();
    this.toastr.success('À bientôt !', 'Déconnexion');
    this.router.navigate(['/login']);
  }
}
