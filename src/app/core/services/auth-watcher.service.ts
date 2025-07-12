import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter, combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthWatcherService implements OnDestroy {
  readonly publicRoutes: string[] = ['/login', '/register'];
  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService, private router: Router) {
    combineLatest([
      this.auth.isAuthenticated$,
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      )
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([isAuthenticated, navEvent]) => {
      const currentUrl = (navEvent as NavigationEnd).urlAfterRedirects;
      const cleanUrl = currentUrl.split('?')[0].split('#')[0];

      const isPublicRoute = this.publicRoutes.some(route =>
        cleanUrl.startsWith(route)
      );

      if (!isAuthenticated && !isPublicRoute) {
        this.router.navigate(['/login']);
        auth.clearUser();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
