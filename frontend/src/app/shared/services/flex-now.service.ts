import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { concatMap, filter, map, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { UserActions } from 'src/app/actions/user.actions';
import { ConfirmationDialogComponent, ConfirmationDialogData } from 'src/app/dialog/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent, DialogData } from 'src/app/dialog/dialog.component';
import { Semester } from '../../../../../interfaces/semester';
import { Consent } from '../../../../../interfaces/user';
import { getLastConsentByType } from 'src/app/selectors/user.selectors';

@Injectable({
  providedIn: 'root'
})
export class FlexnowService {

  lastFlexnowApiConsent$: Observable<Consent | null>;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private store: Store
  ) {
    this.lastFlexnowApiConsent$ = this.store.select(getLastConsentByType('flexnow-api'));
  }

  triggerFlexNowDataLoading(semesters$: Observable<Semester[]>) {
    this.lastFlexnowApiConsent$.pipe(
      take(1),
      concatMap(consent => {
        // if user has already consented, we can skip the consent step
        if (consent?.hasConfirmed) {
          return of(true);
        } else {
          return this.openConsentDialog();
        }
      }),
      filter(consentResult => consentResult === true),
      concatMap(() => // open semester selection dialog anyway
        this.openSemesterSelectionDialog(semesters$)
      ),
      filter(selectedSemesters => selectedSemesters !== null),
      concatMap((selectedSemesters: string[]) =>
        this.openOverwriteConfirmationDialog(selectedSemesters)
      ),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  openConsentDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: <DialogData>{
        dialogContentId: 'upload-student-data-dialog',
      },
    });

    return dialogRef.afterClosed().pipe(
      tap(result => {
        if (result) {
          this.store.dispatch(UserActions.addConsent({
            ctype: 'flexnow-api',
            hasConfirmed: true,
            hasResponded: true,
            timestamp: new Date()
          }));
        }
      }), map(result => !!result) // boolean
    );
  }

  // only pass in the semesters we need
  openSemesterSelectionDialog(semesters$: Observable<Semester[]>) {

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        dialogTitle: 'Semester wählen',
        dialogContentId: 'select-semester-dialog',
        semesters$: semesters$,
        mode: 'multi',
      },
    });

    return dialogRef.afterClosed().pipe(
      map(result => (result && result.length > 0) ? result : null)
    );
  }

  openOverwriteConfirmationDialog(semesters: string[]): Observable<boolean> {

    const confirmationDialogInterface: ConfirmationDialogData = {
      dialogTitle: 'Ausgewählte Semester mit den FlexNow-Daten überschreiben?',
      actionType: 'overwrite',
      confirmationItem: 'deine ausgewählten Semester',
      confirmButtonLabel: 'Überschreiben',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonClass: 'btn btn-danger',
      callbackMethod: () => {
        this.getFlexNowData(semesters);
        this.dialog.closeAll()
      },
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: confirmationDialogInterface,
    });

    return dialogRef.afterClosed().pipe(
      tap(result => {
        if (result) {
          this.getFlexNowData(semesters);
        }
      }),
      map(result => !!result)
    );
  }

  // TODO extraction logic
  getFlexNowData(semesters: string[]) {
    console.log('getting FN data now for semesters', semesters)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
