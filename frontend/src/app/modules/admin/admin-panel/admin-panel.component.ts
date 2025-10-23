import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { User } from '../../../../../../interfaces/user';
import { getUser } from 'src/app/selectors/user.selectors';

@Component({
    selector: 'admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrl: './admin-panel.component.scss',
    standalone: false
})
export class AdminPanelComponent implements OnInit {
  user$: Observable<User>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);   
  }
}
