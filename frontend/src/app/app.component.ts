import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '@interfaces/user';
import { getUser } from './selectors/user.selectors';
import { config } from '../environments/config.local';
import { LocaleService } from './shared/services/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private locale = inject(LocaleService);

  user$: Observable<User>;
  homeUrl: string;

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);

    // check user and set homeUrl
    this.user$.subscribe((user) => {
      if (user.shibId == '') {
        this.homeUrl = this.locale.localizeUrl(config.homeUrl);
      } else {
        this.homeUrl = this.locale.localizeUrl(config.dashboardUrl);
      }
    });
  }
}
