import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserActions } from 'src/app/actions/user.actions';
import { getHints } from 'src/app/selectors/user.selectors';

@Component({
    selector: 'app-hint',
    templateUrl: './hint.component.html',
    styleUrls: ['./hint.component.scss'],
    standalone: false
})
export class HintComponent {

  @Input() key: string;
  @Input() hintMessage: string;
  @Input() hintType: string; // does not need to be set for neutral (petrol) hint
  showHint$: Observable<boolean>;

  constructor(private store: Store) { }

  ngOnInit() {
    this.showHint$ = this.store.select(getHints).pipe(
      map(hints => {
        const hint = hints?.find(hint => hint.key === this.key);
        return hint ? !hint.hasConfirmed : false;
      })
    );
  }

  confirmHint() {
    if (this.key) {
      this.store.dispatch(UserActions.updateHint({ key: this.key, hasConfirmed: true }));
    }
  }

  get alertClass() {
    switch (this.hintType) {
      case 'warning': return 'hint-warning';
      case 'danger': return 'hint-danger';
      default: return 'info-box-petrol';
    }
  }
}
