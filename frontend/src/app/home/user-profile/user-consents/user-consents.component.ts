import { Component } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Consent, ConsentType } from '../../../../../../interfaces/user';
import { getLastConsentByType } from 'src/app/selectors/user.selectors';
import { Store } from '@ngrx/store';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { UserActions } from 'src/app/actions/user.actions';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PrivacyStatementComponent } from 'src/app/modules/long-term-evaluation/privacy-statement/privacy-statement.component';

@Component({
  selector: 'app-user-consents',
  standalone: false,
  templateUrl: './user-consents.component.html',
  styleUrl: './user-consents.component.scss'
})
export class UserConsentsComponent {
  lastBaKuLeSurveyConsent$: Observable<Consent | null>;


  constructor(private store: Store, private dialog: MatDialog) {
    this.lastBaKuLeSurveyConsent$ = this.store.select(getLastConsentByType('bakule-survey'));
  }

  openConsentDialog(type: ConsentType) {
    this.store.select(getLastConsentByType(type)).pipe(take(1)).subscribe(consent => {
      if (!consent) return;

      const isConfirmed = consent.hasConfirmed;

      const confirmationDialogInterface: ConfirmationDialogData | undefined = this.returnConfirmationDialogInterface(type, isConfirmed);

      if(confirmationDialogInterface) {
        this.dialog.open(ConfirmationDialogComponent, {
          data: confirmationDialogInterface,
        });
      }
    });
  }

  private returnConfirmationDialogInterface(type: ConsentType, isConfirmed: boolean): ConfirmationDialogData | undefined {
    switch (type) {
      case 'bakule-survey':
        return {
          dialogTitle: isConfirmed ? 'Einwilligung zum Evaluations- und Forschungsvorhaben widerrufen?' : 'Einwilligung zum Evaluations- und Forschungsvorhaben geben?',
          actionType: isConfirmed ? 'delete' : 'confirm',
          confirmationItem: isConfirmed ? 'deine Einwilligung zum Evaluations- und Forschungsvorhaben' : 'Einwilligung zum Evaluations- und Forschungsvorhaben',
          confirmButtonLabel: isConfirmed ? 'Widerrufen' : 'Einwilligung geben',
          cancelButtonLabel: 'Abbrechen',
          confirmButtonClass: isConfirmed ? 'btn btn-danger' : 'btn btn-primary',
          warningMessage: isConfirmed ? 'Der Widerruf betrifft nur zukünftige Umfragen, die bisherige Teilnahme an der Umfrage wird direkt mit Abgabe anonymisiert und lässt sich somit nicht mehr deinem Nutzerprofil zuordnen.' : '', // TODO change empty fallback after : back to this after FlexNow is integrated: Bitte beachte, dass du den Abruf deines Studienverlaufs aus FlexNow durch deine Zustimmung aus technischen Gründen erst nach dem nächsten Login nutzen kannst.
          callbackMethod: () => {
            this.updateConsent(type, !isConfirmed);
          },
        };
    
      default:
        return;
    }
  }

  private updateConsent(type: ConsentType, hasConfirmed: boolean) {
    this.store.dispatch(UserActions.addConsent({
      ctype: type,
      hasConfirmed: hasConfirmed,
      hasResponded: true,
      timestamp: new Date()
    }));
    this.dialog.closeAll();
  }

  openPrivacyStatement() {
    this.dialog.open(PrivacyStatementDialog)
  }
}

@Component({
  template: `<mat-dialog-content>
      <lte-privacy-statement></lte-privacy-statement>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button class="btn btn-primary" mat-dialog-close>Okay</button>
    </mat-dialog-actions>
    `,
  imports: [
    MatDialogModule,
    PrivacyStatementComponent
  ],
})
class PrivacyStatementDialog {}