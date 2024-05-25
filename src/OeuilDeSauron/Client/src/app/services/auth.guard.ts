// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user.isAuthenticated) {
        return true;
      } else {
        router.navigate(['/auth/login']); // redirect to login if not authenticated
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/auth/login']); // redirect to login on error
      return of(false); // return an observable
    })
  );
};
