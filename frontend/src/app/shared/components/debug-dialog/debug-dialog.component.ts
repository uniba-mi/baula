import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogComponent } from 'src/app/dialog/dialog.component';
import { FnUser } from '../../../../../../interfaces/fn-user';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';
import { Store } from '@ngrx/store';
import { getStructuredModuleGroups } from 'src/app/selectors/module-overview.selectors';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-debug-dialog',
  standalone: false,
  templateUrl: './debug-dialog.component.html',
  styleUrl: './debug-dialog.component.scss',
})
export class DebugDialogComponent {
  moduleGroups$: Observable<ExtendedModuleGroup[]>;
  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FnUser
  ) { }

  ngOnInit(): void { 
    this.moduleGroups$ = this.store.select(getStructuredModuleGroups)
  }

  findModuleGroup(mgId: string): Observable<ExtendedModuleGroup | undefined> {
    return this.moduleGroups$.pipe(
      map(mgs => mgs.find(mg => mg.mgId == mgId))
    )
  }

  trackByCombinedKey(key1: string, key2: string): string {
    return `${key1}-${key2}`
  }
}
