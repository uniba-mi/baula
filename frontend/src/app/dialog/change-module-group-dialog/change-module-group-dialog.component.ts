import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExtendedModuleGroup } from '../../../../../interfaces/module-group';
import { Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { closeDialogMode } from 'src/app/actions/dialog.actions';
import { SimilarityService } from 'src/app/shared/services/similarity.service';

@Component({
    selector: 'app-change-module-group-dialog',
    templateUrl: './change-module-group-dialog.component.html',
    styleUrl: './change-module-group-dialog.component.scss',
    standalone: false
})
export class ChangeModuleGroupDialogComponent {

  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  @Input() showMgWizard: boolean;
  mgForm: FormGroup;
  similarGroups: ExtendedModuleGroup[];
  showRecommendations: boolean = false;

  constructor(private store: Store, private fb: FormBuilder, private similarityService: SimilarityService) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.structuredModuleGroups$.subscribe(groups => {
      const currentGroup = groups.find(group => group.mgId === this.mgId);
      this.mgForm = this.fb.group({
        mgId: [currentGroup ? currentGroup.mgId : '', Validators.required]
      });
    });
  }

  close(mode: string) {
    this.store.dispatch(closeDialogMode({ mode }));
  }

  selectSimilarGroup(mgId: string): void {
    this.mgForm.get('mgId')?.setValue(mgId);
    this.showRecommendations = false;
  }
}