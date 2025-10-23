import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AimModalComponent } from 'src/app/modules/aim-modal/aim-modal/aim-modal.component';
import { State } from 'src/app/reducers';
import { Store } from '@ngrx/store';
import { CompetenceAimsActions } from 'src/app/actions/user.actions';

@Component({
    selector: 'app-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    styleUrls: ['./welcome-dialog.component.scss'],
    standalone: false
})
export class WelcomeDialogComponent {
  constructor(private store: Store<State>, public dialog: MatDialog) {}

  openCompetenceAimForm() {
    this.dialog.open(AimModalComponent)
  }

  createEmptyAim() {
    this.store.dispatch(CompetenceAimsActions.updateCompetenceAims({ aims: []}))
  }
}
