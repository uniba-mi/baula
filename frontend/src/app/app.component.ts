import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '@interfaces/user';
import { getUser } from './selectors/user.selectors';
import { config } from '../environments/config.local';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AppComponent implements OnInit {
  private store = inject(Store);

  user$: Observable<User>;
  homeUrl: string;

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);

    // check user and set homeUrl
    this.user$.subscribe((user) => {
      if (user.shibId == '') {
        this.homeUrl = config.homeUrl;
      } else {
        this.homeUrl = config.dashboardUrl;
      }
    });
  }
}
