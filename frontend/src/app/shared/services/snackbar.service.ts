import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Alert } from '../classes/alert';
import { LoadingComponent } from '../components/loading/loading.component';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private _snackBar = inject(MatSnackBar);

  openSnackBar(
    alert: Alert,
    actionButtonText?: string,
    actionHandler?: () => void,
  ) {
    let snackBarRef = this._snackBar.open(
      alert.message,
      actionButtonText || undefined,
      {
        panelClass: ['alert', 'alert-'.concat(alert.type)],
        duration: 5000,
      },
    );

    if (actionButtonText && actionHandler) {
      snackBarRef.onAction().subscribe(() => {
        actionHandler();
      });
    }
  }

  openLoaderSnackbar(
    message: string
  ) {
    this._snackBar.openFromComponent(
      LoadingComponent, {
        data: {
          message
        },
        panelClass: ['alert', 'alert-primary']
      }
    )
  }
}
