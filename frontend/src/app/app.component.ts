import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../../interfaces/user';
import { getUser } from './selectors/user.selectors';
import { config } from 'src/environments/config.local';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})

export class AppComponent implements OnInit {
  user$: Observable<User>;
  homeUrl: string;

  constructor(private store: Store) { }

  ngOnInit(): void {

    this.user$ = this.store.select(getUser);

    // check user and set homeUrl
    this.user$.subscribe(user => {
      if (user.shibId == '') {
        this.homeUrl = config.homeUrl
      } else {
        this.homeUrl = config.dashboardUrl
      }
    });
  }
}