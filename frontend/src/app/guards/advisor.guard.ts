import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { getUser } from '../selectors/user.selectors';
import { take } from 'rxjs';

export const advisorGuard: CanActivateFn = (route, state) => {
  const store = inject(Store<State>)
  const router = inject(Router)
  let activate = false;
  store.select(getUser).pipe(take(1)).subscribe(user => {
    if(user.roles && user.roles.includes('advisor')) {
      activate = true;
    }
  });
  if(!activate) {
    router.navigate(['/app/dashboard'])
  }
  return activate;
};
