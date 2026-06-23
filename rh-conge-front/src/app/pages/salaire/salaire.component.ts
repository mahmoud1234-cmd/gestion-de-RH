import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SalaireService, Salaire } from '../../services/salaire.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-salaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <!-- Titre -->
      <div class="page-header mb-4">
        <h2>
          <i class="fas fa-euro-sign me-2 text-primary"></i>
          Gestion des Salaires
        </h2>
        <p class="text-muted">Calculez et consultez vos fiches de paie</p>
      </div>

      <!-- Sélecteur de période -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-3">
              <label class="form-label fw-semibold">Mois</label>
              <select
                class="form-select"
                [(ngModel)]="mois"
                (change)="chargerSalaire()"
              >
                <option *ngFor="let m of moisOptions" [value]="m.value">
                  {{ m.label }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Année</label>
              <select
                class="form-select"
                [(ngModel)]="annee"
                (change)="chargerSalaire()"
              >
                <option *ngFor="let a of anneesOptions" [value]="a">
                  {{ a }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <button
                class="btn btn-primary w-100"
                (click)="calculerSalaire()"
                [disabled]="loading"
              >
                <i class="fas fa-calculator me-1"></i>
                {{ loading ? 'Calcul en cours...' : 'Calculer le salaire' }}
              </button>
            </div>
            <div class="col-md-3" *ngIf="salaire">
              <button class="btn btn-success w-100" (click)="exporterPDF()">
                <i class="fas fa-file-pdf me-1"></i>
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Fiche de Paie -->
      <div
        *ngIf="salaire"
        id="pay-slip-container"
        class="pay-slip animate__animated animate__fadeInUp"
      >
        <!-- En-tête -->
        <div class="pay-slip-header">
          <div class="company-info">
            <h3>🏢 RH Gestion</h3>
            <p>SIRET : 123 456 789 00010</p>
            <p>📞 +33 1 23 45 67 89</p>
          </div>
          <div class="pay-slip-title">
            <h2>FICHE DE PAIE</h2>
            <p>{{ getNomMois() }} {{ annee }}</p>
            <span
              class="badge"
              [ngClass]="{
                'bg-success': salaire.estPaye,
                'bg-warning': !salaire.estPaye,
              }"
            >
              {{ salaire.estPaye ? '✅ Payé' : '⏳ En attente' }}
            </span>
          </div>
        </div>

        <!-- Info employé -->
        <div class="pay-slip-employee">
          <div class="row">
            <div class="col-md-6">
              <p>
                <strong>Employé :</strong> {{ salaire.utilisateurPrenom }}
                {{ salaire.utilisateurNom }}
              </p>
              <p><strong>Rôle :</strong> {{ salaire.utilisateurRole }}</p>
            </div>
            <div class="col-md-6 text-md-end">
              <p>
                <strong>Date de calcul :</strong>
                {{ salaire.dateCalcul | date: 'dd/MM/yyyy HH:mm' }}
              </p>
              <p>
                <strong>Statut :</strong>
                <span
                  class="badge"
                  [ngClass]="{
                    'bg-success': salaire.estPaye,
                    'bg-warning': !salaire.estPaye,
                  }"
                >
                  {{ salaire.estPaye ? 'Payé' : 'En attente' }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Détail des heures -->
        <div class="pay-slip-section">
          <h5>📊 Détail des heures</h5>
          <div class="row">
            <div class="col-md-6">
              <table class="table table-sm table-bordered">
                <tr>
                  <td>Heures normales</td>
                  <td class="text-end">
                    {{ salaire.heuresNormales | number: '1.1-1' }} h
                  </td>
                  <td class="text-end">
                    {{ salaire.tauxHoraire | currency: 'EUR' }}/h
                  </td>
                  <td class="text-end fw-bold">
                    {{ salaire.salaireBase | currency: 'EUR' }}
                  </td>
                </tr>
                <tr>
                  <td>Heures supplémentaires</td>
                  <td class="text-end">
                    {{ salaire.heuresSupplementaires | number: '1.1-1' }} h
                  </td>
                  <td class="text-end">
                    {{ salaire.tauxHoraireSupp | currency: 'EUR' }}/h
                  </td>
                  <td class="text-end fw-bold">
                    {{ salaire.salaireSupplementaire | currency: 'EUR' }}
                  </td>
                </tr>
                <tr>
                  <td>Heures dimanche</td>
                  <td class="text-end">
                    {{ salaire.heuresDimanche | number: '1.1-1' }} h
                  </td>
                  <td class="text-end">
                    {{ salaire.tauxHoraireDimanche | currency: 'EUR' }}/h
                  </td>
                  <td class="text-end fw-bold">
                    {{ salaire.salaireDimanche | currency: 'EUR' }}
                  </td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <table class="table table-sm table-bordered">
                <tr>
                  <td>Heures d'absence</td>
                  <td class="text-end">
                    {{ salaire.heuresAbsences | number: '1.1-1' }} h
                  </td>
                  <td class="text-end text-danger">-</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Primes -->
        <div
          class="pay-slip-section"
          *ngIf="
            salaire.primeAnciennete ||
            salaire.primeResponsabilite ||
            salaire.primePerformance
          "
        >
          <h5>🎯 Primes</h5>
          <table class="table table-sm table-bordered">
            <tr *ngIf="salaire.primeAnciennete">
              <td>Prime ancienneté</td>
              <td class="text-end fw-bold text-success">
                {{ salaire.primeAnciennete | currency: 'EUR' }}
              </td>
            </tr>
            <tr *ngIf="salaire.primeResponsabilite">
              <td>Prime responsabilité</td>
              <td class="text-end fw-bold text-success">
                {{ salaire.primeResponsabilite | currency: 'EUR' }}
              </td>
            </tr>
            <tr *ngIf="salaire.primePerformance">
              <td>Prime performance</td>
              <td class="text-end fw-bold text-success">
                {{ salaire.primePerformance | currency: 'EUR' }}
              </td>
            </tr>
          </table>
        </div>

        <!-- Lignes de salaire -->
        <div class="pay-slip-section">
          <h5>📝 Détail des gains et déductions</h5>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th class="text-end">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let ligne of salaire.lignes"
                  [class.table-success]="ligne.type === 'GAIN'"
                  [class.table-danger]="
                    ligne.type === 'COTISATION' || ligne.type === 'IMPOT'
                  "
                >
                  <td>{{ ligne.libelle }}</td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="{
                        'bg-success': ligne.type === 'GAIN',
                        'bg-warning': ligne.type === 'DEDUCTION',
                        'bg-info': ligne.type === 'COTISATION',
                        'bg-danger': ligne.type === 'IMPOT',
                      }"
                    >
                      {{ ligne.type }}
                    </span>
                  </td>
                  <td
                    class="text-end fw-bold"
                    [ngClass]="{
                      'text-success': ligne.montant > 0,
                      'text-danger': ligne.montant < 0,
                    }"
                  >
                    {{ ligne.montant | currency: 'EUR' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Récapitulatif -->
        <div class="pay-slip-total">
          <div class="row">
            <div class="col-md-4">
              <div class="total-box">
                <label>SALAIRE BRUT</label>
                <h3 class="text-primary">
                  {{ salaire.salaireBrut | currency: 'EUR' }}
                </h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="total-box">
                <label>COTISATIONS + IMPÔTS</label>
                <h3 class="text-danger">
                  -
                  {{
                    salaire.cotisationsSociales + salaire.impots
                      | currency: 'EUR'
                  }}
                </h3>
              </div>
            </div>
            <div class="col-md-4">
              <div class="total-box total-net">
                <label>SALAIRE NET</label>
                <h3 class="text-success">
                  {{ salaire.salaireNet | currency: 'EUR' }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Pied de page -->
        <div class="pay-slip-footer">
          <p class="text-muted text-center small">
            Fiche de paie générée automatiquement le
            {{ salaire.dateCalcul | date: 'dd/MM/yyyy à HH:mm' }}
          </p>
        </div>
      </div>

      <!-- Pas de salaire -->
      <div *ngIf="!salaire && !loading" class="text-center py-5">
        <i class="fas fa-file-invoice fa-4x text-muted mb-3"></i>
        <h4>Aucune fiche de paie trouvée</h4>
        <p class="text-muted">
          Cliquez sur "Calculer le salaire" pour générer votre fiche de paie
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f0f0;
      }
      .page-header h2 {
        font-weight: 700;
        color: #2d3748;
      }

      .pay-slip {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        padding: 32px;
        animation: fadeInUp 0.5s ease-out;
      }

      .pay-slip-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 20px;
        border-bottom: 2px solid #667eea;
        margin-bottom: 20px;
      }

      .company-info h3 {
        color: #2d3748;
        font-weight: 700;
      }
      .company-info p {
        margin: 0;
        color: #718096;
        font-size: 0.9rem;
      }

      .pay-slip-title {
        text-align: right;
      }
      .pay-slip-title h2 {
        color: #667eea;
        font-weight: 700;
        margin: 0;
      }
      .pay-slip-title p {
        margin: 0;
        color: #718096;
      }

      .pay-slip-employee {
        background: #f7fafc;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 20px;
      }
      .pay-slip-employee p {
        margin: 4px 0;
      }

      .pay-slip-section {
        margin-bottom: 24px;
      }
      .pay-slip-section h5 {
        color: #2d3748;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .table {
        font-size: 0.9rem;
      }
      .table-bordered {
        border: 1px solid #e2e8f0;
      }
      .table-bordered td {
        padding: 8px 12px;
        border-color: #e2e8f0;
      }
      .table-success td {
        background-color: #f0fff4;
      }
      .table-danger td {
        background-color: #fff5f5;
      }

      .pay-slip-total {
        background: #f7fafc;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
      }
      .total-box {
        text-align: center;
        padding: 12px;
      }
      .total-box label {
        font-size: 0.8rem;
        text-transform: uppercase;
        color: #718096;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .total-box h3 {
        margin: 4px 0 0 0;
        font-weight: 700;
      }
      .total-net {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        border-radius: 12px;
        padding: 16px;
      }
      .total-net label {
        color: rgba(255, 255, 255, 0.8);
      }
      .total-net h3 {
        color: white;
      }

      .pay-slip-footer {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
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

      @media print {
        .navbar-custom,
        .btn,
        .page-header {
          display: none !important;
        }
        .pay-slip {
          box-shadow: none !important;
          padding: 20px;
        }
      }
    `,
  ],
})
export class SalaireComponent implements OnInit {
  user: any;
  salaire: Salaire | null = null;
  loading = false;

  mois: number = new Date().getMonth() + 1;
  annee: number = new Date().getFullYear();

  moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  anneesOptions: number[] = [];

  constructor(
    private authService: AuthService,
    private salaireService: SalaireService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    const anneeActuelle = new Date().getFullYear();
    for (let i = anneeActuelle - 3; i <= anneeActuelle + 1; i++) {
      this.anneesOptions.push(i);
    }

    this.chargerSalaire();
  }

  getNomMois(): string {
    return this.moisOptions.find((m) => m.value === this.mois)?.label || '';
  }

  chargerSalaire() {
    if (!this.user) return;
    this.loading = true;

    this.salaireService
      .getSalaireByMonth(this.user.id, this.mois, this.annee)
      .subscribe({
        next: (data) => {
          this.salaire = data;
          this.loading = false;
        },
        error: () => {
          this.salaire = null;
          this.loading = false;
        },
      });
  }

  calculerSalaire() {
    if (!this.user) return;
    this.loading = true;

    this.salaireService
      .calculerSalaire(this.user.id, this.mois, this.annee)
      .subscribe({
        next: (data) => {
          this.salaire = data;
          this.loading = false;
          this.toastr.success('Fiche de paie générée avec succès', '✅ Succès');
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err.error || 'Erreur lors du calcul', '❌ Erreur');
        },
      });
  }

  // ✅ Export PDF fonctionnel - Version impression
  exporterPDF() {
    if (!this.salaire) {
      this.toastr.warning('Aucune fiche de paie à exporter', '⚠️ Attention');
      return;
    }

    // ✅ Ouvrir une nouvelle fenêtre avec la fiche de paie formatée
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      this.toastr.error(
        'Veuillez autoriser les pop-ups pour exporter le PDF',
        '❌ Erreur',
      );
      return;
    }

    const lignesHTML =
      this.salaire.lignes
        ?.map(
          (l) => `
            <tr>
                <td>${l.libelle}</td>
                <td>
                    <span class="badge" style="padding:2px 10px;border-radius:12px;font-size:11px;background:${
                      l.type === 'GAIN'
                        ? '#28a745'
                        : l.type === 'COTISATION'
                          ? '#17a2b8'
                          : l.type === 'IMPOT'
                            ? '#dc3545'
                            : '#ffc107'
                    };color:white;">
                        ${l.type}
                    </span>
                </td>
                <td style="text-align:right;font-weight:${l.montant > 0 ? 'bold' : 'normal'};color:${l.montant > 0 ? '#28a745' : '#dc3545'}">
                    ${l.montant.toFixed(2)} €
                </td>
            </tr>
        `,
        )
        .join('') || '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fiche de Paie</title>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    padding: 40px;
                    background: #f8f9fa;
                    color: #2d3748;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px 30px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .header h2 { font-size: 24px; }
                .header p { opacity: 0.8; margin-top: 4px; font-size: 14px; }
                .header-right { text-align: right; }
                .header-right h2 { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
                .header-right .badge {
                    display: inline-block;
                    padding: 4px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    margin-top: 4px;
                    background: ${this.salaire.estPaye ? '#28a745' : '#ffc107'};
                    color: white;
                }
                .employee-info {
                    background: #f7fafc;
                    padding: 16px 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                }
                .employee-info p { margin: 4px 0; font-size: 14px; }
                .section { margin: 24px 0; }
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .section-title i { margin-right: 8px; }
                .table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .table th {
                    background: #f7fafc;
                    padding: 10px 12px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #e2e8f0;
                }
                .table td {
                    padding: 8px 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .table-bordered td, .table-bordered th {
                    border: 1px solid #e2e8f0;
                }
                .text-end { text-align: right; }
                .text-success { color: #28a745; }
                .text-danger { color: #dc3545; }
                .text-primary { color: #667eea; }
                .fw-bold { font-weight: 700; }
                .total-box {
                    background: #f7fafc;
                    padding: 16px 20px;
                    border-radius: 8px;
                    text-align: center;
                    flex: 1;
                }
                .total-box label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #718096;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .total-box h3 {
                    font-size: 20px;
                    margin-top: 4px;
                }
                .total-net {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                }
                .total-net label { color: rgba(255,255,255,0.8); }
                .total-net h2 { color: white; font-size: 28px; }
                .footer {
                    margin-top: 30px;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    color: #a0aec0;
                    font-size: 12px;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .badge-success { background: #28a745; color: white; }
                .badge-warning { background: #ffc107; color: white; }
                .badge-info { background: #17a2b8; color: white; }
                .badge-danger { background: #dc3545; color: white; }
                .badge-secondary { background: #6c757d; color: white; }
                .row { display: flex; gap: 20px; }
                .col-4 { flex: 1; }
                .mt-3 { margin-top: 16px; }
                @media print { body { background: white; padding: 20px; } .container { box-shadow: none; } }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div>
                        <h2>🏢 RH Gestion</h2>
                        <p>SIRET : 123 456 789 00010</p>
                        <p>📞 +33 1 23 45 67 89</p>
                    </div>
                    <div class="header-right">
                        <h2>FICHE DE PAIE</h2>
                        <p>${this.getNomMois()} ${this.annee}</p>
                        <span class="badge">${this.salaire.estPaye ? '✅ Payé' : '⏳ En attente'}</span>
                    </div>
                </div>

                <!-- Employee Info -->
                <div class="employee-info">
                    <div>
                        <p><strong>Employé :</strong> ${this.salaire.utilisateurPrenom} ${this.salaire.utilisateurNom}</p>
                        <p><strong>Rôle :</strong> ${this.salaire.utilisateurRole}</p>
                    </div>
                    <div style="text-align:right;">
                        <p><strong>Date de calcul :</strong> ${new Date(this.salaire.dateCalcul).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Statut :</strong> ${this.salaire.estPaye ? 'Payé' : 'En attente'}</p>
                    </div>
                </div>

                <!-- Heures -->
                <div class="section">
                    <div class="section-title">📊 Détail des heures</div>
                    <table class="table table-bordered">
                        <tr>
                            <td><strong>Heures normales</strong></td>
                            <td class="text-end">${this.salaire.heuresNormales} h</td>
                            <td class="text-end">${this.salaire.tauxHoraire} €/h</td>
                            <td class="text-end fw-bold">${this.salaire.salaireBase.toFixed(2)} €</td>
                        </tr>
                        <tr>
                            <td><strong>Heures supplémentaires</strong></td>
                            <td class="text-end">${this.salaire.heuresSupplementaires} h</td>
                            <td class="text-end">${this.salaire.tauxHoraireSupp} €/h</td>
                            <td class="text-end fw-bold">${this.salaire.salaireSupplementaire.toFixed(2)} €</td>
                        </tr>
                        <tr>
                            <td><strong>Heures dimanche</strong></td>
                            <td class="text-end">${this.salaire.heuresDimanche} h</td>
                            <td class="text-end">${this.salaire.tauxHoraireDimanche} €/h</td>
                            <td class="text-end fw-bold">${this.salaire.salaireDimanche.toFixed(2)} €</td>
                        </tr>
                        <tr>
                            <td><strong>Heures d'absence</strong></td>
                            <td class="text-end">${this.salaire.heuresAbsences} h</td>
                            <td class="text-end">-</td>
                            <td class="text-end text-danger">-</td>
                        </tr>
                    </table>
                </div>

                <!-- Primes -->
                <div class="section" style="${this.salaire.primeAnciennete || this.salaire.primeResponsabilite || this.salaire.primePerformance ? '' : 'display:none;'}">
                    <div class="section-title">🎯 Primes</div>
                    <table class="table table-bordered">
                        ${this.salaire.primeAnciennete > 0 ? `<tr><td>Prime ancienneté</td><td class="text-end fw-bold text-success">${this.salaire.primeAnciennete.toFixed(2)} €</td></tr>` : ''}
                        ${this.salaire.primeResponsabilite > 0 ? `<tr><td>Prime responsabilité</td><td class="text-end fw-bold text-success">${this.salaire.primeResponsabilite.toFixed(2)} €</td></tr>` : ''}
                        ${this.salaire.primePerformance > 0 ? `<tr><td>Prime performance</td><td class="text-end fw-bold text-success">${this.salaire.primePerformance.toFixed(2)} €</td></tr>` : ''}
                    </table>
                </div>

                <!-- Lignes détaillées -->
                <div class="section">
                    <div class="section-title">📝 Détail des gains et déductions</div>
                    <table class="table table-bordered">
                        <thead>
                            <tr><th>Libellé</th><th>Type</th><th style="text-align:right;">Montant</th></tr>
                        </thead>
                        <tbody>
                            ${lignesHTML}
                        </tbody>
                    </table>
                </div>

                <!-- Total -->
                <div class="section">
                    <div class="section-title">💰 Récapitulatif</div>
                    <div class="row">
                        <div class="col-4">
                            <div class="total-box">
                                <label>SALAIRE BRUT</label>
                                <h3 class="text-primary">${this.salaire.salaireBrut.toFixed(2)} €</h3>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="total-box">
                                <label>COTISATIONS + IMPÔTS</label>
                                <h3 class="text-danger">- ${(this.salaire.cotisationsSociales + this.salaire.impots).toFixed(2)} €</h3>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="total-net">
                                <label>SALAIRE NET</label>
                                <h2>${this.salaire.salaireNet.toFixed(2)} €</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    Fiche de paie générée automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                </div>
            </div>
            <script>
                // Auto-print après chargement
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
        `;

    printWindow.document.write(html);
    printWindow.document.close();
    this.toastr.success(
      'Fiche de paie ouverte dans une nouvelle fenêtre',
      '✅ Succès',
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
