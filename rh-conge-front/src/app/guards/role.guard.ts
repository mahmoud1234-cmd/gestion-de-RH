import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getUser();
    const requiredRole = route.data['role'];

    if (user && user.role === requiredRole) {
      return true;
    }

    this.router.navigate(['/employee']);
    return false;
  }
}
