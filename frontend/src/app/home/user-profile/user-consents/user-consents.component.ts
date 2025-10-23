import { Component } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Consent } from '../../../../../../interfaces/user';
import { getLastConsentByType } from 'src/app/selectors/user.selectors';
import { Store } from '@ngrx/store';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { UserActions } from 'src/app/actions/user.actions';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-consents',
  standalone: false,
  templateUrl: './user-consents.component.html',
  styleUrl: './user-consents.component.scss'
})
export class UserConsentsComponent {

  lastPrivacyChangeConsent$: Observable<Consent | null>;


  constructor(private store: Store, private dialog: MatDialog) {
    this.lastPrivacyChangeConsent$ = this.store.select(getLastConsentByType('2512-privacy-change'));
  }

  openPrivacyConsentDialog() {
    this.lastPrivacyChangeConsent$.pipe(take(1)).subscribe(consent => {
      if (!consent) return;

      const isConfirmed = consent.hasConfirmed;

      const confirmationDialogInterface: ConfirmationDialogData = {
        dialogTitle: isConfirmed ? 'Einwilligung zur Datenschutzerklärung widerrufen?' : 'Einwilligung zur Datenschutzerklärung geben?',
        actionType: isConfirmed ? 'delete' : 'confirm',
        confirmationItem: isConfirmed ? 'deine Einwilligung zur aktualisierten Datenschutzerklärung' : 'der aktualisierten Datenschutzerklärung',
        confirmButtonLabel: isConfirmed ? 'Widerrufen' : 'Einwilligung geben',
        cancelButtonLabel: 'Abbrechen',
        confirmButtonClass: isConfirmed ? 'btn btn-danger' : 'btn btn-primary',
        warningMessage: isConfirmed ? 'Nach dem Widerruf kannst du deinen Account noch bis zum 30.11.2025 nutzen, danach wird er jedoch gelöscht.' : '', // TODO change empty fallback after : back to this after FlexNow is integrated: Bitte beachte, dass du den Abruf deines Studienverlaufs aus FlexNow durch deine Zustimmung aus technischen Gründen erst nach dem nächsten Login nutzen kannst.
        callbackMethod: () => {
          this.updatePrivacyConsent(!isConfirmed);
        },
      };

      this.dialog.open(ConfirmationDialogComponent, {
        data: confirmationDialogInterface,
      });
    });
  }

  updatePrivacyConsent(hasConfirmed: boolean) {
    this.store.dispatch(UserActions.updateConsent({
      ctype: '2512-privacy-change',
      hasConfirmed: hasConfirmed,
      hasResponded: true,
      timestamp: new Date()
    }));
    this.dialog.closeAll();
  }
}