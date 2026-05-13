import { Component, Input } from '@angular/core';
import { ExtendedModuleGroup } from '../../../../../interfaces/module-group';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';

@Component({
    selector: 'app-change-module-group-dialog',
    templateUrl: './change-module-group-dialog.component.html',
    styleUrl: './change-module-group-dialog.component.scss',
    standalone: false
})
export class ChangeModuleGroupDialogComponent {
  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  @Input() acronym: string | undefined;
  selectedModuleGroup: string;

  constructor(private store: Store) { }

  selectModuleGroup(group: string) {
    this.selectedModuleGroup = group;
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }
}