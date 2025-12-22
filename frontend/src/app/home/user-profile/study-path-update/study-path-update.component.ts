import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getUser } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../../interfaces/user';
import { State } from 'src/app/reducers';

@Component({
    selector: 'app-study-path-update',
    templateUrl: './study-path-update.component.html',
    styleUrl: './study-path-update.component.scss',
    standalone: false
})
export class StudyPathUpdateComponent implements OnInit {
  user$: Observable<User>;

  constructor(
    private store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
  }
}
