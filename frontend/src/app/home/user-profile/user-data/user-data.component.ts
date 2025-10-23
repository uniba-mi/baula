import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../../../../interfaces/user';
import { getUser } from 'src/app/selectors/user.selectors';
import { UserActions } from 'src/app/actions/user.actions';
import { SearchActions } from 'src/app/actions/search-settings.actions';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.scss',
  standalone: false
})
export class UserDataComponent implements OnInit {
  user$: Observable<User>;

  constructor(
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
  }

  updateUserData(user: User) {
    // reset search settings to prevent filter issues
    this.store.dispatch(SearchActions.resetSearchSettings({ context: 'module-overview' }));
    this.store.dispatch(UserActions.updateUser({ user }));
  }
}
