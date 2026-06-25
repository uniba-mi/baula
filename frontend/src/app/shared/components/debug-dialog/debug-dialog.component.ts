import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogComponent } from 'src/app/dialog/dialog.component';
import { FnUser } from '../../../../../../interfaces/fn-user';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { Store } from '@ngrx/store';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { map, Observable } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { AlertType } from '../../classes/alert';

@Component({
  selector: 'app-debug-dialog',
  standalone: false,
  templateUrl: './debug-dialog.component.html',
  styleUrl: './debug-dialog.component.scss',
})
export class DebugDialogComponent {
  private store = inject(Store);
  dialogRef = inject<MatDialogRef<DialogComponent>>(MatDialogRef);
  data = inject<FnUser>(MAT_DIALOG_DATA);
  private snackbar = inject(SnackbarService);

  moduleGroups$: Observable<ExtendedModuleGroup[]>;

  ngOnInit(): void {
    this.moduleGroups$ = this.store.select(getStructuredModuleGroups);
  }

  findModuleGroup(mgId: string): Observable<ExtendedModuleGroup | undefined> {
    return this.moduleGroups$.pipe(
      map((mgs) => mgs.find((mg) => mg.mgId == mgId)),
    );
  }

  trackByCombinedKey(key1: string, key2: string): string {
    return `${key1}-${key2}`;
  }

  copyToClipboard(data: any) {
    if (typeof data == 'object') {
      data = JSON.stringify(data, null, 2);
    }
    navigator.clipboard.writeText(data);
    this.snackbar.openSnackBar({
      type: AlertType.SUCCESS,
      message: 'Die Daten wurden in die Zwischenablage kopiert.',
    });
  }
}
