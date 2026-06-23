import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './pages/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .main-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 16px 16px 16px;
      }

      @media (min-width: 768px) {
        .main-content {
          padding: 0 24px 24px 24px;
        }
      }
    `,
  ],
})
export class AppComponent {}
