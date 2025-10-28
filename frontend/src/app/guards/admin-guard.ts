import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../reducers';
import { getUser } from '../selectors/user.selectors';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard  {

  constructor(private store: Store<State>, private router: Router) { }

  canActivate(): boolean {
    let activate = false;
    this.store.select(getUser).pipe(take(1)).subscribe(user => {
      if(user.roles && user.roles.includes('admin')) {
        activate = true;
      }
    });
    if(!activate) {
      this.router.navigate(['/app/dashboard'])
    }
    return activate;

  }
}
