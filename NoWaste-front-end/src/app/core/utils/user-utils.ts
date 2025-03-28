
import { Observable } from 'rxjs';
import {AuthService} from '../services/authentication/auth.service';

export function getCurrentUserDetails(authService: AuthService): Observable<any> {
  const basicUser = authService.getCurrentUser();

  if (basicUser && basicUser.id) {
    return authService.getUserById(basicUser.id);
  } else {
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }
}
