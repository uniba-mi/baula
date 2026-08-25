import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../../../../interfaces/user';
import { getUser } from 'src/app/selectors/user.selectors';
import { UserActions } from 'src/app/actions/user.actions';
import { SearchActions } from 'src/app/actions/search-settings.actions';
import { FlexnowService } from 'src/app/shared/services/flex-now.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UserDataComponent implements OnInit {
  private store = inject(Store);
  private flexnowService = inject(FlexnowService);

  user$: Observable<User>;

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
  }

  updateUserData(user: User) {
    // reset search settings to prevent filter issues
    this.store.dispatch(
      SearchActions.resetSearchSettings({ context: 'module-overview' }),
    );
    this.store.dispatch(UserActions.updateUser({ user }));
  }

  importFlexNowMetadata() {
    this.flexnowService.triggerFlexNowDataLoading('update-metadata');
  }

  checkFlexNowAvailability(user: User): boolean {
    return this.flexnowService.flexNowImportEnabled(user)
  }
}
