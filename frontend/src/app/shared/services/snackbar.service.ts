import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Alert } from '../classes/alert';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private _snackBar: MatSnackBar, private router: Router,
  ) { }

  openSnackBar(alert: Alert, actionButtonText?: string, actionHandler?: () => void) {
    let snackBarRef = this._snackBar.open(alert.message, actionButtonText || undefined, {
      panelClass: ['alert', 'alert-'.concat(alert.type)],
      duration: 5000
    });

    if (actionButtonText && actionHandler) {
      snackBarRef.onAction().subscribe(() => {
        actionHandler();
      });
    }
  }
}
