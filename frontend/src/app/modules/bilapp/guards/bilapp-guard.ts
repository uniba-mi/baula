import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { getUserStudyprogrammes } from 'src/app/selectors/user.selectors';

@Injectable({
  providedIn: 'root'
})
export class BilappGuard  {

  constructor(private store: Store<State>, private router: Router) { }

  canActivate(): boolean {
    let activate = false;
    this.store.select(getUserStudyprogrammes).subscribe(sps => {
      if(sps) {
        for(let sp of sps) {
          // assumption that teacher education sps start with LA and if EWS part is referenced ends with EWS
          if(sp.spId.startsWith('LA') && sp.spId.endsWith('EWS')) {
            activate = true;
          }
        }
      }
    });
    if(!activate) {
      this.router.navigate(['/app/dashboard'])
    }
    return activate;
  }
}
