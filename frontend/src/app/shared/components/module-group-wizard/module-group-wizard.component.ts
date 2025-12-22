import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SimilarityService } from '../../services/similarity.service';
import { Observable, take } from 'rxjs';
import { ExtendedModuleGroup } from '../../../../../../interfaces/module-group';

@Component({
    selector: 'app-module-group-wizard',
    templateUrl: './module-group-wizard.component.html',
    styleUrl: './module-group-wizard.component.scss',
    standalone: false
})
export class ModuleGroupWizardComponent {

  @Input() mgId: string | undefined;
  @Input() structuredModuleGroups$: Observable<ExtendedModuleGroup[]>;
  @Output() groupSelected = new EventEmitter<string>();
  similarGroups: ExtendedModuleGroup[] = [];
  showRecommendations: boolean = false;

  constructor(private similarityService: SimilarityService) { }

  ngOnInit() {
    this.showSimilarGroups();
  }

  toggleRecommendations() {
    this.showRecommendations = !this.showRecommendations;
  }

  showSimilarGroups() {

    if (!this.mgId) {
      return;
    }

    this.structuredModuleGroups$.pipe(take(1)).subscribe(groups => {
      const groupsWithSimilarity = groups.map(group => {
        const similarity = this.similarityService.calculateSimilarityScore(this.mgId as string, group.path);
        return { group, similarity };
      });

      this.similarGroups = groupsWithSimilarity
        .filter(item => item.similarity > 0.9)
        .sort((a, b) => b.similarity - a.similarity)
        .map(item => item.group);
    });
  }

  selectSimilarGroup(mgId: string) {
    this.groupSelected.emit(mgId);
  }
}
