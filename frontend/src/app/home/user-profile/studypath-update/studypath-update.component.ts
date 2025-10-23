import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getUser } from 'src/app/selectors/user.selectors';
import { User } from '../../../../../../interfaces/user';
import { State } from 'src/app/reducers';

@Component({
    selector: 'app-studypath-update',
    templateUrl: './studypath-update.component.html',
    styleUrl: './studypath-update.component.scss',
    standalone: false
})
export class StudypathUpdateComponent implements OnInit {
  user$: Observable<User>;

  constructor(
    private store: Store<State>,
  ) { }

  ngOnInit(): void {
    this.user$ = this.store.select(getUser);
  }
}
