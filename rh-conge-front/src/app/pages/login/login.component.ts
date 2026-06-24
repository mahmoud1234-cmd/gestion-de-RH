import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center align-items-center min-vh-75">
        <div class="col-md-6 col-lg-4">
          <div class="card fade-in-up p-4">
            <div class="text-center mb-4">
              <div class="mb-3">
                <img
                  src="images.png"
                  alt="Logo ST2I"
                  class="login-logo"
                />
              </div>
              <h3 class="fw-bold" style="color: #2d3748;">ST2I</h3>
              <p class="text-muted">Connectez-vous à votre compte</p>
            </div>

            <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  <i class="fas fa-envelope me-2"></i>Email
                </label>
                <input
                  type="email"
                  class="form-control"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="exemple@rh.com"
                  required
                  [class.is-invalid]="submitted && !email"
                />
                <div class="invalid-feedback" *ngIf="submitted && !email">
                  L'email est requis
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  <i class="fas fa-lock me-2"></i>Mot de passe
                </label>
                <input
                  type="password"
                  class="form-control"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  [class.is-invalid]="submitted && !password"
                />
                <div class="invalid-feedback" *ngIf="submitted && !password">
                  Le mot de passe est requis
                </div>
              </div>

              <!-- ✅ reCAPTCHA "Je ne suis pas un robot" -->
              <div class="mb-3 text-center">
                <div
                  #captchaContainer
                  class="d-flex justify-content-center"
                ></div>
                <div
                  class="text-danger small mt-1"
                  *ngIf="submitted && !captchaResolved"
                >
                  Veuillez confirmer que vous n'êtes pas un robot
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                [disabled]="loading || !captchaResolved"
              >
                <i class="fas fa-spinner fa-spin me-2" *ngIf="loading"></i>
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </form>

            <div class="text-center mt-4">
              <p class="text-muted mb-0">
                Pas encore de compte ?
                <a
                  routerLink="/register"
                  class="fw-semibold text-primary text-decoration-none"
                >
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fade-in-up {
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
      .min-vh-75 {
        min-height: 75vh;
      }
      .g-recaptcha {
        display: flex;
        justify-content: center;
      }
      .login-logo {
        height: 90px;
        width: auto;
        object-fit: contain;
        border-radius: 12px;
        filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
      }
    `,
  ],
})
export class LoginComponent implements AfterViewInit {
  email = '';
  password = '';
  loading = false;
  submitted = false;
  captchaResolved = false;
  captchaResponse: string = '';
  widgetId: any = null;

  // ✅ Remplace par ta SITE KEY Google reCAPTCHA
  siteKey = '6LeInTAtAAAAAHOWW9tMALJIiUBd6-aAgn0CuDKP';

  @ViewChild('captchaContainer', { static: false })
  captchaContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit() {
    // ✅ Attendre que le script soit chargé
    this.loadCaptcha();
  }

  loadCaptcha() {
    try {
      if (
        typeof grecaptcha !== 'undefined' &&
        typeof grecaptcha.render === 'function' &&
        this.captchaContainer
      ) {
        // Vider le conteneur
        this.renderer.setProperty(
          this.captchaContainer.nativeElement,
          'innerHTML',
          '',
        );

        grecaptcha.ready(() => {
          this.widgetId = grecaptcha.render(
            this.captchaContainer.nativeElement,
            {
              sitekey: this.siteKey,
              callback: (response: string) => {
                this.onResolve(response);
              },
              'expired-callback': () => {
                this.onExpire();
              },
              'error-callback': () => {
                this.onError();
              },
            },
          );
        });
      } else {
        // Réessayer après un délai si grecaptcha n'est pas chargé
        setTimeout(() => this.loadCaptcha(), 500);
      }
    } catch (error) {
      console.error('Erreur chargement captcha:', error);
      setTimeout(() => this.loadCaptcha(), 1000);
    }
  }

  // ✅ Quand le captcha est résolu
  onResolve(response: string) {
    this.captchaResolved = true;
    this.captchaResponse = response;
    console.log('✅ Captcha résolu');
  }

  // ✅ Quand le captcha expire
  onExpire() {
    this.captchaResolved = false;
    this.captchaResponse = '';
    this.toastr.warning(
      "Veuillez confirmer que vous n'êtes pas un robot",
      '⚠️ Attention',
    );
  }

  // ✅ En cas d'erreur
  onError() {
    this.captchaResolved = false;
    this.toastr.error('Erreur de vérification captcha', '❌ Erreur');
  }

  onSubmit() {
    this.submitted = true;

    // ✅ Vérifier que le captcha est résolu
    if (!this.captchaResolved) {
      this.toastr.error(
        "Veuillez confirmer que vous n'êtes pas un robot",
        '❌ Erreur',
      );
      return;
    }

    if (!this.email || !this.password) return;

    this.loading = true;
    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: (user) => {
          this.authService.saveUser(user);
          this.toastr.success('Bienvenue !', 'Connexion réussie');

          if (user.role === 'MANAGER') {
            this.router.navigate(['/dashboard-rh']);
          } else {
            this.router.navigate(['/employee']);
          }
        },
        error: () => {
          this.toastr.error('Email ou mot de passe incorrect', 'Erreur');
          this.loading = false;
        },
      });
  }
}
